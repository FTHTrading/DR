#!/usr/bin/env node
/**
 * DICS Daily PDF Report Generator
 *
 * 1. Queries Neon for daily brief data
 * 2. Builds "What Changed" narrative from recent high-impact claims
 * 3. Renders institutional HTML template
 * 4. Converts to PDF via Puppeteer
 * 5. Uploads to Cloudflare R2 (dics-reports bucket)
 * 6. Updates daily_briefs table with pdf_url
 *
 * Usage:
 *   node scripts/generate-daily-pdf.js
 *
 * Env:
 *   DATABASE_URL         — Neon connection string
 *   R2_ACCOUNT_ID        — Cloudflare account ID
 *   R2_ACCESS_KEY_ID     — R2 API token key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *   R2_BUCKET            — Bucket name (default: dics-reports)
 *   R2_PUBLIC_URL        — Public bucket URL (optional)
 */

const path = require('path');
const fs = require('fs');

// ── Load env ──────────────────────────────────────────────────────────
// Try collector/.env first, then root .env
const envPaths = [
  path.resolve(__dirname, '../collector/.env'),
  path.resolve(__dirname, '../.env'),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    try { require('dotenv').config({ path: p }); } catch {}
    break;
  }
}

const { Pool } = require('pg');
const renderBriefHTML = require('./templates/daily-brief');

// ── DB ────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(sql, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

// ── Sector labels for narrative translation ───────────────────────────
const SECTOR_LABELS = {
  energy: 'Energy & Power', mining: 'Mining & Resources', telecom: 'Telecoms & Digital',
  logistics: 'Logistics & Ports', finance: 'Finance & Capital', tourism: 'Tourism & Hospitality',
  macro: 'Macro & Regulatory',
};

// ── Phase / risk / capital helpers (mirrors dashboard narrative.ts) ───
function detectPhase(index) {
  if (index >= 75) return 'Critical';
  if (index >= 50) return 'Accelerating';
  if (index >= 25) return 'Building';
  return 'Monitoring';
}

function riskLevel(r) {
  if (r >= 0.7) return 'High';
  if (r >= 0.4) return 'Moderate';
  if (r >= 0.2) return 'Low';
  return 'Minimal';
}

function capitalWindow(idx, risk) {
  if (idx >= 60 && risk < 0.4) return 'Opening';
  if (idx >= 40 && risk < 0.5) return 'Neutral-Positive';
  if (risk >= 0.6) return 'Contracting';
  return 'Neutral';
}

// ── Translate a claim into plain-English "What Changed" ───────────────
function translateClaim(claim) {
  const sector = SECTOR_LABELS[claim.sector_normalized] || 'General';
  const stmt = claim.statement || '';

  // Build "why it matters" heuristic based on score dimensions
  const parts = [];
  if (claim.opportunity > 0.5) {
    parts.push('This creates favorable conditions for investment advancement.');
  }
  if (claim.risk > 0.5) {
    parts.push('Monitor this development for potential risk escalation.');
  } else if (claim.risk < 0.2) {
    parts.push('No adverse risk implications detected.');
  }
  if (claim.materiality > 0.6) {
    parts.push('High materiality — directly impacts project economics.');
  }
  if (claim.credibility > 0.7) {
    parts.push('Source credibility is strong.');
  }

  return {
    what: stmt,
    why: parts.join(' ') || 'Macro relevance noted.',
    sector: claim.sector_normalized || 'macro',
    score: claim.composite_score,
  };
}

// ── Generate executive summary ────────────────────────────────────────
function generateExecSummary({ sectors, claims24h, docs24h, convIdx, avgRisk }) {
  const rising = sectors.filter(s => s.trend === 'rising').map(s => SECTOR_LABELS[s.sector] || s.sector);
  const falling = sectors.filter(s => s.trend === 'falling').map(s => SECTOR_LABELS[s.sector] || s.sector);

  const parts = [];
  parts.push(`Over the last 24 hours, ${docs24h} source documents were processed yielding ${claims24h} scored intelligence claims.`);

  if (rising.length > 0) parts.push(`Positive momentum detected in ${rising.join(', ')}.`);
  if (falling.length > 0) parts.push(`Softening observed in ${falling.join(', ')}.`);
  if (rising.length === 0 && falling.length === 0) parts.push('All monitored sectors remain stable.');

  const phase = detectPhase(convIdx);
  parts.push(`Convergence Index: ${Math.round(convIdx)}/100 (${phase}).`);

  const rl = riskLevel(avgRisk);
  if (rl === 'High') parts.push('Elevated risk indicators warrant caution.');
  else if (rl === 'Moderate') parts.push('Risk levels are within acceptable bounds.');
  else parts.push('Risk environment is favorable for capital activity.');

  return parts.join(' ');
}

// ── Risk narrative ────────────────────────────────────────────────────
function generateRiskNarrative(avgRisk, sectors) {
  const level = riskLevel(avgRisk);
  const parts = [`Overall risk assessment: ${level}.`];
  if (level === 'High') parts.push('Multiple indicators suggest elevated uncertainty. Recommend delaying non-critical commitments.');
  else if (level === 'Moderate') parts.push('No new political instability indicators detected. Regulatory environment remains stable.');
  else parts.push('Risk environment is benign. No adverse signals detected across monitored sectors.');

  const risky = sectors.filter(s => s.avg_score < 0.4);
  if (risky.length > 0) parts.push(`Sectors with below-average signal strength: ${risky.map(s => SECTOR_LABELS[s.sector] || s.sector).join(', ')}.`);

  return parts.join(' ');
}

// ── Capital narrative ─────────────────────────────────────────────────
function generateCapitalNarrative(idx, risk) {
  const w = capitalWindow(idx, risk);
  const parts = [`Capital Window: ${w}.`];
  if (w === 'Opening') parts.push(`With convergence at ${Math.round(idx)}/100 and risk at ${riskLevel(risk).toLowerCase()}, conditions favor initiating capital conversations in the next 30–60 days.`);
  else if (w === 'Neutral-Positive') parts.push('Conditions are trending positive but have not yet reached the threshold for active capital deployment.');
  else if (w === 'Contracting') parts.push('Elevated risk indicators suggest postponing non-essential capital commitments.');
  else parts.push('Macro environment is neutral. Continue monitoring for phase changes.');
  return parts.join(' ');
}

// ── Asset narrative ───────────────────────────────────────────────────
function generateAssetNarrative(a) {
  const parts = [];
  if (a.opportunity_delta > 0) parts.push(`Opportunity indicators are positive (Δ +${(a.opportunity_delta * 100).toFixed(1)}%).`);
  if (a.risk_delta < -0.02) parts.push(`Risk profile has improved (Δ ${(a.risk_delta * 100).toFixed(1)}%).`);
  else if (a.risk_delta > 0.02) parts.push(`Risk indicators have increased slightly (Δ +${(a.risk_delta * 100).toFixed(1)}%). Monitor closely.`);
  else parts.push('Risk profile remains stable.');

  if (a.total_signals === 0) parts.push('No new intelligence signals in the reporting period.');
  else parts.push(`${a.total_signals} intelligence signals mapped to this asset.`);

  if (a.avg_impact > 0.15) parts.push('Current macro conditions are favorable for advancement.');
  else if (a.avg_impact > 0.05) parts.push('Macro environment is neutral. No compelling urgency detected.');
  else parts.push('Limited macro relevance in current signal flow.');

  return parts.join(' ');
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[pdf] Generating DICS Daily Brief for ${today}`);

  // 1. Counts
  const [{ docs_24h, claims_24h }] = await query(`
    SELECT
      (SELECT count(*) FROM documents WHERE fetched_at > now() - interval '24 hours')::int AS docs_24h,
      (SELECT count(*) FROM claims WHERE created_at > now() - interval '24 hours')::int AS claims_24h
  `);

  // 2. Sector momentum
  const sectorRows = await query(`
    WITH current AS (
      SELECT COALESCE(sector_normalized, 'macro') AS sector,
             count(*)::int AS signals, avg(composite_score)::real AS avg_score
      FROM claims WHERE created_at > now() - interval '7 days' GROUP BY 1
    ),
    previous AS (
      SELECT COALESCE(sector_normalized, 'macro') AS sector, count(*)::int AS signals
      FROM claims WHERE created_at > now() - interval '14 days'
        AND created_at <= now() - interval '7 days' GROUP BY 1
    )
    SELECT c.sector, c.signals, c.avg_score, COALESCE(p.signals, 0)::int AS prev_signals
    FROM current c LEFT JOIN previous p ON p.sector = c.sector ORDER BY c.signals DESC
  `);

  const sectors = sectorRows.map(r => {
    const delta = r.prev_signals > 0
      ? ((r.signals - r.prev_signals) / r.prev_signals) * 100
      : (r.signals > 0 ? 100 : 0);
    return {
      sector: r.sector, signals: r.signals, avg_score: r.avg_score,
      trend: delta > 10 ? 'rising' : delta < -10 ? 'falling' : 'stable',
      delta_pct: delta,
    };
  });

  // 3. Asset impacts
  const assetRows = await query(`
    SELECT p.id AS project_id, p.name AS project_name,
      COALESCE(s.total_signals, 0)::int AS total_signals,
      COALESCE(s.avg_impact, 0)::real AS avg_impact,
      COALESCE(s.avg_risk_7d, 0)::real AS risk_delta,
      COALESCE(s.avg_opp_7d, 0)::real AS opportunity_delta
    FROM projects p
    LEFT JOIN asset_impact_summary s ON s.project_id = p.id
    ORDER BY p.name
  `);

  // Top signals per project
  const topSigs = await query(`
    SELECT DISTINCT ON (ai.project_id, c.id)
      ai.project_id, c.statement
    FROM asset_impact ai JOIN claims c ON c.id = ai.claim_id
    WHERE ai.impact_score > 0
    ORDER BY ai.project_id, c.id, ai.impact_score DESC
    LIMIT 10
  `);
  const topByProject = {};
  for (const r of topSigs) {
    (topByProject[r.project_id] = topByProject[r.project_id] || []).push(r.statement);
  }

  const assets = assetRows.map(a => ({
    ...a,
    top_signals: (topByProject[a.project_id] || []).slice(0, 3),
    narrative: generateAssetNarrative(a),
  }));

  // 4. Convergence + risk
  const [{ conv_index, avg_risk }] = await query(`
    SELECT COALESCE(avg(composite_score) * 100, 0)::real AS conv_index,
           COALESCE(avg(risk), 0)::real AS avg_risk
    FROM claims WHERE created_at > now() - interval '30 days'
  `);

  // 5. Top changes — highest-impact recent claims translated to plain English
  const topClaims = await query(`
    SELECT c.statement, c.composite_score, c.sector_normalized,
           c.opportunity, c.risk, c.materiality, c.credibility,
           d.url AS source_url
    FROM claims c JOIN documents d ON d.id = c.doc_id
    WHERE c.created_at > now() - interval '48 hours'
    ORDER BY c.composite_score DESC
    LIMIT 5
  `);
  const topChanges = topClaims.map(translateClaim);

  // 6. Assemble brief data
  const brief = {
    date: today,
    convergence_phase: detectPhase(conv_index),
    convergence_index: conv_index,
    risk_level: riskLevel(avg_risk),
    capital_window: capitalWindow(conv_index, avg_risk),
    sector_momentum: sectors,
    asset_impacts: assets,
    executive_summary: generateExecSummary({
      sectors, claims24h: Number(claims_24h), docs24h: Number(docs_24h),
      convIdx: conv_index, avgRisk: avg_risk,
    }),
    risk_narrative: generateRiskNarrative(avg_risk, sectors),
    capital_narrative: generateCapitalNarrative(conv_index, avg_risk),
    claims_24h: Number(claims_24h),
    docs_24h: Number(docs_24h),
    top_changes: topChanges,
  };

  console.log(`[pdf] Brief assembled: phase=${brief.convergence_phase}, index=${Math.round(brief.convergence_index)}, risk=${brief.risk_level}`);
  console.log(`[pdf] Sectors: ${sectors.length}, Assets: ${assets.length}, Changes: ${topChanges.length}`);

  // 7. Render HTML
  const html = renderBriefHTML(brief);
  const htmlPath = path.resolve(__dirname, `../output/dics-brief-${today}.html`);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`[pdf] HTML written: ${htmlPath}`);

  // 8. Convert to PDF via Puppeteer
  let pdfPath;
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    pdfPath = path.resolve(__dirname, `../output/dics-brief-${today}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '22mm', bottom: '25mm', left: '22mm' },
      displayHeaderFooter: false,
    });

    await browser.close();
    console.log(`[pdf] PDF generated: ${pdfPath}`);
  } catch (err) {
    console.error(`[pdf] Puppeteer PDF generation failed: ${err.message}`);
    console.log('[pdf] HTML file is still available for manual conversion.');
    pdfPath = null;
  }

  // 9. Upload to R2
  let pdfUrl = null;
  if (pdfPath && process.env.R2_ACCESS_KEY_ID) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
      const bucket = process.env.R2_BUCKET || 'dics-reports';
      const key = `dics-brief-${today}.pdf`;

      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });

      const pdfBuffer = fs.readFileSync(pdfPath);
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        Metadata: {
          date: today,
          phase: brief.convergence_phase,
          convergence: String(Math.round(brief.convergence_index)),
        },
      }));

      pdfUrl = process.env.R2_PUBLIC_URL
        ? `${process.env.R2_PUBLIC_URL}/${key}`
        : `https://${bucket}.${accountId}.r2.dev/${key}`;

      console.log(`[pdf] Uploaded to R2: ${pdfUrl}`);
    } catch (err) {
      console.error(`[pdf] R2 upload failed: ${err.message}`);
    }
  } else if (pdfPath) {
    console.log('[pdf] R2 credentials not configured — skipping upload.');
    console.log('[pdf] Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID to enable.');
  }

  // 10. Upsert daily_briefs record
  await query(`
    INSERT INTO daily_briefs
      (brief_date, convergence_phase, convergence_index,
       risk_level, capital_window, sector_momentum,
       asset_impacts, narrative, claims_count, docs_count, pdf_url)
    VALUES
      ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11)
    ON CONFLICT (brief_date) DO UPDATE SET
      convergence_phase = EXCLUDED.convergence_phase,
      convergence_index = EXCLUDED.convergence_index,
      risk_level        = EXCLUDED.risk_level,
      capital_window    = EXCLUDED.capital_window,
      sector_momentum   = EXCLUDED.sector_momentum,
      asset_impacts     = EXCLUDED.asset_impacts,
      narrative         = EXCLUDED.narrative,
      claims_count      = EXCLUDED.claims_count,
      docs_count        = EXCLUDED.docs_count,
      pdf_url           = COALESCE(EXCLUDED.pdf_url, daily_briefs.pdf_url)
  `, [
    today,
    brief.convergence_phase,
    brief.convergence_index,
    brief.risk_level,
    brief.capital_window,
    JSON.stringify(brief.sector_momentum),
    JSON.stringify(brief.asset_impacts),
    brief.executive_summary,
    brief.claims_24h,
    brief.docs_24h,
    pdfUrl,
  ]);

  console.log(`[pdf] daily_briefs upserted for ${today}`);
  console.log('[pdf] Done.');

  await pool.end();
}

main().catch(err => {
  console.error('[pdf] Fatal error:', err);
  process.exit(1);
});
