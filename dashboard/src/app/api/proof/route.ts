import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ProofRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

    const rows = await query<ProofRecord>(`
      SELECT
        pr.id,
        pr.document_hash,
        pr.chain_id,
        pr.chain_tx_hash,
        pr.block_number,
        pr.anchored_at::text AS anchored_at
      FROM proof_registry pr
      ORDER BY pr.created_at DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/proof] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
