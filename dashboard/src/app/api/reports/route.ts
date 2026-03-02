import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 90);

    const rows = await query<{
      brief_date: string;
      convergence_phase: string;
      convergence_index: number;
      risk_level: string;
      capital_window: string;
      narrative: string;
      claims_count: number;
      docs_count: number;
      pdf_url: string | null;
      created_at: string;
    }>(`
      SELECT
        brief_date,
        convergence_phase,
        convergence_index,
        risk_level,
        capital_window,
        narrative,
        claims_count,
        docs_count,
        pdf_url,
        created_at
      FROM daily_briefs
      ORDER BY brief_date DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/reports] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
