import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { RiskRow } from '@/lib/types';

export async function GET() {
  try {
    // Aggregate average 5-dim scoring from claims, grouped by sector derived from document tags
    const rows = await query<{
      sector: string;
      credibility: string;
      materiality: string;
      recency: string;
      opportunity: string;
      risk: string;
      count: string;
    }>(`
      SELECT
        CASE
          WHEN 'mining'   = ANY(d.tags) OR 'rare_earth' = ANY(d.tags) OR 'geology' = ANY(d.tags) THEN 'Mining'
          WHEN 'energy'   = ANY(d.tags) OR 'solar' = ANY(d.tags) OR 'bess' = ANY(d.tags) OR 'grid' = ANY(d.tags) THEN 'Energy'
          WHEN 'telecom'  = ANY(d.tags) OR 'connectivity' = ANY(d.tags) OR 'cables' = ANY(d.tags) OR 'digital' = ANY(d.tags) OR 'spectrum' = ANY(d.tags) THEN 'Telecom'
          WHEN 'logistics' = ANY(d.tags) OR 'ports' = ANY(d.tags) OR 'shipping' = ANY(d.tags) THEN 'Logistics'
          WHEN 'finance'  = ANY(d.tags) OR 'FDI' = ANY(d.tags) OR 'macro' = ANY(d.tags) OR 'investment' = ANY(d.tags) THEN 'Finance'
          ELSE 'Other'
        END AS sector,
        AVG(c.credibility)::text  AS credibility,
        AVG(c.materiality)::text  AS materiality,
        AVG(c.recency)::text      AS recency,
        AVG(c.opportunity)::text  AS opportunity,
        AVG(c.risk)::text         AS risk,
        COUNT(*)::text            AS count
      FROM claims c
      JOIN documents d ON d.id = c.doc_id
      GROUP BY sector
      ORDER BY count DESC
      LIMIT 10
    `);

    const risk: RiskRow[] = rows.map((r) => ({
      sector:      r.sector,
      credibility: parseFloat(r.credibility ?? '0'),
      materiality: parseFloat(r.materiality ?? '0'),
      recency:     parseFloat(r.recency     ?? '0'),
      opportunity: parseFloat(r.opportunity ?? '0'),
      risk:        parseFloat(r.risk        ?? '0'),
    }));

    return NextResponse.json(risk);
  } catch (err) {
    console.error('[api/risk] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
