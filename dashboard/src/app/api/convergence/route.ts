import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ConvergenceIndex, ConvergenceSector } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Sector weights must sum to 1.0
const SECTOR_WEIGHTS: Record<string, number> = {
  Energy:     0.30,
  Mining:     0.25,
  Logistics:  0.20,
  Telecom:    0.15,
  Finance:    0.10,
};

// Phase thresholds (0–100)
function toPhase(index: number): ConvergenceIndex['phase'] {
  if (index >= 75) return 'Critical';
  if (index >= 55) return 'Accelerating';
  if (index >= 30) return 'Building';
  return 'Monitoring';
}

// Derive sector from document tags
const SECTOR_CASE = `
  CASE
    WHEN 'mining'    = ANY(d.tags) OR 'rare_earth' = ANY(d.tags) OR 'geology'   = ANY(d.tags) THEN 'Mining'
    WHEN 'energy'    = ANY(d.tags) OR 'solar'      = ANY(d.tags) OR 'bess'      = ANY(d.tags) OR 'grid'    = ANY(d.tags) THEN 'Energy'
    WHEN 'telecom'   = ANY(d.tags) OR 'connectivity'= ANY(d.tags) OR 'cables'   = ANY(d.tags) OR 'digital' = ANY(d.tags) OR 'spectrum' = ANY(d.tags) THEN 'Telecom'
    WHEN 'logistics' = ANY(d.tags) OR 'ports'      = ANY(d.tags) OR 'shipping'  = ANY(d.tags) THEN 'Logistics'
    WHEN 'finance'   = ANY(d.tags) OR 'FDI'        = ANY(d.tags) OR 'macro'     = ANY(d.tags) OR 'investment' = ANY(d.tags) THEN 'Finance'
    ELSE 'Other'
  END`;

export async function GET() {
  try {
    // Current 30-day window
    const current = await query<{ sector: string; signals: string; avg_score: string }>(`
      SELECT
        ${SECTOR_CASE} AS sector,
        COUNT(*)::text                           AS signals,
        ROUND(AVG(c.composite_score)::numeric, 4)::text AS avg_score
      FROM claims c
      JOIN documents d ON d.id = c.doc_id
      WHERE c.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY sector
    `);

    // Previous 30-day window for delta
    const previous = await query<{ sector: string; signals: string }>(`
      SELECT
        ${SECTOR_CASE} AS sector,
        COUNT(*)::text AS signals
      FROM claims c
      JOIN documents d ON d.id = c.doc_id
      WHERE
        c.created_at >= NOW() - INTERVAL '60 days'
        AND c.created_at <  NOW() - INTERVAL '30 days'
      GROUP BY sector
    `);

  const prevMap = new Map(previous.map((r) => [r.sector, parseInt(r.signals)]));

  // Max signals across sectors (for normalisation)
  const maxSignals = Math.max(
    1,
    ...Object.keys(SECTOR_WEIGHTS).map(
      (s) => parseInt(current.find((r) => r.sector === s)?.signals ?? '0')
    )
  );

  let totalIndex   = 0;
  let prevIndex    = 0;
  const sectors: ConvergenceSector[] = [];

  for (const [sector, weight] of Object.entries(SECTOR_WEIGHTS)) {
    const row      = current.find((r) => r.sector === sector);
    const signals  = parseInt(row?.signals  ?? '0');
    const avgScore = parseFloat(row?.avg_score ?? '0');

    // Normalised 0–1: blend 60% density normalised + 40% avg score
    const densityNorm  = signals / maxSignals;
    const normalised   = densityNorm * 0.6 + avgScore * 0.4;
    const contribution = weight * normalised * 100;

    totalIndex += contribution;

    // Previous period contribution (density only for delta)
    const prevSignals = prevMap.get(sector) ?? 0;
    prevIndex += weight * (prevSignals / maxSignals) * 0.6 * 100;
    prevIndex += weight * avgScore * 0.4 * 100; // avg score unchanged for prev delta

    sectors.push({ sector, weight, signals, avg_score: avgScore, contribution });
  }

  const index    = Math.min(100, Math.round(totalIndex));
  const delta7d  = Math.round(totalIndex - prevIndex * (7 / 30)); // proportional 7d delta

  const result: ConvergenceIndex = {
    index,
    phase:       toPhase(index),
    delta_7d:    delta7d,
    sectors:     sectors.sort((a, b) => b.contribution - a.contribution),
    computed_at: new Date().toISOString(),
  };

  return NextResponse.json(result);
  } catch (err) {
    console.error('[api/convergence] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
