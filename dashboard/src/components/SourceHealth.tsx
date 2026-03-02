'use client';

import useSWR from 'swr';
import type { SourceHealth } from '@/lib/types';
import { DEMO_SOURCES } from '@/lib/demo-data';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const tierBadge = (tier: number) => {
  switch (tier) {
    case 1: return 'bg-dics-green   text-black';
    case 2: return 'bg-dics-blue    text-white';
    case 3: return 'bg-dics-orange  text-black';
    default: return 'bg-zinc-600    text-zinc-200';
  }
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs  = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 24) return `${Math.floor(hrs / 24)}d ago`;
  if (hrs > 0)  return `${hrs}h ${mins}m ago`;
  return `${mins}m ago`;
}

export function SourceHealthTable({ refreshInterval = 60000 }: { refreshInterval?: number }) {
  const { data, error, isLoading } = useSWR<SourceHealth[]>(
    '/api/sources',
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return <div className="animate-pulse text-zinc-500 p-4">Loading sources…</div>;

  // Use demo data when API is unavailable (static export / no DB)
  const sources = error ? DEMO_SOURCES : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-700">
          <tr>
            <th className="pb-2 pr-4">Tier</th>
            <th className="pb-2 pr-4">Source ID</th>
            <th className="pb-2 pr-4 text-right">Docs</th>
            <th className="pb-2 pr-4 text-right">Denied</th>
            <th className="pb-2">Last Fetched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {sources?.map((src) => (
            <tr key={src.source_id} className="hover:bg-zinc-900 transition-colors">
              <td className="py-2 pr-4">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierBadge(src.tier)}`}>
                  T{src.tier}
                </span>
              </td>
              <td className="py-2 pr-4 text-zinc-200 font-mono text-xs">{src.source_id}</td>
              <td className="py-2 pr-4 text-right tabular-nums text-zinc-300">
                {src.total_docs.toLocaleString()}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                <span className={src.robots_denied > 0 ? 'text-dics-red' : 'text-zinc-500'}>
                  {src.robots_denied}
                </span>
              </td>
              <td className="py-2 text-zinc-400 text-xs">{timeAgo(src.last_fetched)}</td>
            </tr>
          ))}
          {sources?.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-zinc-500">No source data yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
