'use client';

import { useEffect, useState } from 'react';

/* ── Static project data (fallback when DB is cold) ─────────────────── */
const STATIC_PROJECTS = [
  {
    id: 'SUNFARM_BANI_50MW',
    name: 'SunFarm Baní — 50 MW Solar + 25 MW BESS',
    type: 'solar',
    status: 'shovel-ready',
    location: 'Baní, Peravia Province',
    summary: '50 MW AC / 59.69 MWp DC PV + 25 MW / 100 MWh BESS. PPA target $70/MWh, 25-year term.',
    tags: ['solar', 'bess', 'energy', 'ppa'],
    kpi: '$90M basis · 50 MW · 100 MWh',
  },
  {
    id: 'CABRERA_ECOTURISMO',
    name: 'Proyecto Ecoturístico Cabrera — Mixed-Use Destination',
    type: 'ecotourism',
    status: 'concept',
    location: 'Cabrera, María Trinidad Sánchez',
    summary: '1.17M m² master-planned destination: villas, apartments, commercial center, recreation, conservation.',
    tags: ['ecotourism', 'real_estate', 'mixed_use'],
    kpi: '$593M value · 1.17M m² · 380 units',
  },
];

const STATUS_COLOR: Record<string, string> = {
  'shovel-ready': 'bg-emerald-500/20 text-emerald-400',
  concept: 'bg-amber-500/20 text-amber-400',
  'pre-development': 'bg-blue-500/20 text-blue-400',
  construction: 'bg-purple-500/20 text-purple-400',
  operational: 'bg-green-500/20 text-green-400',
};

const TYPE_ICON: Record<string, string> = {
  solar: '☀️',
  ecotourism: '🌿',
  logistics: '🚢',
  mixed: '🏗️',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(STATIC_PROJECTS);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(
            data.map((p: any) => ({
              ...p,
              kpi: '',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
          Projects & Real Assets
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Bankable asset dossiers — tracked, proved, packaged by DICS
        </p>
      </header>

      {/* Pipeline overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Projects" value={projects.length.toString()} />
        <KPI label="Shovel-Ready" value={projects.filter((p) => p.status === 'shovel-ready').length.toString()} accent="text-emerald-400" />
        <KPI label="Conceptual" value={projects.filter((p) => p.status === 'concept').length.toString()} accent="text-amber-400" />
        <KPI label="Asset Types" value={[...new Set(projects.map((p) => p.type))].length.toString()} />
      </section>

      {/* Project cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`/console/projects/${p.id === 'SUNFARM_BANI_50MW' ? 'sunfarm' : 'cabrera'}`}
            className="group bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{TYPE_ICON[p.type] ?? '📦'}</span>
                <h2 className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                  {p.name}
                </h2>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-zinc-800 text-zinc-400'}`}>
                {p.status}
              </span>
            </div>

            <p className="text-xs text-zinc-500 mb-1">📍 {p.location}</p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">{p.summary}</p>

            {p.kpi && (
              <p className="text-xs text-gold font-mono">{p.kpi}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {p.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </section>

      {/* Signal → PPA → Funding flow */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-white mb-6">Signal → PPA → Funding Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', label: 'Detect', desc: 'Signals, permits, grid updates, policy changes', icon: '📡', color: '#D4AF37' },
            { step: '02', label: 'Prove', desc: 'Hashed evidence, audit trail, chain-of-custody', icon: '🔒', color: '#3b82f6' },
            { step: '03', label: 'Package', desc: 'PPA offer pack, credit memo, investor dossier', icon: '📋', color: '#f59e0b' },
            { step: '04', label: 'Close', desc: 'Funding pathway checklists, term sheet workflow', icon: '💰', color: '#10b981' },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"
              style={{ borderTopColor: s.color, borderTopWidth: 2 }}
            >
              <span className="text-2xl block mb-2">{s.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.color }}>
                Step {s.step}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{s.label}</h3>
              <p className="text-xs text-zinc-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
      <div className={`text-2xl font-extrabold ${accent ?? 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
