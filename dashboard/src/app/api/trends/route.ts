import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { TrendsResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

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
    const [velocity, sectorDensity, riskDelta] = await Promise.all([
      // 7-day high-signal velocity
      query<{ day: string; signals: string; avg_score: string }>(`
        SELECT
          DATE(created_at)::text            AS day,
          COUNT(*)::text                    AS signals,
          ROUND(AVG(composite_score)::numeric, 4)::text AS avg_score
        FROM claims
        WHERE
          created_at  >= NOW() - INTERVAL '7 days'
          AND composite_score >= 0.65
        GROUP BY day
        ORDER BY day ASC
      `),

      // 30-day per-sector signal density (top 6 sectors)
      query<{ sector: string; day: string; signals: string }>(`
        WITH sectors AS (
          SELECT ${SECTOR_CASE} AS sector, c.created_at
          FROM claims c
          JOIN documents d ON d.id = c.doc_id
          WHERE c.created_at >= NOW() - INTERVAL '30 days'
        ),
        top_sectors AS (
          SELECT sector
          FROM sectors
          GROUP BY sector
          ORDER BY COUNT(*) DESC
          LIMIT 6
        )
        SELECT
          s.sector,
          DATE(s.created_at)::text AS day,
          COUNT(*)::text           AS signals
        FROM sectors s
        JOIN top_sectors ts ON s.sector = ts.sector
        GROUP BY s.sector, day
        ORDER BY day ASC, s.sector
      `),

      // 7-day rolling mean risk score (uses the actual risk column)
      query<{ day: string; avg_risk: string }>(`
        SELECT
          DATE(created_at)::text                          AS day,
          ROUND(AVG(risk)::numeric, 4)::text              AS avg_risk
        FROM claims
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY day ASC
      `),
    ]);

    const response: TrendsResponse = {
      velocity: velocity.map((r) => ({
        day:       r.day,
        signals:   parseInt(r.signals),
        avg_score: parseFloat(r.avg_score),
      })),
      sector_density: sectorDensity.map((r) => ({
        sector:  r.sector,
        day:     r.day,
        signals: parseInt(r.signals),
      })),
      risk_delta: riskDelta.map((r) => ({
        day:      r.day,
        avg_risk: parseFloat(r.avg_risk ?? '0'),
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[api/trends] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
