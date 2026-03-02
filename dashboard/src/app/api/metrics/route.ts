import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ScoreBucket } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Score distribution histogram in 0.1 buckets
  const rows = await query<{ bucket: string; count: string }>(`
    SELECT
      (floor(composite_score * 10) / 10)::text AS bucket,
      COUNT(*)::text AS count
    FROM claims
    GROUP BY bucket
    ORDER BY bucket
  `);

  const buckets: ScoreBucket[] = rows.map((r) => ({
    range: `${parseFloat(r.bucket).toFixed(1)}–${(parseFloat(r.bucket) + 0.1).toFixed(1)}`,
    count: parseInt(r.count),
  }));

  // Summary stats
  const [stats] = await query<{
    total: string;
    avg_score: string;
    above_threshold: string;
  }>(`
    SELECT
      COUNT(*)::text AS total,
      ROUND(AVG(composite_score)::numeric, 3)::text AS avg_score,
      COUNT(*) FILTER (WHERE composite_score >= 0.65)::text AS above_threshold
    FROM claims
  `);

  return NextResponse.json({
    buckets,
    total: parseInt(stats?.total ?? '0'),
    avg_score: parseFloat(stats?.avg_score ?? '0'),
    above_threshold: parseInt(stats?.above_threshold ?? '0'),
  });
}
