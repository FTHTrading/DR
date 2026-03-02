import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ProofRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

  const rows = await query<ProofRecord>(`
    SELECT
      pr.id,
      pr.document_id,
      d.source_url,
      pr.document_hash,
      pr.chain_id,
      pr.chain_tx_hash,
      pr.block_number,
      pr.anchored_at::text AS anchored_at
    FROM proof_registry pr
    LEFT JOIN documents d ON d.id = pr.document_id
    ORDER BY pr.anchored_at DESC
    LIMIT $1
  `, [limit]);

  return NextResponse.json(rows);
}
