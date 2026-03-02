'use client';

import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TrendsResponse, TrendPoint } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── Velocity chart (7-day high-signal line) ─────────────────── */
function VelocityChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((d) => ({
    day:       d.day.slice(5),          // MM-DD
    signals:   d.signals,
    avg_score: +(d.avg_score * 100).toFixed(1), // display as 0–100
  }));

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-3">
        High-score signals (≥ 0.65) per day — last 7 days
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="day" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <YAxis yAxisId="left"  tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 }}
            formatter={(v: number, name: string) =>
              name === 'avg_score' ? [`${v} / 100`, 'Avg Score'] : [v, 'Signals']
            }
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#a1a1aa' }} />
          <Line yAxisId="left"  type="monotone" dataKey="signals"   stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Signals" />
          <Line yAxisId="right" type="monotone" dataKey="avg_score" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="avg_score" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Sector density chart (30-day stacked lines) ─────────────── */
function SectorDensityChart({ data }: { data: TrendsResponse['sector_density'] }) {
  // Pivot: { day → { sector: count } }
  const dayMap = new Map<string, Record<string, number>>();
  for (const row of data) {
    const existing = dayMap.get(row.day) ?? {};
    existing[row.sector] = row.signals;
    dayMap.set(row.day, existing);
  }
  const sectors = [...new Set(data.map((d) => d.sector))];
  const chartData = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, vals]) => ({ day: day.slice(5), ...vals }));

  const COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#14b8a6'];

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-3">Signal density per sector — last 30 days</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#a1a1aa', fontSize: 9 }}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#a1a1aa' }} />
          {sectors.map((s, i) => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Risk delta chart (7-day rolling risk) ─────────────────────── */
function RiskDeltaChart({ data }: { data: TrendsResponse['risk_delta'] }) {
  const chartData = data.map((d) => ({
    day:      d.day.slice(5),
    avg_risk: +(d.avg_risk * 100).toFixed(1),
  }));

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-3">Mean risk score over last 7 days (0–100)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="day" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 }}
            formatter={(v: number) => [`${v} / 100`, 'Avg Risk']}
          />
          <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="avg_risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Avg Risk" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export function TrendCharts({ refreshInterval = 120_000 }: { refreshInterval?: number }) {
  const { data, error, isLoading } = useSWR<TrendsResponse>(
    '/api/trends',
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return <div className="animate-pulse text-zinc-500 p-4 h-48">Loading trend data…</div>;
  if (error)     return <div className="text-dics-red p-4">Failed to load trends.</div>;

  return (
    <div className="space-y-8">
      <VelocityChart        data={data?.velocity      ?? []} />
      <SectorDensityChart   data={data?.sector_density ?? []} />
      <RiskDeltaChart       data={data?.risk_delta     ?? []} />
    </div>
  );
}
