import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { AuditSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totals, byType, recent] = await Promise.all([
      query<{ total: string; errors: string }>(`
        SELECT
          COUNT(*)::text AS total,
          SUM(CASE WHEN event_type LIKE 'error%' THEN 1 ELSE 0 END)::text AS errors
        FROM audit_log
      `),
      query<{ event_type: string; cnt: string }>(`
        SELECT event_type, COUNT(*)::text AS cnt
        FROM audit_log
        GROUP BY event_type
        ORDER BY cnt DESC
        LIMIT 10
      `),
      query<{ id: string; event_type: string; entity_id: string; created_at: string; payload: string }>(`
        SELECT id::text, event_type, entity_id, created_at::text, payload::text
        FROM audit_log
        ORDER BY created_at DESC
        LIMIT 20
      `),
    ]);

    const summary: AuditSummary = {
      total_events:    parseInt(totals[0]?.total ?? '0'),
      total_errors:    parseInt(totals[0]?.errors ?? '0'),
      events_by_type:  Object.fromEntries(byType.map((r) => [r.event_type, parseInt(r.cnt)])),
      recent_events:   recent.map((r) => ({
        id:          r.id,
        event_type:  r.event_type,
        entity_id:   r.entity_id,
        created_at:  r.created_at,
        payload:     r.payload,
      })),
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[api/audit] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
