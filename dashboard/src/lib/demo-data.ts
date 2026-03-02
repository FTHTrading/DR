/**
 * Fallback demo data used when API routes are unavailable
 * (e.g. static export / no database connection).
 *
 * Provides realistic DR-infrastructure intelligence samples so the
 * dashboard always renders meaningful content.
 */

import type {
  Signal,
  ConvergenceIndex,
  TrendsResponse,
  ScoreBucket,
  RiskRow,
  SourceHealth,
  AuditSummary,
  ProofRecord,
} from './types';

/* ── Helpers ──────────────────────────────────────────────────── */

/** ISO date string for N days ago */
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const now = () => new Date().toISOString();

/* ── Signals ──────────────────────────────────────────────────── */
export const DEMO_SIGNALS: Signal[] = [
  {
    id: 'demo-001', doc_id: 'd-001',
    statement: 'SIE Dominicana confirms 138 kV interconnection approval for Baní solar corridor — expected energisation Q3 2026.',
    who: 'ETED / SIE', where_text: 'Baní, Peravia', when_text: '2026-02-18',
    composite_score: 0.94, credibility: 0.95, materiality: 0.92, opportunity: 0.96, risk: 0.12,
    usd_amount: 90_000_000, source_url: 'https://sie.gob.do/resoluciones',
    fetched_at: daysAgo(1), tags: ['energy', 'solar', 'grid', 'permits'],
  },
  {
    id: 'demo-002', doc_id: 'd-002',
    statement: 'Google and Meta undersea cable consortium announces Dominican Republic landing station construction begins in Puerto Plata.',
    who: 'Google Infrastructure', where_text: 'Puerto Plata', when_text: '2026-01-30',
    composite_score: 0.91, credibility: 0.90, materiality: 0.88, opportunity: 0.94, risk: 0.15,
    usd_amount: 400_000_000, source_url: 'https://cloud.google.com/blog',
    fetched_at: daysAgo(2), tags: ['telecom', 'connectivity', 'cables', 'digital'],
  },
  {
    id: 'demo-003', doc_id: 'd-003',
    statement: 'USGS confirms rare earth oxide concentrations of 12–18% in Samaná Peninsula sampling — highest in Caribbean basin.',
    who: 'USGS / DGM', where_text: 'Samaná', when_text: '2026-02-10',
    composite_score: 0.89, credibility: 0.92, materiality: 0.90, opportunity: 0.85, risk: 0.22,
    usd_amount: null, source_url: 'https://www.usgs.gov/publications',
    fetched_at: daysAgo(3), tags: ['mining', 'rare_earth', 'geology'],
  },
  {
    id: 'demo-004', doc_id: 'd-004',
    statement: 'Amazon Web Services selects Santo Domingo for first Caribbean data center — $800M over 10 years.',
    who: 'AWS', where_text: 'Santo Domingo', when_text: '2026-02-05',
    composite_score: 0.87, credibility: 0.88, materiality: 0.85, opportunity: 0.90, risk: 0.18,
    usd_amount: 800_000_000, source_url: 'https://press.aboutamazon.com',
    fetched_at: daysAgo(4), tags: ['telecom', 'digital', 'FDI', 'investment'],
  },
  {
    id: 'demo-005', doc_id: 'd-005',
    statement: 'CNE grants environmental license for 50 MW photovoltaic + 25 MW/100 MWh BESS project in Baní — SunFarm consortium.',
    who: 'CNE', where_text: 'Baní, Peravia', when_text: '2026-01-22',
    composite_score: 0.86, credibility: 0.93, materiality: 0.84, opportunity: 0.88, risk: 0.10,
    usd_amount: 54_000_000, source_url: 'https://cne.gob.do/permisos',
    fetched_at: daysAgo(5), tags: ['energy', 'solar', 'bess', 'permits'],
  },
  {
    id: 'demo-006', doc_id: 'd-006',
    statement: 'DP World expands Caucedo terminal capacity by 40% with new post-Panamax cranes — $250M investment phase.',
    who: 'DP World', where_text: 'Caucedo, Santo Domingo Este', when_text: '2026-01-18',
    composite_score: 0.82, credibility: 0.85, materiality: 0.80, opportunity: 0.82, risk: 0.20,
    usd_amount: 250_000_000, source_url: 'https://www.dpworld.com/news',
    fetched_at: daysAgo(6), tags: ['logistics', 'ports', 'shipping'],
  },
  {
    id: 'demo-007', doc_id: 'd-007',
    statement: 'World Bank approves $120M climate resilience credit line for DR renewable energy — IDA blend terms.',
    who: 'World Bank', where_text: 'Dominican Republic', when_text: '2026-02-12',
    composite_score: 0.80, credibility: 0.90, materiality: 0.78, opportunity: 0.85, risk: 0.08,
    usd_amount: 120_000_000, source_url: 'https://www.worldbank.org/en/projects',
    fetched_at: daysAgo(2), tags: ['finance', 'FDI', 'energy', 'investment'],
  },
  {
    id: 'demo-008', doc_id: 'd-008',
    statement: 'Altice Dominicana deploys 5G NR trial in Punta Cana tourism corridor — 3.5 GHz spectrum band.',
    who: 'Altice Dominicana', where_text: 'Punta Cana', when_text: '2026-01-28',
    composite_score: 0.76, credibility: 0.78, materiality: 0.72, opportunity: 0.80, risk: 0.14,
    usd_amount: null, source_url: 'https://www.altice.com.do/noticias',
    fetched_at: daysAgo(7), tags: ['telecom', 'spectrum', 'connectivity'],
  },
  {
    id: 'demo-009', doc_id: 'd-009',
    statement: 'EGE Haina signs 20-year PPA with AES at $68/MWh for 80 MW solar in Azua — first BESS-backed contract in DR.',
    who: 'EGE Haina', where_text: 'Azua', when_text: '2026-02-08',
    composite_score: 0.74, credibility: 0.82, materiality: 0.70, opportunity: 0.78, risk: 0.16,
    usd_amount: null, source_url: 'https://egehaina.com/sala-prensa',
    fetched_at: daysAgo(3), tags: ['energy', 'solar', 'bess'],
  },
  {
    id: 'demo-010', doc_id: 'd-010',
    statement: 'Ministerio de Turismo approves master plan for Cabrera eco-tourism district — 1.17M m² mixed-use.',
    who: 'MITUR', where_text: 'Cabrera, María Trinidad Sánchez', when_text: '2026-02-15',
    composite_score: 0.71, credibility: 0.75, materiality: 0.68, opportunity: 0.72, risk: 0.25,
    usd_amount: 593_000_000, source_url: 'https://mitur.gob.do/noticias',
    fetched_at: daysAgo(1), tags: ['logistics', 'investment', 'FDI'],
  },
  {
    id: 'demo-011', doc_id: 'd-011',
    statement: 'Central Bank of DR reports FDI inflows of $4.1B for 2025 — energy and telecom sectors leading growth.',
    who: 'BCRD', where_text: 'Dominican Republic', when_text: '2026-01-15',
    composite_score: 0.68, credibility: 0.88, materiality: 0.65, opportunity: 0.70, risk: 0.12,
    usd_amount: 4_100_000_000, source_url: 'https://www.bancentral.gov.do',
    fetched_at: daysAgo(8), tags: ['finance', 'macro', 'FDI'],
  },
  {
    id: 'demo-012', doc_id: 'd-012',
    statement: 'ProDominicana launched incentive package for nearshoring logistics hubs — 15-year tax exemption for qualifying operations.',
    who: 'ProDominicana', where_text: 'Santo Domingo', when_text: '2026-01-20',
    composite_score: 0.65, credibility: 0.72, materiality: 0.62, opportunity: 0.75, risk: 0.18,
    usd_amount: null, source_url: 'https://prodominicana.gob.do',
    fetched_at: daysAgo(10), tags: ['logistics', 'investment', 'finance'],
  },
];

/* ── Convergence Index ────────────────────────────────────────── */
export const DEMO_CONVERGENCE: ConvergenceIndex = {
  index: 62,
  phase: 'Accelerating',
  delta_7d: 4,
  sectors: [
    { sector: 'Energy',    weight: 0.30, signals: 38, avg_score: 0.81, contribution: 22.5 },
    { sector: 'Mining',    weight: 0.25, signals: 14, avg_score: 0.76, contribution: 15.2 },
    { sector: 'Telecom',   weight: 0.15, signals: 22, avg_score: 0.72, contribution:  9.8 },
    { sector: 'Logistics', weight: 0.20, signals: 18, avg_score: 0.68, contribution: 10.1 },
    { sector: 'Finance',   weight: 0.10, signals: 10, avg_score: 0.70, contribution:  4.4 },
  ],
  computed_at: now(),
};

/* ── Trends ───────────────────────────────────────────────────── */
export const DEMO_TRENDS: TrendsResponse = {
  velocity: Array.from({ length: 7 }, (_, i) => ({
    day: daysAgo(6 - i),
    signals: [5, 8, 6, 11, 9, 14, 12][i],
    avg_score: [0.72, 0.74, 0.71, 0.78, 0.76, 0.82, 0.79][i],
  })),
  sector_density: (() => {
    const sectors = ['Energy', 'Mining', 'Telecom', 'Logistics', 'Finance'];
    const base = [
      [3, 4, 3, 5, 4, 6, 5, 4, 7, 5, 6, 4, 5, 7, 6, 8, 5, 6, 7, 5, 8, 6, 7, 9, 6, 8, 7, 9, 8, 10],
      [1, 2, 1, 2, 1, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 4, 3, 3, 4, 3, 4, 5],
      [2, 2, 3, 2, 3, 3, 2, 4, 3, 2, 3, 4, 3, 4, 3, 3, 4, 3, 5, 4, 3, 4, 5, 4, 5, 4, 5, 6, 5, 6],
      [1, 2, 2, 1, 2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 4, 3, 3, 4, 3, 4, 3, 4, 5, 4, 5, 5],
      [1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 2, 3, 2, 2, 3, 3],
    ];
    const result: TrendsResponse['sector_density'] = [];
    for (let s = 0; s < sectors.length; s++) {
      for (let d = 0; d < 30; d++) {
        result.push({ sector: sectors[s], day: daysAgo(29 - d), signals: base[s][d] });
      }
    }
    return result;
  })(),
  risk_delta: Array.from({ length: 7 }, (_, i) => ({
    day: daysAgo(6 - i),
    avg_risk: [0.32, 0.30, 0.35, 0.28, 0.31, 0.27, 0.29][i],
  })),
};

/* ── Score Histogram / Metrics ────────────────────────────────── */
export const DEMO_METRICS = {
  histogram: [
    { range: '0.0–0.2', count: 4 },
    { range: '0.2–0.4', count: 12 },
    { range: '0.4–0.6', count: 28 },
    { range: '0.6–0.8', count: 45 },
    { range: '0.8–1.0', count: 23 },
  ] as ScoreBucket[],
  total: 112,
  avg_score: 0.674,
  above_threshold: 68,
};

/* ── Risk Radar ───────────────────────────────────────────────── */
export const DEMO_RISK: RiskRow[] = [
  { sector: 'Energy',    credibility: 0.88, materiality: 0.85, recency: 0.92, opportunity: 0.90, risk: 0.15 },
  { sector: 'Mining',    credibility: 0.82, materiality: 0.80, recency: 0.75, opportunity: 0.78, risk: 0.28 },
  { sector: 'Telecom',   credibility: 0.78, materiality: 0.72, recency: 0.85, opportunity: 0.82, risk: 0.18 },
  { sector: 'Logistics', credibility: 0.74, materiality: 0.70, recency: 0.68, opportunity: 0.72, risk: 0.22 },
  { sector: 'Finance',   credibility: 0.80, materiality: 0.76, recency: 0.70, opportunity: 0.74, risk: 0.14 },
];

/* ── Source Health ────────────────────────────────────────────── */
export const DEMO_SOURCES: SourceHealth[] = [
  { source_id: 'sie-gob-do',         name: 'SIE',              tier: 1, total_docs: 142, last_fetched: daysAgo(0), robots_denied: 0,  tags: ['energy'] },
  { source_id: 'cne-gob-do',         name: 'CNE',              tier: 1, total_docs: 98,  last_fetched: daysAgo(0), robots_denied: 0,  tags: ['energy', 'permits'] },
  { source_id: 'dgm-gob-do',         name: 'DGM',              tier: 1, total_docs: 67,  last_fetched: daysAgo(1), robots_denied: 0,  tags: ['mining'] },
  { source_id: 'usgs-gov',           name: 'USGS',             tier: 1, total_docs: 35,  last_fetched: daysAgo(2), robots_denied: 0,  tags: ['mining', 'geology'] },
  { source_id: 'bancentral-gov-do',  name: 'BCRD',             tier: 1, total_docs: 210, last_fetched: daysAgo(0), robots_denied: 0,  tags: ['finance', 'macro'] },
  { source_id: 'worldbank-org',      name: 'World Bank',       tier: 2, total_docs: 45,  last_fetched: daysAgo(1), robots_denied: 0,  tags: ['finance', 'FDI'] },
  { source_id: 'idb-org',            name: 'IDB',              tier: 2, total_docs: 38,  last_fetched: daysAgo(1), robots_denied: 0,  tags: ['finance', 'FDI'] },
  { source_id: 'prodominicana-gob',  name: 'ProDominicana',    tier: 2, total_docs: 83,  last_fetched: daysAgo(0), robots_denied: 0,  tags: ['investment'] },
  { source_id: 'dpworld-com',        name: 'DP World',         tier: 2, total_docs: 28,  last_fetched: daysAgo(3), robots_denied: 0,  tags: ['logistics', 'ports'] },
  { source_id: 'egehaina-com',       name: 'EGE Haina',        tier: 2, total_docs: 52,  last_fetched: daysAgo(1), robots_denied: 0,  tags: ['energy', 'solar'] },
  { source_id: 'altice-com-do',      name: 'Altice',           tier: 2, total_docs: 41,  last_fetched: daysAgo(2), robots_denied: 1,  tags: ['telecom'] },
  { source_id: 'diariolibre-com',    name: 'Diario Libre',     tier: 3, total_docs: 320, last_fetched: daysAgo(0), robots_denied: 2,  tags: ['news'] },
  { source_id: 'listin-com-do',      name: 'Listín Diario',    tier: 3, total_docs: 295, last_fetched: daysAgo(0), robots_denied: 3,  tags: ['news'] },
  { source_id: 'eldinero-com-do',    name: 'elDinero',         tier: 3, total_docs: 186, last_fetched: daysAgo(1), robots_denied: 0,  tags: ['finance', 'news'] },
  { source_id: 'hoy-com-do',         name: 'Hoy',              tier: 3, total_docs: 274, last_fetched: daysAgo(0), robots_denied: 1,  tags: ['news'] },
  { source_id: 'aird-org-do',        name: 'AIRD',             tier: 3, total_docs: 62,  last_fetched: daysAgo(2), robots_denied: 0,  tags: ['industry'] },
  { source_id: 'reddit-domrep',      name: 'r/DominicanRepublic', tier: 4, total_docs: 110, last_fetched: daysAgo(0), robots_denied: 0,  tags: ['community'] },
  { source_id: 'x-dr-energy',        name: 'X/DR-Energy',      tier: 4, total_docs: 89,  last_fetched: daysAgo(0), robots_denied: 0,  tags: ['energy', 'social'] },
];

/* ── Audit Panel ──────────────────────────────────────────────── */
export const DEMO_AUDIT: AuditSummary = {
  total_events: 1_847,
  total_errors: 12,
  events_by_type: {
    'document.stored':      1_420,
    'extraction.completed':   284,
    'alert.sent':              78,
    'robots.denied':           53,
    'error.fetch':             12,
  },
  recent_events: [
    { id: 'ae-001', event_type: 'document.stored',      entity_id: 'doc:sie-gob-do/res-2026-018',         created_at: new Date(Date.now() - 180_000).toISOString(),   payload: '{}' },
    { id: 'ae-002', event_type: 'extraction.completed',  entity_id: 'doc:cne-gob-do/permit-sf-001',        created_at: new Date(Date.now() - 420_000).toISOString(),   payload: '{}' },
    { id: 'ae-003', event_type: 'document.stored',      entity_id: 'doc:bancentral-gov-do/ipc-2026-02',   created_at: new Date(Date.now() - 900_000).toISOString(),   payload: '{}' },
    { id: 'ae-004', event_type: 'alert.sent',           entity_id: 'alert:convergence-phase-change',       created_at: new Date(Date.now() - 1_500_000).toISOString(), payload: '{}' },
    { id: 'ae-005', event_type: 'document.stored',      entity_id: 'doc:usgs-gov/samana-ree-update',       created_at: new Date(Date.now() - 2_100_000).toISOString(), payload: '{}' },
    { id: 'ae-006', event_type: 'robots.denied',        entity_id: 'src:diariolibre-com/api/search',       created_at: new Date(Date.now() - 3_000_000).toISOString(), payload: '{}' },
    { id: 'ae-007', event_type: 'extraction.completed',  entity_id: 'doc:worldbank-org/dr-climate-credit',  created_at: new Date(Date.now() - 3_600_000).toISOString(), payload: '{}' },
    { id: 'ae-008', event_type: 'document.stored',      entity_id: 'doc:dpworld-com/caucedo-expansion',    created_at: new Date(Date.now() - 4_200_000).toISOString(), payload: '{}' },
    { id: 'ae-009', event_type: 'document.stored',      entity_id: 'doc:altice-com-do/5g-trial',           created_at: new Date(Date.now() - 5_400_000).toISOString(), payload: '{}' },
    { id: 'ae-010', event_type: 'error.fetch',          entity_id: 'src:hoy-com-do/timeout',               created_at: new Date(Date.now() - 7_200_000).toISOString(), payload: '{}' },
  ],
};

export const DEMO_PROOFS: ProofRecord[] = [
  { id: 'p-001', document_hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', chain_id: 'eth-sepolia', chain_tx_hash: '0x7a2f…e4c1', anchored_at: daysAgo(1), block_number: 8_421_033 },
  { id: 'p-002', document_hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', chain_id: 'eth-sepolia', chain_tx_hash: '0x3e5b…a7f2', anchored_at: daysAgo(2), block_number: 8_419_187 },
  { id: 'p-003', document_hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', chain_id: 'eth-sepolia', chain_tx_hash: '0x9c1d…b3e8', anchored_at: daysAgo(4), block_number: 8_413_552 },
  { id: 'p-004', document_hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', chain_id: 'eth-sepolia', chain_tx_hash: null,           anchored_at: null,       block_number: null },
  { id: 'p-005', document_hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', chain_id: 'eth-sepolia', chain_tx_hash: null,           anchored_at: null,       block_number: null },
];
