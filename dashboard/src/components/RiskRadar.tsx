'use client';

import useSWR from 'swr';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { RiskRow } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#14b8a6', '#ef4444', '#ec4899'];

const DIMS: { key: keyof Omit<RiskRow, 'sector'>; label: string }[] = [
  { key: 'political',  label: 'Political'  },
  { key: 'regulatory', label: 'Regulatory' },
  { key: 'esg',        label: 'ESG'        },
  { key: 'fx',         label: 'FX'         },
  { key: 'execution',  label: 'Execution'  },
];

export function RiskRadar({ refreshInterval = 60000 }: { refreshInterval?: number }) {
  const { data, error, isLoading } = useSWR<RiskRow[]>(
    '/api/risk',
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return <div className="animate-pulse text-zinc-500 p-4 h-64" />;
  if (error)     return <div className="text-dics-red p-4">Failed to load risk data.</div>;

  // Build radar data: each dim is a row, each sector is a key
  const sectors = (data ?? []).slice(0, 6); // max 6 sectors for legibility

  const radarData = DIMS.map(({ key, label }) => {
    const row: Record<string, string | number> = { dim: label };
    sectors.forEach((s) => { row[s.sector] = s[key]; });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#3f3f46" />
        <PolarAngleAxis dataKey="dim" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
        <PolarRadiusAxis angle={18} domain={[0, 1]} tick={{ fill: '#71717a', fontSize: 9 }} />
        {sectors.map((s, i) => (
          <Radar
            key={s.sector}
            name={s.sector}
            dataKey={s.sector}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.12}
            strokeWidth={1.5}
          />
        ))}
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7' }}
          formatter={(value: number) => [value.toFixed(2), '']}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
