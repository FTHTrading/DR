'use client';

import useSWR from 'swr';
import type { ConvergenceIndex } from '@/lib/types';
import { DEMO_CONVERGENCE } from '@/lib/demo-data';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PHASE_STYLES: Record<ConvergenceIndex['phase'], { ring: string; badge: string; label: string }> = {
  Monitoring:   { ring: 'stroke-zinc-600',    badge: 'bg-zinc-700  text-zinc-300',   label: 'Monitoring'   },
  Building:     { ring: 'stroke-dics-blue',   badge: 'bg-dics-blue  text-white',     label: 'Building'     },
  Accelerating: { ring: 'stroke-gold-400',    badge: 'bg-gold-400   text-black',     label: 'Accelerating' },
  Critical:     { ring: 'stroke-dics-green',  badge: 'bg-dics-green text-black',     label: 'Critical'     },
};

function GaugeArc({ value }: { value: number }) {
  const size   = 120;
  const cx     = size / 2;
  const cy     = size / 2;
  const r      = 46;
  const start  = Math.PI * 0.75;            // 135°
  const sweep  = Math.PI * 1.5;             // 270° total arc
  const angle  = start + (sweep * Math.min(value, 100)) / 100;

  const toXY   = (a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const s      = toXY(start);
  const e      = toXY(angle);
  const bg     = toXY(start + sweep);

  const largeArc = (sweep * value) / 100 > Math.PI ? 1 : 0;
  const bgLarge  = 1; // background arc is always > 180°

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Background arc */}
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${bgLarge} 1 ${bg.x} ${bg.y}`}
        fill="none" stroke="#27272a" strokeWidth={8} strokeLinecap="round"
      />
      {/* Value arc */}
      {value > 0 && (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
          fill="none" strokeWidth={8} strokeLinecap="round"
          className={
            value >= 75 ? 'stroke-dics-green' :
            value >= 55 ? 'stroke-gold-400'   :
            value >= 30 ? 'stroke-dics-blue'  :
            'stroke-zinc-500'
          }
        />
      )}
      {/* Center label */}
      <text x={cx} y={cy - 4}  textAnchor="middle" className="fill-zinc-100 text-2xl font-bold" style={{ fontSize: 22, fontWeight: 700 }}>{value}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-500"                    style={{ fontSize: 10 }}>/100</text>
    </svg>
  );
}

export function ConvergenceIndexTile({ refreshInterval = 120_000 }: { refreshInterval?: number }) {
  const { data, error, isLoading } = useSWR<ConvergenceIndex>(
    '/api/convergence',
    fetcher,
    { refreshInterval }
  );

  if (isLoading) return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 animate-pulse h-52" />
  );

  // Use demo data when API is unavailable (static export / no DB)
  const ci     = error ? DEMO_CONVERGENCE : data;
  const phase  = ci?.phase ?? 'Monitoring';
  const styles = PHASE_STYLES[phase];
  const delta  = ci?.delta_7d ?? 0;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            DR Convergence Index
          </h3>
          <p className="text-[10px] text-zinc-600 mt-0.5">30-day weighted cross-sector momentum</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      {/* Gauge + delta */}
      <div className="flex items-center gap-6">
        <GaugeArc value={ci?.index ?? 0} />
        <div className="space-y-2">
          <div>
            <span className="text-xs text-zinc-500">7-day delta</span>
            <div className={`text-xl font-bold tabular-nums ${delta > 0 ? 'text-dics-green' : delta < 0 ? 'text-dics-red' : 'text-zinc-400'}`}>
              {delta > 0 ? '+' : ''}{delta}
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-500">Phase</span>
            <div className="text-sm font-semibold text-zinc-200">{phase}</div>
          </div>
        </div>
      </div>

      {/* Sector breakdown */}
      <div className="border-t border-zinc-800 pt-3 space-y-1.5">
        {(ci?.sectors ?? []).map((s) => (
          <div key={s.sector} className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 w-20 shrink-0">{s.sector}</span>
            <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold-400 transition-all"
                style={{ width: `${Math.min(100, (s.contribution / (s.weight * 100)) * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-zinc-500 w-6 text-right tabular-nums">{s.signals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
