import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { TrendsResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
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
      WITH top_sectors AS (
        SELECT COALESCE(metadata->>'sector', 'Unknown') AS sector
        FROM claims
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY sector
        ORDER BY COUNT(*) DESC
        LIMIT 6
      )
      SELECT
        COALESCE(c.metadata->>'sector', 'Unknown') AS sector,
        DATE(c.created_at)::text                   AS day,
        COUNT(*)::text                             AS signals
      FROM claims c
      JOIN top_sectors ts ON COALESCE(c.metadata->>'sector', 'Unknown') = ts.sector
      WHERE c.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY sector, day
      ORDER BY day ASC, sector
    `),

    // 7-day rolling mean risk score
    query<{ day: string; avg_risk: string }>(`
      SELECT
        DATE(created_at)::text                          AS day,
        ROUND(AVG(
          (score_components->>'risk')::numeric
        )::numeric, 4)::text AS avg_risk
      FROM claims
      WHERE
        created_at      >= NOW() - INTERVAL '7 days'
        AND score_components IS NOT NULL
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
}
