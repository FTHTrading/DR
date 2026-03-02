'use client';

import useSWR from 'swr';
import type { AuditSummary, ProofRecord } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const EVENT_COLORS: Record<string, string> = {
  'document.stored':        'text-dics-green',
  'robots.denied':          'text-dics-red',
  'extraction.completed':   'text-dics-blue',
  'alert.sent':             'text-gold',
  'error.fetch':            'text-dics-orange',
};

function eventColor(type: string) {
  return EVENT_COLORS[type] ?? 'text-zinc-400';
}

export function AuditPanel({ refreshInterval = 60000 }: { refreshInterval?: number }) {
  const { data: audit } = useSWR<AuditSummary>('/api/audit', fetcher, { refreshInterval });
  const { data: proofs } = useSWR<ProofRecord[]>('/api/proof?limit=5', fetcher, { refreshInterval });

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Events"  value={audit?.total_events ?? '—'} />
        <Stat label="Errors"        value={audit?.total_errors ?? '—'} colorClass="text-dics-red" />
        <Stat label="Proofs Anchored" value={proofs?.length ?? '—'} colorClass="text-dics-green" />
        <Stat
          label="Top Event"
          value={Object.entries(audit?.events_by_type ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'}
          colorClass="text-gold-400"
          small
        />
      </div>

      {/* Recent events */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Recent Audit Events</h4>
        <ul className="space-y-1 text-xs font-mono">
          {audit?.recent_events?.slice(0, 10).map((e) => (
            <li key={e.id} className="flex gap-3 items-start">
              <span className="text-zinc-600 shrink-0">{new Date(e.created_at).toLocaleTimeString()}</span>
              <span className={`shrink-0 w-36 ${eventColor(e.event_type)}`}>{e.event_type}</span>
              <span className="text-zinc-400 truncate">{e.entity_id}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Proof registry */}
      {proofs && proofs.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Proof Registry (latest 5)</h4>
          <ul className="space-y-1 text-xs font-mono">
            {proofs.map((p) => (
              <li key={p.id} className="flex gap-3 items-start">
                <span className="text-zinc-600 shrink-0">{p.anchored_at ? new Date(p.anchored_at).toLocaleDateString() : '—'}</span>
                <span className="text-dics-teal truncate w-44">{p.chain_tx_hash ?? 'Pending'}</span>
                <span className="text-zinc-500 truncate">{p.document_hash.slice(0, 16)}…</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  colorClass = 'text-zinc-100',
  small = false,
}: {
  label: string;
  value: string | number;
  colorClass?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 font-bold ${small ? 'text-sm' : 'text-xl'} tabular-nums ${colorClass}`}>{value}</div>
    </div>
  );
}
