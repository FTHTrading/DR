'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   SunFarm Baní — 50 MW Solar + 25 MW / 100 MWh BESS
   Bankable Asset Dossier
   ═══════════════════════════════════════════════════════════════ */

const KPI_TILES = [
  { label: 'MW AC',         value: '50',    color: '#D4AF37' },
  { label: 'MWp DC',        value: '59.69', color: '#D4AF37' },
  { label: 'MWh BESS',      value: '100',   color: '#3b82f6' },
  { label: 'MW BESS',       value: '25',    color: '#3b82f6' },
  { label: 'Total Basis',   value: '$90M',  color: '#10b981' },
  { label: 'CAPEX',         value: '$55M',  color: '#10b981' },
  { label: 'Acquisition',   value: '$35M',  color: '#f59e0b' },
  { label: 'PPA Target',    value: '$70/MWh', color: '#D4AF37' },
];

const CAPITAL_STACK = [
  { label: 'Senior Debt', pct: 60, usd: '$33M', terms: '6.5% rate, 18-year tenor' },
  { label: 'Equity',      pct: 40, usd: '$22M', terms: 'Sponsor / institutional' },
];

const PPA = {
  price: '$70/MWh',
  escalation: '1.5%/yr',
  term: '25 years',
  capacity: '50 MW',
  offtaker: 'TBD — Offtaker Outreach',
  status: 'Draft',
  bessValue: 'Peak shifting, frequency regulation, capacity firming',
};

const PERMITS = [
  { type: 'CNE Generation Concession', authority: 'CNE', status: 'granted' },
  { type: 'ETED Interconnection', authority: 'ETED', status: 'granted' },
  { type: 'Environmental License', authority: 'Min. Medio Ambiente', status: 'granted' },
  { type: 'Land Title', authority: 'Registro de Títulos', status: 'granted' },
];

const FUNDING_PATHWAYS = [
  { pathway: 'Senior Project Debt',      target: '$33M',  status: 'identified', next: 'Secure PPA → approach lenders',          institution: '' },
  { pathway: 'Sponsor Equity',           target: '$22M',  status: 'identified', next: 'Complete project dossier',                institution: '' },
  { pathway: 'Green Bond Issuance',      target: '—',     status: 'identified', next: 'Green Bond Framework certification',      institution: '' },
  { pathway: 'DFI Blended Finance',      target: '—',     status: 'identified', next: 'Submit for DFI screening',               institution: 'IDB Invest / IFC / DFC' },
  { pathway: 'Carbon Credit Forward',    target: '—',     status: 'identified', next: 'Calculate tCO₂e/yr methodology',         institution: '' },
  { pathway: 'Political Risk Insurance', target: '—',     status: 'identified', next: 'Prepare risk assessment package',         institution: 'MIGA / DFC' },
  { pathway: 'EPC Vendor Finance',       target: '—',     status: 'identified', next: 'Engage EPC vendors for terms',            institution: '' },
  { pathway: 'Sustainability-Linked Loan',target: '—',    status: 'identified', next: 'Define KPI framework',                    institution: '' },
];

const PPA_CLOSE_REQS = [
  {
    title: 'Deliver Electrons',
    items: ['ETED interconnection status', 'Project readiness posture', 'Schedule confidence (risk model + mitigation)'],
  },
  {
    title: 'Defensible Price',
    items: ['Regional solar + BESS benchmark comparisons', 'Escalation logic', 'Curtailment & dispatch narrative for BESS value stack'],
  },
  {
    title: 'Safe Counterparty',
    items: ['Append-only audit trail', 'Document hashes (chain-of-custody)', 'Repeatable PDF memo output'],
  },
];

const STATUS_DOT: Record<string, string> = {
  granted: 'bg-emerald-400',
  required: 'bg-amber-400',
  applied: 'bg-blue-400',
  expired: 'bg-red-400',
};

const PATHWAY_COLOR: Record<string, string> = {
  identified: 'text-zinc-400 bg-zinc-800',
  qualifying: 'text-blue-400 bg-blue-500/20',
  application: 'text-amber-400 bg-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/20',
  disbursing: 'text-green-400 bg-green-500/20',
};

export default function SunFarmPage() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch('/api/projects/SUNFARM_BANI_50MW')
      .then((r) => r.json())
      .then((data) => { if (data.project) setLive(true); })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <a href="/dashboard/projects" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Projects
          </a>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              ☀️ SunFarm Baní
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              50 MW AC / 59.69 MWp DC Photovoltaic + 25 MW / 100 MWh BESS
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              📍 Baní, Peravia Province, Dominican Republic
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              Shovel-Ready
            </span>
            {live && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                Live Data
              </span>
            )}
          </div>
        </div>
      </header>

      {/* KPI Tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {KPI_TILES.map((k) => (
          <div key={k.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">{k.label}</div>
          </div>
        ))}
      </section>

      {/* Capital Stack + PPA side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Stack */}
        <Panel title="Capital Stack" subtitle="60/40 Debt-Equity Structure · $90M Total Basis">
          <div className="space-y-3">
            {CAPITAL_STACK.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="relative w-full h-6 bg-zinc-900 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg"
                    style={{
                      width: `${c.pct}%`,
                      background: c.pct > 50 ? '#D4AF37' : '#3b82f6',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold text-white">
                    <span>{c.label}</span>
                    <span>{c.usd} ({c.pct}%)</span>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-zinc-600 mt-2">Debt: 6.5% rate, 18-year tenor · Equity: Sponsor / institutional</p>
          </div>
        </Panel>

        {/* PPA Terms */}
        <Panel title="PPA Terms" subtitle="Power Purchase Agreement Target">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries({
              Price: PPA.price,
              Escalation: PPA.escalation,
              Term: PPA.term,
              Capacity: PPA.capacity,
              Offtaker: PPA.offtaker,
              Status: PPA.status,
            }).map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{k}</div>
                <div className="text-sm font-medium text-zinc-200">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">BESS Value Stack</div>
            <div className="text-xs text-zinc-400">{PPA.bessValue}</div>
          </div>
        </Panel>
      </div>

      {/* Permit Checklist */}
      <Panel title="Permit Checklist" subtitle="All key approvals for bankability">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PERMITS.map((p) => (
            <div key={p.type} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-zinc-900/50">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`} />
              <span className="text-sm text-zinc-200 flex-1">{p.type}</span>
              <span className="text-[10px] text-zinc-500">{p.authority}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* PPA Close Requirements */}
      <Panel title="What Closes a PPA" subtitle="Three conditions a buyer must believe">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PPA_CLOSE_REQS.map((r, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gold mb-2">{i + 1}. {r.title}</h4>
              <ul className="space-y-1">
                {r.items.map((item) => (
                  <li key={item} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-gold mt-0.5">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      {/* Funding Pathways */}
      <Panel title="Funding Pathways" subtitle={`${FUNDING_PATHWAYS.length} financing lanes identified`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left py-2 pr-4">Pathway</th>
                <th className="text-left py-2 pr-4">Target</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Institution</th>
                <th className="text-left py-2">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {FUNDING_PATHWAYS.map((f) => (
                <tr key={f.pathway} className="border-b border-zinc-900">
                  <td className="py-2 pr-4 text-zinc-200 font-medium">{f.pathway}</td>
                  <td className="py-2 pr-4 text-zinc-400 font-mono text-xs">{f.target}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${PATHWAY_COLOR[f.status] ?? ''}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-zinc-500">{f.institution || '—'}</td>
                  <td className="py-2 text-xs text-zinc-400">{f.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* External links */}
      <div className="flex items-center gap-4 pt-4">
        <a
          href="https://fthtrading.github.io/sunfarm--platform/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:bg-yellow-500 transition-colors"
        >
          SunFarm Platform ↗
        </a>
        <a
          href="/dashboard/projects"
          className="px-5 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-900 transition-colors"
        >
          ← All Projects
        </a>
      </div>
    </div>
  );
}

/* ── Shared Panel ──────────────────────────────────────────────── */

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-bold text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg">
        {children}
      </div>
    </section>
  );
}
