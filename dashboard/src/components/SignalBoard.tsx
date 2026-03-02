'use client';

import useSWR from 'swr';
import type { Signal } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const scoreBadge = (score: number) => {
  if (score >= 0.85) return 'bg-dics-green text-black';
  if (score >= 0.65) return 'bg-gold-400 text-black';
  if (score >= 0.40) return 'bg-dics-orange text-black';
  return 'bg-zinc-700 text-zinc-200';
};

interface SignalBoardProps {
  minScore?: number;
  tag?: string;
  limit?: number;
  refreshInterval?: number;
}

export function SignalBoard({ minScore = 0, tag = '', limit = 20, refreshInterval = 30000 }: SignalBoardProps) {
  const params = new URLSearchParams({
    limit: String(limit),
    min_score: String(minScore),
    ...(tag ? { tag } : {}),
  });

  const { data, error, isLoading } = useSWR<Signal[]>(
    `/api/signals?${params}`,
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return <div className="animate-pulse text-zinc-500 p-4">Loading signals…</div>;
  if (error)     return <div className="text-dics-red p-4">Failed to load signals.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-700">
          <tr>
            <th className="pb-2 pr-4">Score</th>
            <th className="pb-2 pr-4">Statement</th>
            <th className="pb-2 pr-4">Who</th>
            <th className="pb-2 pr-4">Where</th>
            <th className="pb-2 pr-4">USD Est.</th>
            <th className="pb-2 pr-4">Source</th>
            <th className="pb-2">Fetched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {data?.map((sig) => (
            <tr key={sig.id} className="hover:bg-zinc-900 transition-colors">
              <td className="py-3 pr-4">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${scoreBadge(sig.composite_score)}`}>
                  {sig.composite_score.toFixed(2)}
                </span>
              </td>
              <td className="py-3 pr-4 max-w-sm">
                <p className="line-clamp-2 text-zinc-200">{sig.statement}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(sig.tags ?? []).map((t) => (
                    <span key={t} className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </td>
              <td className="py-3 pr-4 text-zinc-300 whitespace-nowrap">{sig.who ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-300 whitespace-nowrap">{sig.where_text ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-300 whitespace-nowrap">
                {sig.usd_amount ? `$${sig.usd_amount.toLocaleString()}` : '—'}
              </td>
              <td className="py-3 pr-4 max-w-[160px]">
                <a
                  href={sig.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dics-blue hover:underline truncate block"
                  title={sig.source_url}
                >
                  {new URL(sig.source_url).hostname}
                </a>
              </td>
              <td className="py-3 text-zinc-500 whitespace-nowrap text-xs">
                {new Date(sig.fetched_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {data?.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-zinc-500">No signals found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
