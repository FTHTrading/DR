'use client';

import useSWR from 'swr';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreBucket } from '@/lib/types';
import { DEMO_METRICS } from '@/lib/demo-data';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MetricsResponse {
  histogram: ScoreBucket[];
  total: number;
  avg_score: number;
  above_threshold: number;
}

const barColor = (range: string) => {
  const lower = parseFloat(range);
  if (lower >= 0.85) return '#22c55e'; // green
  if (lower >= 0.65) return '#f59e0b'; // gold
  if (lower >= 0.40) return '#f97316'; // orange
  return '#52525b';                    // zinc
};

export function ScoreHistogram({ refreshInterval = 60000 }: { refreshInterval?: number }) {
  const { data, error, isLoading } = useSWR<MetricsResponse>(
    '/api/metrics',
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return <div className="animate-pulse text-zinc-500 p-4 h-48" />;

  // Use demo data when API is unavailable (static export / no DB)
  const metrics = error ? DEMO_METRICS : data;

  const chartData = (metrics?.histogram ?? []).map((b) => ({
    ...b,
    fill: barColor(b.range),
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm">
        <span className="text-zinc-400">
          Total claims: <strong className="text-zinc-100">{metrics?.total?.toLocaleString()}</strong>
        </span>
        <span className="text-zinc-400">
          Avg score: <strong className="text-gold-400">{metrics?.avg_score?.toFixed(3)}</strong>
        </span>
        <span className="text-zinc-400">
          Above threshold (≥0.65):{' '}
          <strong className="text-dics-green">{metrics?.above_threshold?.toLocaleString()}</strong>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="range" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7' }}
            formatter={(value: number) => [value, 'Claims']}
          />
          <ReferenceLine x="0.6" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Threshold', fill: '#f59e0b', fontSize: 10 }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
