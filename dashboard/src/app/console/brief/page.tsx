'use client';

import { useEffect, useState } from 'react';
import type { DailyBriefData, SectorMomentum, AssetBrief } from '@/lib/types';

// ── Phase color map ───────────────────────────────────────────────────────────

const PHASE_STYLE: Record<string, string> = {
  Monitoring:   'bg-zinc-500/20 text-zinc-400',
  Building:     'bg-blue-500/20 text-blue-400',
  Accelerating: 'bg-amber-500/20 text-amber-400',
  Critical:     'bg-emerald-500/20 text-emerald-300',
};

const RISK_STYLE: Record<string, string> = {
  Minimal:  'text-emerald-400',
  Low:      'text-green-400',
  Moderate: 'text-amber-400',
  High:     'text-red-400',
};

const WINDOW_STYLE: Record<string, string> = {
  Opening:            'text-emerald-400',
  'Neutral-Positive': 'text-blue-400',
  Neutral:            'text-zinc-400',
  Contracting:        'text-red-400',
};

const TREND_ICON: Record<string, string> = {
  rising:  '↑',
  stable:  '→',
  falling: '↓',
};

const TREND_COLOR: Record<string, string> = {
  rising:  'text-emerald-400',
  stable:  'text-zinc-400',
  falling: 'text-red-400',
};

const SECTOR_LABELS: Record<string, string> = {
  energy:    'Energy & Power',
  mining:    'Mining & Resources',
  telecom:   'Telecoms & Digital',
  logistics: 'Logistics & Ports',
  finance:   'Finance & Capital',
  tourism:   'Tourism & Hospitality',
  macro:     'Macro & Regulatory',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BriefPage() {
  const [brief, setBrief] = useState<DailyBriefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/daily-brief')
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(setBrief)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-zinc-500 text-sm">
          Generating intelligence brief…
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-red-400 text-sm">
          Failed to generate brief: {error ?? 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1100px] mx-auto">
      {/* ── Cover ────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
              Daily Intelligence Brief
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              {formatDate(brief.date)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge label={brief.convergence_phase} style={PHASE_STYLE[brief.convergence_phase]} />
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Convergence</div>
              <div className="text-xl font-bold text-gold">{brief.convergence_index.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── KPI Strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Documents" value={brief.docs_24h} sub="24h" color="text-dics-blue" />
        <KpiCard label="Claims" value={brief.claims_24h} sub="24h" color="text-dics-green" />
        <KpiCard
          label="Risk Level"
          value={brief.risk_level}
          color={RISK_STYLE[brief.risk_level] ?? 'text-zinc-400'}
        />
        <KpiCard
          label="Capital Window"
          value={brief.capital_window}
          color={WINDOW_STYLE[brief.capital_window] ?? 'text-zinc-400'}
        />
      </div>

      {/* ── Executive Summary ────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Executive Summary" />
        <Panel>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {brief.executive_summary}
          </p>
        </Panel>
      </section>

      {/* ── Sector Momentum ──────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Sector Momentum" subtitle="7-day signal trend comparison" />
        <Panel>
          <div className="space-y-2">
            {brief.sector_momentum.length === 0 ? (
              <p className="text-xs text-zinc-500">No sector data available.</p>
            ) : (
              brief.sector_momentum.map((s: SectorMomentum) => (
                <SectorRow key={s.sector} sector={s} />
              ))
            )}
          </div>
        </Panel>
      </section>

      {/* ── Asset Impact Panels ──────────────────────────────────────── */}
      <section>
        <SectionHeader title="Asset Impact Analysis" subtitle="Per-project intelligence impact assessment" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {brief.asset_impacts.map((a: AssetBrief) => (
            <AssetCard key={a.project_id} asset={a} />
          ))}
        </div>
      </section>

      {/* ── Risk & Capital Narratives ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionHeader title="Risk Assessment" />
          <Panel>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {brief.risk_narrative}
            </p>
          </Panel>
        </section>
        <section>
          <SectionHeader title="Capital Readiness" />
          <Panel>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {brief.capital_narrative}
            </p>
          </Panel>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-4 flex items-center justify-between">
        <span>DICS · DR Intelligence Command System</span>
        <span>Generated {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
      </footer>
    </div>
  );
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function Badge({ label, style }: { label: string; style: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}

function KpiCard({
  label, value, sub, color,
}: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>
        {value}
        {sub && <span className="text-xs text-zinc-500 ml-1 font-normal">{sub}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-bold text-zinc-100">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg">
      {children}
    </div>
  );
}

function SectorRow({ sector }: { sector: SectorMomentum }) {
  const label = SECTOR_LABELS[sector.sector] ?? sector.sector;
  const trendColor = TREND_COLOR[sector.trend] ?? 'text-zinc-400';
  const icon = TREND_ICON[sector.trend] ?? '→';
  const delta = sector.delta_pct > 0 ? `+${sector.delta_pct.toFixed(1)}%` : `${sector.delta_pct.toFixed(1)}%`;

  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-lg ${trendColor}`}>{icon}</span>
        <div>
          <div className="text-sm text-zinc-200 font-medium">{label}</div>
          <div className="text-[10px] text-zinc-500">
            {sector.signals} signals · avg {sector.avg_score.toFixed(2)}
          </div>
        </div>
      </div>
      <span className={`text-sm font-mono font-semibold ${trendColor}`}>{delta}</span>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetBrief }) {
  const impactColor = asset.avg_impact > 0.15
    ? 'text-emerald-400'
    : asset.avg_impact > 0.05
      ? 'text-amber-400'
      : 'text-zinc-500';

  return (
    <Panel>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">{asset.project_name}</h3>
          <p className="text-[10px] text-zinc-500 font-mono">{asset.project_id}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Avg Impact</div>
          <div className={`text-lg font-bold ${impactColor}`}>
            {(asset.avg_impact * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Delta bar */}
      <div className="flex gap-4 mb-3 text-xs">
        <DeltaPill label="Risk" value={asset.risk_delta} invertColor />
        <DeltaPill label="Opportunity" value={asset.opportunity_delta} />
        <span className="text-zinc-500">{asset.total_signals} signals</span>
      </div>

      {/* Narrative */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{asset.narrative}</p>

      {/* Top signals */}
      {asset.top_signals.length > 0 && (
        <div className="border-t border-zinc-800 pt-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Key Signals</div>
          <ul className="space-y-1">
            {asset.top_signals.map((sig, i) => (
              <li key={i} className="text-[11px] text-zinc-400 leading-snug flex gap-2">
                <span className="text-zinc-600 shrink-0">•</span>
                <span className="line-clamp-2">{sig}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function DeltaPill({ label, value, invertColor }: { label: string; value: number; invertColor?: boolean }) {
  const pct = (value * 100).toFixed(1);
  const positive = invertColor ? value < 0 : value > 0;
  const color = positive ? 'text-emerald-400' : value === 0 ? 'text-zinc-500' : 'text-red-400';
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`${color} font-mono`}>
      {label} {sign}{pct}%
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
