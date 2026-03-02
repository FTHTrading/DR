'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Proyecto Ecoturístico Cabrera — Mixed-Use Destination District
   Bankable Asset Dossier
   ═══════════════════════════════════════════════════════════════ */

const KPI_TILES = [
  { label: 'Land Area',       value: '1.17M m²', color: '#10b981' },
  { label: 'Total Value',     value: '$593M',    color: '#D4AF37' },
  { label: 'Land Value',      value: '$93M',     color: '#D4AF37' },
  { label: 'Phase 1 Cost',    value: '$150M',    color: '#f59e0b' },
  { label: 'Revenue Proj.',   value: '$176M',    color: '#3b82f6' },
  { label: 'Residential',     value: '380 units', color: '#8b5cf6' },
  { label: 'Low Elevation',   value: '100m',     color: '#6b7280' },
  { label: 'High Elevation',  value: '300m',     color: '#6b7280' },
];

const COMPONENTS = [
  { icon: '🏡', name: 'Villa Tipo A', detail: '40 units · 1,500 m² lots · $650K each → $26M' },
  { icon: '🏠', name: 'Villa Tipo B', detail: '60 units · 1,000 m² lots · $450K each → $27M' },
  { icon: '🏘️', name: 'Villa Tipo C', detail: '80 units · 500 m² lots · $280K each → $22.4M' },
  { icon: '🏢', name: 'Apartments', detail: '200 units · $180K each → $36M' },
  { icon: '🛍️', name: 'Commercial Center', detail: 'Blue Mall / Agora format · retail + government offices → $40M' },
  { icon: '🛒', name: 'Anchor Supermarket', detail: 'La Sirena / Bravo / El Nacional · NPV rent → $10M' },
  { icon: '🎡', name: 'Recreation Zone', detail: 'Lakes, amphitheater, go-kart, zip line, clubhouse → $25M' },
  { icon: '🏥', name: 'Services', detail: 'Fire station, medical dispensary, electrical substation' },
  { icon: '🌳', name: 'Green Reserves', detail: '66,532 m² · 15-20% green area ratio' },
];

const PHASE1_COSTS = [
  { item: 'Urbanization & Services',     usd: '$40M' },
  { item: 'Green Reserves & Recreation', usd: '$15M' },
  { item: 'Clubhouse + Amphitheater + Lakes', usd: '$10M' },
  { item: 'Villas (Phase 1)',            usd: '$40M' },
  { item: 'Apartments (200 units)',      usd: '$20M' },
  { item: 'Commercial Center',           usd: '$15M' },
  { item: 'Anchor Supermarket',          usd: '$5M' },
  { item: 'Other Services',             usd: '$2.5M' },
  { item: 'Marketing & Sales',          usd: '$2.5M' },
];

const PERMITS = [
  { type: 'Certificado de Título (Land Title)', authority: 'Registro de Títulos', status: 'required' },
  { type: 'Uso de Suelo (Zoning)',               authority: 'Municipio de Cabrera',  status: 'required' },
  { type: 'Environmental Impact Assessment',     authority: 'Min. Medio Ambiente',   status: 'required' },
  { type: 'Municipal Development Approval',      authority: 'Ayuntamiento de Cabrera', status: 'required' },
  { type: 'Water Rights',                         authority: 'INAPA / INDRHI',       status: 'required' },
  { type: 'Road Access Agreement',               authority: 'MOPC',                  status: 'required' },
];

const FUNDING_PATHWAYS = [
  { pathway: 'Land-Contributed Equity',     target: '$93M',  status: 'identified', next: 'Validate land title + appraisal',          institution: '' },
  { pathway: 'Pre-Sales Pipeline',          target: '—',     status: 'identified', next: 'Launch marketing + reservation system',     institution: '' },
  { pathway: 'Phase 1 Project Finance',     target: '$150M', status: 'identified', next: 'Anchor tenant LOIs + infrastructure plan',  institution: '' },
  { pathway: 'Anchor Tenant LOIs',          target: '—',     status: 'identified', next: 'Approach La Sirena, Blue Mall operators',   institution: '' },
  { pathway: 'Tourism Development Fund',    target: '—',     status: 'identified', next: 'Apply for tourism incentive programs',      institution: 'CONFOTUR / IDB' },
  { pathway: 'Public-Private Partnership',  target: '—',     status: 'identified', next: 'Infrastructure cost-sharing framework',    institution: 'MOPC / Municipality' },
];

const COUNTERPARTIES = [
  { name: 'DiseñARQ Studios', role: 'Architect', status: 'Engaged' },
  { name: 'TOPOESPINAL', role: 'Surveyor / Agrimensura', status: 'Engaged' },
  { name: 'Municipio de Cabrera', role: 'Regulator', status: 'Identified' },
];

const STATUS_DOT: Record<string, string> = {
  granted: 'bg-emerald-400',
  required: 'bg-amber-400',
  applied: 'bg-blue-400',
};

const PATHWAY_COLOR: Record<string, string> = {
  identified: 'text-zinc-400 bg-zinc-800',
  qualifying: 'text-blue-400 bg-blue-500/20',
  application: 'text-amber-400 bg-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/20',
};

export default function CabreraPage() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch('/api/projects/CABRERA_ECOTURISMO')
      .then((r) => r.json())
      .then((data) => { if (data.project) setLive(true); })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <a href="/console/projects" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Projects
          </a>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              🌿 Proyecto Ecoturístico Cabrera
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Mixed-Use Ecotourism Destination District · 1.17M m²
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              📍 Cabrera, Provincia María Trinidad Sánchez, Dominican Republic
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              Concept
            </span>
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

      {/* Project Components */}
      <Panel title="Masterplan Components" subtitle="Self-sufficient destination ecosystem">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COMPONENTS.map((c) => (
            <div key={c.name} className="flex items-start gap-2 py-2 px-3 rounded-lg bg-zinc-900/50">
              <span className="text-lg">{c.icon}</span>
              <div>
                <div className="text-sm font-medium text-zinc-200">{c.name}</div>
                <div className="text-xs text-zinc-500">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Topography + Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Topography" subtitle="Terrain and elevation profile">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Low Point</div>
                <div className="text-2xl font-extrabold text-zinc-300">100m</div>
              </div>
              <div className="flex-1 h-12 relative">
                <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-700" />
                <div className="absolute left-0 bottom-0 w-full h-full">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0 35 Q25 30 50 20 T100 5" stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.5" />
                  </svg>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">High Point</div>
                <div className="text-2xl font-extrabold text-gold">300m</div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Ascending terrain with 25m contour intervals. Creates view premiums for villa parcels
              but increases road engineering and drainage costs.
            </p>
          </div>
        </Panel>

        <Panel title="Access Routes" subtitle="Primary and secondary road access">
          <div className="space-y-2">
            <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-zinc-900/50">
              <span className="text-gold">▸</span>
              <span className="text-sm text-zinc-200">Carretera La Cantera</span>
              <span className="text-[10px] text-zinc-500 ml-auto">Primary access</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-zinc-900/50">
              <span className="text-zinc-500">▸</span>
              <span className="text-sm text-zinc-200">Camino vecinal</span>
              <span className="text-[10px] text-zinc-500 ml-auto">Secondary access</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Internal roads with roundabouts split the master lot into independent parcels
              (13,000 m² – 208,000 m²). Block sizes: 5,000 – 13,000 m².
            </p>
          </div>
        </Panel>
      </div>

      {/* Financial Stack */}
      <Panel title="Financial Stack" subtitle="Phase 1 development costs — $150M">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PHASE1_COSTS.map((c) => (
            <div key={c.item} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-zinc-900/50">
              <span className="text-sm text-zinc-300">{c.item}</span>
              <span className="text-sm font-mono text-gold">{c.usd}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-extrabold text-zinc-200">$93M</div>
              <div className="text-[10px] text-zinc-500 uppercase">Land Equity</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-amber-400">$349M</div>
              <div className="text-[10px] text-zinc-500 uppercase">Expansion Phases</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-emerald-400">$176M</div>
              <div className="text-[10px] text-zinc-500 uppercase">Revenue Projection</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Permit Checklist */}
      <Panel title="Permit Checklist" subtitle="Required approvals to unlock bankability">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PERMITS.map((p) => (
            <div key={p.type} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-zinc-900/50">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`} />
              <span className="text-sm text-zinc-200 flex-1">{p.type}</span>
              <span className="text-[10px] text-zinc-500">{p.authority}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Counterparties */}
      <Panel title="Counterparties" subtitle="Design and technical teams engaged">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COUNTERPARTIES.map((c) => (
            <div key={c.name} className="bg-zinc-900/50 rounded-lg p-3">
              <div className="text-sm font-medium text-zinc-200">{c.name}</div>
              <div className="text-xs text-zinc-500">{c.role}</div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mt-1 inline-block">
                {c.status}
              </span>
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

      {/* SunFarm convergence note */}
      <div className="bg-zinc-950 border border-gold/20 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gold mb-2">⚡ Infrastructure Convergence Link</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          SunFarm can power the future of developments like Cabrera. This project becomes a flagship
          "demand anchor" — creating sustained demand for power, telecom, roads, and logistics.
          Mining requires the same infrastructure spine. Together, SunFarm (energy) + Cabrera (demand)
          form a reinforcing asset pair within the DICS convergence thesis.
        </p>
        <a
          href="/console/projects/sunfarm"
          className="inline-block mt-3 text-xs text-gold hover:underline font-medium"
        >
          View SunFarm Dossier →
        </a>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 pt-4">
        <a
          href="/console/projects"
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
