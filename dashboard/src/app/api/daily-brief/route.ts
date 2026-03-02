import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { assembleBrief, type SectorMomentum, type AssetBrief } from '@/lib/narrative';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ── 1. 24-hour counts ────────────────────────────────────────────────
    const [{ docs_24h, claims_24h }] = await query<{
      docs_24h: number;
      claims_24h: number;
    }>(`
      SELECT
        (SELECT count(*) FROM documents
           WHERE fetched_at > now() - interval '24 hours')::int AS docs_24h,
        (SELECT count(*) FROM claims
           WHERE created_at > now() - interval '24 hours')::int AS claims_24h
    `);

    // ── 2. Sector momentum (7-day, with delta vs prior 7 days) ──────────
    const sectorRows = await query<{
      sector: string;
      signals: number;
      avg_score: number;
      prev_signals: number;
    }>(`
      WITH current AS (
        SELECT
          COALESCE(sector_normalized, 'macro') AS sector,
          count(*)::int AS signals,
          avg(composite_score)::real AS avg_score
        FROM claims
        WHERE created_at > now() - interval '7 days'
        GROUP BY 1
      ),
      previous AS (
        SELECT
          COALESCE(sector_normalized, 'macro') AS sector,
          count(*)::int AS signals
        FROM claims
        WHERE created_at > now() - interval '14 days'
          AND created_at <= now() - interval '7 days'
        GROUP BY 1
      )
      SELECT
        c.sector,
        c.signals,
        c.avg_score,
        COALESCE(p.signals, 0)::int AS prev_signals
      FROM current c
      LEFT JOIN previous p ON p.sector = c.sector
      ORDER BY c.signals DESC
    `);

    const sectors: SectorMomentum[] = sectorRows.map(r => {
      const delta = r.prev_signals > 0
        ? ((r.signals - r.prev_signals) / r.prev_signals) * 100
        : (r.signals > 0 ? 100 : 0);
      return {
        sector: r.sector,
        signals: r.signals,
        avg_score: r.avg_score,
        trend: (delta > 10 ? 'rising' : delta < -10 ? 'falling' : 'stable') as 'rising' | 'stable' | 'falling',
        delta_pct: delta,
      };
    });

    // ── 3. Asset impact summary ──────────────────────────────────────────
    const assetRows = await query<{
      project_id: string;
      project_name: string;
      total_signals: number;
      avg_impact: number;
      risk_delta: number;
      opportunity_delta: number;
    }>(`
      SELECT
        p.id   AS project_id,
        p.name AS project_name,
        COALESCE(s.total_signals, 0)::int AS total_signals,
        COALESCE(s.avg_impact, 0)::real   AS avg_impact,
        COALESCE(s.avg_risk_7d, 0)::real      AS risk_delta,
        COALESCE(s.avg_opp_7d, 0)::real AS opportunity_delta
      FROM projects p
      LEFT JOIN asset_impact_summary s ON s.project_id = p.id
      ORDER BY p.name
    `);

    // Top signals per project
    const topSignalsQuery = await query<{
      project_id: string;
      statement: string;
    }>(`
      SELECT DISTINCT ON (ai.project_id, c.id)
        ai.project_id,
        c.statement
      FROM asset_impact ai
      JOIN claims c ON c.id = ai.claim_id
      WHERE ai.impact_score > 0
      ORDER BY ai.project_id, c.id, ai.impact_score DESC
      LIMIT 10
    `);

    const topByProject = new Map<string, string[]>();
    for (const r of topSignalsQuery) {
      const arr = topByProject.get(r.project_id) ?? [];
      arr.push(r.statement);
      topByProject.set(r.project_id, arr);
    }

    const assets: AssetBrief[] = assetRows.map(r => ({
      ...r,
      top_signals: (topByProject.get(r.project_id) ?? []).slice(0, 3),
      narrative: '', // Will be filled by assembleBrief
    }));

    // ── 4. Convergence Index (average of composite across last 30d) ─────
    const [{ conv_index, avg_risk }] = await query<{
      conv_index: number;
      avg_risk: number;
    }>(`
      SELECT
        COALESCE(avg(composite_score) * 100, 0)::real AS conv_index,
        COALESCE(avg(risk), 0)::real AS avg_risk
      FROM claims
      WHERE created_at > now() - interval '30 days'
    `);

    // ── 5. Assemble brief ────────────────────────────────────────────────
    const brief = assembleBrief(
      sectors,
      assets,
      Number(claims_24h),
      Number(docs_24h),
      conv_index,
      avg_risk,
    );

    // ── 6. Persist (upsert) ──────────────────────────────────────────────
    await query(`
      INSERT INTO daily_briefs
        (brief_date, convergence_phase, convergence_index,
         risk_level, capital_window, sector_momentum,
         asset_impacts, narrative, claims_count, docs_count)
      VALUES
        (CURRENT_DATE, $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9)
      ON CONFLICT (brief_date) DO UPDATE SET
        convergence_phase = EXCLUDED.convergence_phase,
        convergence_index = EXCLUDED.convergence_index,
        risk_level        = EXCLUDED.risk_level,
        capital_window    = EXCLUDED.capital_window,
        sector_momentum   = EXCLUDED.sector_momentum,
        asset_impacts     = EXCLUDED.asset_impacts,
        narrative         = EXCLUDED.narrative,
        claims_count      = EXCLUDED.claims_count,
        docs_count        = EXCLUDED.docs_count
    `, [
      brief.convergence_phase,
      brief.convergence_index,
      brief.risk_level,
      brief.capital_window,
      JSON.stringify(brief.sector_momentum),
      JSON.stringify(brief.asset_impacts),
      brief.executive_summary,
      brief.claims_24h,
      brief.docs_24h,
    ]);

    return NextResponse.json(brief);
  } catch (err) {
    console.error('[api/daily-brief] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
