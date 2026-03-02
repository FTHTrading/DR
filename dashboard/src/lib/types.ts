export interface Signal {
  id: string;
  doc_id: string;
  statement: string;
  who: string | null;
  where_text: string | null;
  when_text: string | null;
  composite_score: number;
  credibility: number;
  materiality: number;
  opportunity: number;
  risk: number;
  usd_amount: number | null;
  source_url: string;
  fetched_at: string;
  tags: string[];
}

export interface MetricCounter {
  name: string;
  value: number;
  label: string;
  domain: string; // color domain key
}

export interface SourceHealth {
  source_id: string;
  name: string;
  tier: number;
  total_docs: number;
  last_fetched: string | null;
  robots_denied: number;
  tags: string[];
}

export interface RiskRow {
  sector: string;
  credibility: number;
  materiality: number;
  recency: number;
  opportunity: number;
  risk: number;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface ProofRecord {
  id: string;
  document_hash: string;
  chain_id: string;
  chain_tx_hash: string | null;
  anchored_at: string | null;
  block_number: number | null;
}

export interface AuditSummary {
  total_events: number;
  total_errors: number;
  events_by_type: Record<string, number>;
  recent_events: {
    id: string;
    event_type: string;
    entity_id: string;
    created_at: string;
    payload: string;
  }[];
}

// ── Trend Engine ──────────────────────────────────────────────────────────────

/** One day of velocity data (7-day window, high-score signals only) */
export interface TrendPoint {
  day: string;           // ISO date YYYY-MM-DD
  signals: number;       // count of claims with composite_score >= 0.65
  avg_score: number;     // mean composite_score for that day
}

/** Per-sector daily signal density over a rolling period */
export interface SectorDensity {
  sector: string;
  day: string;
  signals: number;
}

/** Full response from /api/trends */
export interface TrendsResponse {
  velocity: TrendPoint[];          // 7-day high-signal velocity
  sector_density: SectorDensity[]; // 30-day per-sector density
  risk_delta: { day: string; avg_risk: number }[];  // 7-day mean risk score
}

// ── Convergence Index ─────────────────────────────────────────────────────────

export interface ConvergenceSector {
  sector: string;
  weight: number;       // 0–1
  signals: number;      // count in last 30 days
  avg_score: number;
  contribution: number; // weight * normalised_score (0–100)
}

export interface ConvergenceIndex {
  index: number;                  // 0–100
  phase: 'Monitoring' | 'Building' | 'Accelerating' | 'Critical';
  delta_7d: number;               // change vs 7 days ago
  sectors: ConvergenceSector[];
  computed_at: string;            // ISO timestamp
}
