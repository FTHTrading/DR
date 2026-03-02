import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  unit?: string;
  colorClass?: string;   // tailwind text-* class, default text-gold-400
}

const trendIcon = {
  up:      '▲',
  down:    '▼',
  neutral: '—',
};

const trendColor = {
  up:      'text-dics-green',
  down:    'text-dics-red',
  neutral: 'text-zinc-400',
};

export function MetricCard({ label, value, trend = 'neutral', unit, colorClass = 'text-gold-400' }: MetricCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 flex flex-col gap-2 shadow-lg">
      <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${colorClass}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg ml-1 text-zinc-400">{unit}</span>}
      </span>
      {trend !== 'neutral' && (
        <span className={`text-sm font-medium ${trendColor[trend]}`}>
          {trendIcon[trend]} {trend === 'up' ? 'Trending Up' : 'Trending Down'}
        </span>
      )}
    </div>
  );
}
