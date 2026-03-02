import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { RiskRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Aggregate average 5-dim risk scores from claims
  const rows = await query<{
    sector: string;
    political: string;
    regulatory: string;
    esg: string;
    fx: string;
    execution: string;
    count: string;
  }>(`
    SELECT
      COALESCE((metadata->>'sector'), 'Unknown') AS sector,
      AVG((score_components->>'political')::numeric)::text  AS political,
      AVG((score_components->>'regulatory')::numeric)::text AS regulatory,
      AVG((score_components->>'esg')::numeric)::text        AS esg,
      AVG((score_components->>'fx')::numeric)::text         AS fx,
      AVG((score_components->>'execution')::numeric)::text  AS execution,
      COUNT(*)::text AS count
    FROM claims
    WHERE score_components IS NOT NULL
    GROUP BY sector
    ORDER BY count DESC
    LIMIT 10
  `);

  const risk: RiskRow[] = rows.map((r) => ({
    sector: r.sector,
    political:  parseFloat(r.political  ?? '0'),
    regulatory: parseFloat(r.regulatory ?? '0'),
    esg:        parseFloat(r.esg        ?? '0'),
    fx:         parseFloat(r.fx         ?? '0'),
    execution:  parseFloat(r.execution  ?? '0'),
  }));

  return NextResponse.json(risk);
}
