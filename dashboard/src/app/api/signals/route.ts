import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Signal } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const minScore = parseFloat(searchParams.get('min_score') ?? '0');
    const tag = searchParams.get('tag');

    const tagFilter = tag ? `AND $3 = ANY(d.tags)` : '';
    const params: unknown[] = [limit, minScore];
    if (tag) params.push(tag);

    const rows = await query<Signal>(`
      SELECT
        c.id,
        c.doc_id,
        c.statement,
        c.who,
        c.where_text,
        c.when_text,
        c.composite_score,
        c.credibility,
        c.materiality,
        c.opportunity,
        c.risk,
        c.usd_amount,
        d.url AS source_url,
        d.fetched_at,
        d.tags
      FROM claims c
      JOIN documents d ON d.id = c.doc_id
      WHERE c.composite_score >= $2
        ${tagFilter}
      ORDER BY c.composite_score DESC
      LIMIT $1
    `, params);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/signals] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
