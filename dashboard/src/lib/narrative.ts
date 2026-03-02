/**
 * DICS Narrative Generator
 *
 * Deterministic, template-driven intelligence brief narratives.
 * No AI hallucination — structured facts → controlled language.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SectorMomentum {
  sector: string;
  signals: number;
  avg_score: number;
  trend: 'rising' | 'stable' | 'falling';
  delta_pct: number;
}

export interface AssetBrief {
  project_id: string;
  project_name: string;
  total_signals: number;
  avg_impact: number;
  risk_delta: number;
  opportunity_delta: number;
  top_signals: string[];
  narrative: string;
}

export interface DailyBriefData {
  date: string;
  convergence_phase: 'Monitoring' | 'Building' | 'Accelerating' | 'Critical';
  convergence_index: number;
  risk_level: string;
  capital_window: string;
  sector_momentum: SectorMomentum[];
  asset_impacts: AssetBrief[];
  executive_summary: string;
  risk_narrative: string;
  capital_narrative: string;
  claims_24h: number;
  docs_24h: number;
}

// ── Phase Detection ───────────────────────────────────────────────────────────

export function detectPhase(index: number): 'Monitoring' | 'Building' | 'Accelerating' | 'Critical' {
  if (index >= 75) return 'Critical';
  if (index >= 50) return 'Accelerating';
  if (index >= 25) return 'Building';
  return 'Monitoring';
}

export function riskLevel(avgRisk: number): string {
  if (avgRisk >= 0.7) return 'High';
  if (avgRisk >= 0.4) return 'Moderate';
  if (avgRisk >= 0.2) return 'Low';
  return 'Minimal';
}

export function capitalWindow(index: number, avgRisk: number): string {
  if (index >= 60 && avgRisk < 0.4) return 'Opening';
  if (index >= 40 && avgRisk < 0.5) return 'Neutral-Positive';
  if (avgRisk >= 0.6) return 'Contracting';
  return 'Neutral';
}

// ── Sector Narrative ──────────────────────────────────────────────────────────

const SECTOR_LABELS: Record<string, string> = {
  energy: 'Energy & Power',
  mining: 'Mining & Resources',
  telecom: 'Telecoms & Digital',
  logistics: 'Logistics & Ports',
  finance: 'Finance & Capital',
  tourism: 'Tourism & Hospitality',
  macro: 'Macro & Regulatory',
};

function trendWord(t: string): string {
  if (t === 'rising') return 'strengthening';
  if (t === 'falling') return 'softening';
  return 'steady';
}

function formatSectorLine(s: SectorMomentum): string {
  const label = SECTOR_LABELS[s.sector] || s.sector;
  const arrow = s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→';
  const delta = s.delta_pct > 0 ? `+${s.delta_pct.toFixed(1)}%` : `${s.delta_pct.toFixed(1)}%`;
  return `${label} ${arrow} ${delta} (${s.signals} signals, avg ${s.avg_score.toFixed(2)})`;
}

// ── Asset Narrative ───────────────────────────────────────────────────────────

function generateAssetNarrative(a: AssetBrief): string {
  const parts: string[] = [];

  if (a.opportunity_delta > 0) {
    parts.push(`Opportunity indicators are positive (Δ +${(a.opportunity_delta * 100).toFixed(1)}%).`);
  }
  if (a.risk_delta < -0.02) {
    parts.push(`Risk profile has improved (Δ ${(a.risk_delta * 100).toFixed(1)}%).`);
  } else if (a.risk_delta > 0.02) {
    parts.push(`Risk indicators have increased slightly (Δ +${(a.risk_delta * 100).toFixed(1)}%). Monitor closely.`);
  } else {
    parts.push('Risk profile remains stable.');
  }

  if (a.total_signals === 0) {
    parts.push('No new intelligence signals detected in the reporting period.');
  } else {
    parts.push(`${a.total_signals} intelligence signals mapped to this asset.`);
  }

  if (a.avg_impact > 0.15) {
    parts.push('Current macro conditions are favorable for advancement.');
  } else if (a.avg_impact > 0.05) {
    parts.push('Macro environment is neutral. No compelling urgency detected.');
  } else {
    parts.push('Limited macro relevance in current signal flow.');
  }

  return parts.join(' ');
}

// ── Executive Summary ─────────────────────────────────────────────────────────

export function generateExecutiveSummary(data: {
  sectors: SectorMomentum[];
  claims_24h: number;
  docs_24h: number;
  convergenceIndex: number;
  avgRisk: number;
}): string {
  const { sectors, claims_24h, docs_24h, convergenceIndex, avgRisk } = data;

  const rising = sectors.filter(s => s.trend === 'rising').map(s => SECTOR_LABELS[s.sector] || s.sector);
  const falling = sectors.filter(s => s.trend === 'falling').map(s => SECTOR_LABELS[s.sector] || s.sector);
  const stable = sectors.filter(s => s.trend === 'stable').map(s => SECTOR_LABELS[s.sector] || s.sector);

  const parts: string[] = [];

  parts.push(
    `Today's intelligence analysis processed ${docs_24h} source documents yielding ${claims_24h} scored claims.`
  );

  if (rising.length > 0) {
    parts.push(`Positive momentum detected in ${rising.join(', ')}.`);
  }
  if (falling.length > 0) {
    parts.push(`Softening observed in ${falling.join(', ')}.`);
  }
  if (stable.length > 0 && rising.length === 0 && falling.length === 0) {
    parts.push('All monitored sectors remain stable.');
  }

  const phase = detectPhase(convergenceIndex);
  parts.push(
    `Convergence Index stands at ${convergenceIndex.toFixed(0)}/100 (${phase} phase).`
  );

  const risk = riskLevel(avgRisk);
  if (risk === 'High') {
    parts.push('Elevated risk indicators warrant caution.');
  } else if (risk === 'Moderate') {
    parts.push('Risk levels are within acceptable bounds.');
  } else {
    parts.push('Risk environment is favorable.');
  }

  return parts.join(' ');
}

// ── Risk Narrative ────────────────────────────────────────────────────────────

export function generateRiskNarrative(avgRisk: number, sectors: SectorMomentum[]): string {
  const level = riskLevel(avgRisk);
  const risky = sectors.filter(s => s.avg_score < 0.4);

  const parts: string[] = [
    `Overall risk assessment: ${level}.`,
  ];

  if (level === 'High') {
    parts.push('Multiple indicators suggest elevated uncertainty. Recommend delaying non-critical commitments.');
  } else if (level === 'Moderate') {
    parts.push('No new political instability indicators detected. Regulatory environment remains stable.');
  } else {
    parts.push('Risk environment is benign. No adverse signals detected across monitored sectors.');
  }

  if (risky.length > 0) {
    parts.push(`Sectors with below-average signal strength: ${risky.map(s => SECTOR_LABELS[s.sector] || s.sector).join(', ')}.`);
  }

  return parts.join(' ');
}

// ── Capital Narrative ─────────────────────────────────────────────────────────

export function generateCapitalNarrative(convergenceIndex: number, avgRisk: number): string {
  const window = capitalWindow(convergenceIndex, avgRisk);
  const parts: string[] = [
    `Capital Window: ${window}.`,
  ];

  if (window === 'Opening') {
    parts.push(
      `With convergence at ${convergenceIndex.toFixed(0)}/100 and risk at ${riskLevel(avgRisk).toLowerCase()}, ` +
      'conditions favor initiating capital conversations in the next 30–60 days.'
    );
  } else if (window === 'Neutral-Positive') {
    parts.push('Conditions are trending positive but have not yet reached the threshold for active capital deployment.');
  } else if (window === 'Contracting') {
    parts.push('Elevated risk indicators suggest postponing non-essential capital commitments.');
  } else {
    parts.push('Macro environment is neutral. Continue monitoring for phase changes.');
  }

  return parts.join(' ');
}

// ── Sector Momentum Lines ─────────────────────────────────────────────────────

export function formatSectorMomentum(sectors: SectorMomentum[]): string {
  return sectors.map(formatSectorLine).join('\n');
}

// ── Full Brief Assembly ───────────────────────────────────────────────────────

export function assembleBrief(
  sectors: SectorMomentum[],
  assets: AssetBrief[],
  claims_24h: number,
  docs_24h: number,
  convergenceIndex: number,
  avgRisk: number,
): DailyBriefData {
  // Generate asset narratives
  const enrichedAssets = assets.map(a => ({
    ...a,
    narrative: generateAssetNarrative(a),
  }));

  const phase = detectPhase(convergenceIndex);

  return {
    date: new Date().toISOString().slice(0, 10),
    convergence_phase: phase,
    convergence_index: convergenceIndex,
    risk_level: riskLevel(avgRisk),
    capital_window: capitalWindow(convergenceIndex, avgRisk),
    sector_momentum: sectors,
    asset_impacts: enrichedAssets,
    executive_summary: generateExecutiveSummary({
      sectors, claims_24h, docs_24h, convergenceIndex, avgRisk,
    }),
    risk_narrative: generateRiskNarrative(avgRisk, sectors),
    capital_narrative: generateCapitalNarrative(convergenceIndex, avgRisk),
    claims_24h,
    docs_24h,
  };
}
