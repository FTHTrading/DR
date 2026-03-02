/**
 * DICS Daily Intelligence Report — HTML Template
 *
 * Self-contained institutional template with inline CSS.
 * Rendered by generate-daily-pdf.js → Puppeteer → PDF.
 *
 * Produces a clean, board-ready document:
 *   Cover → Executive Summary → What Changed → Asset Impact → Risk → Capital Window
 */

module.exports = function renderBriefHTML(brief) {
  const {
    date,
    convergence_phase,
    convergence_index,
    risk_level,
    capital_window,
    sector_momentum = [],
    asset_impacts = [],
    executive_summary,
    risk_narrative,
    capital_narrative,
    claims_24h,
    docs_24h,
    top_changes = [],
  } = brief;

  const formattedDate = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const phaseArrow = convergence_phase === 'Accelerating' || convergence_phase === 'Critical'
    ? '↑ Improving'
    : convergence_phase === 'Building'
      ? '→ Steady'
      : '↓ Cooling';

  const risingSectors = sector_momentum.filter(s => s.trend === 'rising');
  const stableSectors = sector_momentum.filter(s => s.trend === 'stable');
  const fallingSectors = sector_momentum.filter(s => s.trend === 'falling');

  const SECTOR_LABELS = {
    energy: 'Energy & Power', mining: 'Mining & Resources', telecom: 'Telecoms & Digital',
    logistics: 'Logistics & Ports', finance: 'Finance & Capital', tourism: 'Tourism & Hospitality',
    macro: 'Macro & Regulatory',
  };

  const ASSET_ICONS = { SUNFARM_BANI_50MW: '☀️', CABRERA_ECOTURISMO: '🌴' };

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const css = `
    @page {
      size: A4;
      margin: 20mm 22mm 25mm 22mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
    }
    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 85vh;
      text-align: center;
    }
    .cover-badge {
      display: inline-block;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #b8860b;
      border: 2px solid #b8860b;
      padding: 6px 24px;
      border-radius: 4px;
      margin-bottom: 40px;
    }
    .cover h1 {
      font-size: 26pt;
      font-weight: 800;
      color: #0d1b2a;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .cover .subtitle {
      font-size: 13pt;
      color: #5c677d;
      font-weight: 400;
      margin-bottom: 40px;
    }
    .cover .date {
      font-size: 14pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 30px;
    }
    .cover-meta {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
    }
    .cover-meta-item {
      text-align: center;
    }
    .cover-meta-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #8d99ae;
      margin-bottom: 4px;
    }
    .cover-meta-value {
      font-size: 18pt;
      font-weight: 700;
      color: #0d1b2a;
    }
    .cover-meta-sub {
      font-size: 9pt;
      color: #5c677d;
    }
    .cover-summary {
      max-width: 520px;
      font-size: 11pt;
      color: #5c677d;
      font-style: italic;
      line-height: 1.7;
      border-left: 3px solid #b8860b;
      padding-left: 16px;
      text-align: left;
    }
    .cover-footer {
      margin-top: 60px;
      font-size: 8pt;
      color: #adb5bd;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Sections */
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #0d1b2a;
      border-bottom: 2px solid #b8860b;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .section-body {
      font-size: 11pt;
      color: #2b2d42;
      line-height: 1.7;
    }
    .section-body p {
      margin-bottom: 10px;
    }
    blockquote {
      border-left: 3px solid #b8860b;
      padding: 10px 16px;
      margin: 14px 0;
      background: #fdf8f0;
      font-style: italic;
      color: #3d405b;
      font-size: 10.5pt;
    }
    .page-break { page-break-before: always; }

    /* Changes table */
    .changes-list {
      list-style: none;
      padding: 0;
    }
    .changes-list li {
      padding: 12px 0;
      border-bottom: 1px solid #edf2f4;
    }
    .changes-list li:last-child { border-bottom: none; }
    .change-what {
      font-weight: 600;
      color: #0d1b2a;
      font-size: 10.5pt;
      margin-bottom: 4px;
    }
    .change-why {
      font-size: 10pt;
      color: #5c677d;
      line-height: 1.5;
    }
    .change-tag {
      display: inline-block;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 2px 8px;
      border-radius: 3px;
      margin-right: 6px;
    }
    .tag-energy { background: #fff3cd; color: #856404; }
    .tag-mining { background: #d4edda; color: #155724; }
    .tag-telecom { background: #cce5ff; color: #004085; }
    .tag-logistics { background: #d6d8db; color: #383d41; }
    .tag-finance { background: #f8d7da; color: #721c24; }
    .tag-tourism { background: #d4edda; color: #155724; }
    .tag-macro { background: #e2e3e5; color: #383d41; }

    /* Asset cards */
    .asset-card {
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 18px 20px;
      margin-bottom: 18px;
      background: #fafbfc;
    }
    .asset-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .asset-name {
      font-size: 13pt;
      font-weight: 700;
      color: #0d1b2a;
    }
    .asset-deltas {
      display: flex;
      gap: 16px;
      text-align: right;
    }
    .delta-item {
      text-align: center;
    }
    .delta-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8d99ae;
    }
    .delta-value {
      font-size: 14pt;
      font-weight: 700;
    }
    .delta-positive { color: #28a745; }
    .delta-negative { color: #dc3545; }
    .delta-neutral  { color: #6c757d; }
    .asset-narrative {
      font-size: 10.5pt;
      color: #2b2d42;
      line-height: 1.6;
    }
    .asset-signals {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #edf2f4;
    }
    .asset-signals-title {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8d99ae;
      margin-bottom: 6px;
    }
    .asset-signals ul {
      list-style: none;
      padding: 0;
    }
    .asset-signals li {
      font-size: 9.5pt;
      color: #5c677d;
      padding: 3px 0;
      padding-left: 14px;
      position: relative;
    }
    .asset-signals li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #b8860b;
    }

    /* Sector momentum */
    .sector-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .sector-table th {
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8d99ae;
      padding: 6px 8px;
      border-bottom: 2px solid #dee2e6;
    }
    .sector-table td {
      padding: 8px;
      border-bottom: 1px solid #edf2f4;
      color: #2b2d42;
    }
    .trend-up { color: #28a745; font-weight: 600; }
    .trend-down { color: #dc3545; font-weight: 600; }
    .trend-flat { color: #6c757d; }

    /* KPI strip */
    .kpi-strip {
      display: flex;
      gap: 20px;
      margin: 16px 0 24px 0;
    }
    .kpi-box {
      flex: 1;
      text-align: center;
      padding: 12px 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: #fafbfc;
    }
    .kpi-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8d99ae;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 16pt;
      font-weight: 700;
      color: #0d1b2a;
    }

    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid #dee2e6;
      font-size: 8pt;
      color: #adb5bd;
      display: flex;
      justify-content: space-between;
    }
    .confidential-bar {
      text-align: center;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #dc3545;
      padding: 8px;
      border-top: 1px solid #edf2f4;
      margin-top: 20px;
    }
  `;

  // ── Build top-changes section ────────────────────────────────────────────────
  const changesHTML = top_changes.length > 0
    ? top_changes.map(c => `
        <li>
          <div class="change-what">
            <span class="change-tag tag-${c.sector || 'macro'}">${SECTOR_LABELS[c.sector] || c.sector || 'Macro'}</span>
            ${escapeHTML(c.what)}
          </div>
          <div class="change-why">${escapeHTML(c.why)}</div>
        </li>`).join('')
    : '<li><div class="change-why">No high-impact signals detected in the last 24 hours. All sectors stable.</div></li>';

  // ── Build sector momentum table ──────────────────────────────────────────────
  const sectorRows = sector_momentum.map(s => {
    const label = SECTOR_LABELS[s.sector] || s.sector;
    const arrow = s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→';
    const cls = s.trend === 'rising' ? 'trend-up' : s.trend === 'falling' ? 'trend-down' : 'trend-flat';
    const delta = s.delta_pct > 0 ? `+${s.delta_pct.toFixed(1)}%` : `${s.delta_pct.toFixed(1)}%`;
    return `
      <tr>
        <td>${label}</td>
        <td>${s.signals}</td>
        <td>${s.avg_score.toFixed(2)}</td>
        <td class="${cls}">${arrow} ${delta}</td>
      </tr>`;
  }).join('');

  // ── Build asset cards ────────────────────────────────────────────────────────
  const assetCards = asset_impacts.map(a => {
    const icon = ASSET_ICONS[a.project_id] || '🏗️';
    const riskPct = (a.risk_delta * 100).toFixed(1);
    const oppPct = (a.opportunity_delta * 100).toFixed(1);
    const riskClass = a.risk_delta < 0 ? 'delta-positive' : a.risk_delta > 0 ? 'delta-negative' : 'delta-neutral';
    const oppClass = a.opportunity_delta > 0 ? 'delta-positive' : a.opportunity_delta < 0 ? 'delta-negative' : 'delta-neutral';
    const riskSign = a.risk_delta > 0 ? '+' : '';
    const oppSign = a.opportunity_delta > 0 ? '+' : '';

    const signalsList = (a.top_signals || []).slice(0, 3)
      .map(s => `<li>${escapeHTML(s)}</li>`).join('');

    return `
      <div class="asset-card">
        <div class="asset-header">
          <div class="asset-name">${icon} ${escapeHTML(a.project_name)}</div>
          <div class="asset-deltas">
            <div class="delta-item">
              <div class="delta-label">Risk</div>
              <div class="delta-value ${riskClass}">${riskSign}${riskPct}%</div>
            </div>
            <div class="delta-item">
              <div class="delta-label">Opportunity</div>
              <div class="delta-value ${oppClass}">${oppSign}${oppPct}%</div>
            </div>
          </div>
        </div>
        <div class="asset-narrative">${escapeHTML(a.narrative)}</div>
        ${signalsList ? `
          <div class="asset-signals">
            <div class="asset-signals-title">Key Intelligence Signals</div>
            <ul>${signalsList}</ul>
          </div>` : ''}
      </div>`;
  }).join('');

  // ── Build one-line summary for cover ─────────────────────────────────────────
  let coverSummary = executive_summary;
  if (risingSectors.length > 0) {
    const names = risingSectors.map(s => (SECTOR_LABELS[s.sector] || s.sector).toLowerCase()).join(' and ');
    coverSummary = `Infrastructure momentum continues across ${names} sectors, ` +
      `strengthening near-term capital positioning for tracked assets.`;
  }

  // ── Assemble HTML ────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DICS Daily Intelligence Brief — ${formattedDate}</title>
  <style>${css}</style>
</head>
<body>

  <!-- ── COVER PAGE ──────────────────────────────────────────────── -->
  <div class="cover">
    <div class="cover-badge">DICS Intelligence</div>
    <h1>Daily Infrastructure<br>Intelligence Brief</h1>
    <div class="subtitle">Dominican Republic</div>
    <div class="date">${formattedDate}</div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Convergence Phase</div>
        <div class="cover-meta-value">${convergence_phase}</div>
        <div class="cover-meta-sub">${phaseArrow}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Capital Window</div>
        <div class="cover-meta-value">${Math.round(convergence_index)}<span style="font-size:11pt;color:#8d99ae"> / 100</span></div>
        <div class="cover-meta-sub">${capital_window}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Risk Level</div>
        <div class="cover-meta-value">${risk_level}</div>
      </div>
    </div>

    <div class="cover-summary">${escapeHTML(coverSummary)}</div>

    <div class="cover-footer">
      Confidential · FTH Trading · DR Infrastructure Group
    </div>
  </div>

  <!-- ── EXECUTIVE SUMMARY ───────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="kpi-label">Sources Processed</div>
        <div class="kpi-value">${docs_24h}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Intelligence Claims</div>
        <div class="kpi-value">${claims_24h}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Convergence Index</div>
        <div class="kpi-value">${Math.round(convergence_index)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Risk Level</div>
        <div class="kpi-value">${risk_level}</div>
      </div>
    </div>
    <div class="section-body">
      <p>${escapeHTML(executive_summary)}</p>
    </div>
  </div>

  <!-- ── WHAT CHANGED TODAY ──────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">What Changed Today</div>
    <div class="section-body">
      <ul class="changes-list">
        ${changesHTML}
      </ul>
    </div>
  </div>

  <!-- ── SECTOR MOMENTUM ────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">Sector Momentum</div>
    <table class="sector-table">
      <thead>
        <tr>
          <th>Sector</th>
          <th>Signals</th>
          <th>Avg Score</th>
          <th>7-Day Trend</th>
        </tr>
      </thead>
      <tbody>
        ${sectorRows}
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- ── ASSET IMPACT ────────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">Asset Impact Analysis</div>
    <div class="section-body">
      ${assetCards}
    </div>
  </div>

  <!-- ── RISK OVERVIEW ───────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">Risk Overview</div>
    <div class="section-body">
      <p>${escapeHTML(risk_narrative)}</p>
    </div>
  </div>

  <!-- ── CAPITAL WINDOW ──────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">Capital Window Indicator</div>
    <div class="section-body">
      <blockquote>${escapeHTML(capital_narrative)}</blockquote>
    </div>
  </div>

  <!-- ── FOOTER ──────────────────────────────────────────────────── -->
  <div class="report-footer">
    <span>DICS · DR Intelligence Command System</span>
    <span>Generated ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
  </div>
  <div class="confidential-bar">
    Confidential — For Internal and Authorized Partner Use Only
  </div>

</body>
</html>`;
};

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
