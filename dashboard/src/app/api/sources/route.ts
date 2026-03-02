import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { SourceHealth } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Aggregate per-source stats from the documents table
    const rows = await query<{
      source_id: string;
      total_docs: string;
      last_fetched: string | null;
      tags: string[];
    }>(`
      SELECT
        source_id,
        COUNT(*)::text AS total_docs,
        MAX(fetched_at)::text AS last_fetched,
        (array_agg(tags ORDER BY fetched_at DESC))[1] AS tags
      FROM documents
      GROUP BY source_id
      ORDER BY total_docs DESC
    `);

    // Robots denials per source from audit_log
    const denials = await query<{ source_id: string; cnt: string }>(`
      SELECT entity_id AS source_id, COUNT(*)::text AS cnt
      FROM audit_log
      WHERE event_type = 'robots.denied'
      GROUP BY entity_id
    `);
    const denialMap = new Map(denials.map((d) => [d.source_id, parseInt(d.cnt)]));

    const sources: SourceHealth[] = rows.map((r) => ({
      source_id: r.source_id,
      name: r.source_id,
      tier: 3, // tier resolved client-side from sources.yaml if needed
      total_docs: parseInt(r.total_docs),
      last_fetched: r.last_fetched,
      robots_denied: denialMap.get(r.source_id) ?? 0,
      tags: r.tags ?? [],
    }));

    return NextResponse.json(sources);
  } catch (err) {
    console.error('[api/sources] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
