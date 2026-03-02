'use client';

import { useState } from 'react';

/* ─── Translation dictionary ────────────────────────────────── */
const t = {
  en: {
    langToggle: 'Español',
    heroTag: 'Dominican Republic Infrastructure Intelligence',
    heroTitle: 'See What\'s Really Happening — Before Everyone Else',
    heroSub:
      'DICS watches 19 official and open sources across the Dominican Republic 24/7. It reads government filings, trade reports, port data, energy updates, and telecom announcements — then turns them into scored, verified intelligence signals you can act on.',
    ctaDashboard: 'Open Live Dashboard',
    ctaGitHub: 'View on GitHub',

    // What it does
    whatTitle: 'What Does It Actually Do?',
    whatSub:
      'Think of it as a radar system for Dominican Republic infrastructure. Instead of tracking planes, it tracks information.',
    whatSteps: [
      {
        icon: '📡',
        title: 'Collects',
        body: 'Every 15 minutes, it pulls the latest publications from 19 sources — government portals, trade bodies, news feeds, and open-data registries. It respects every website\'s rules and never scrapes anything it shouldn\'t.',
      },
      {
        icon: '🧠',
        title: 'Reads & Understands',
        body: 'An AI reads each document, pulls out the important facts — who\'s involved, what sector it\'s about, what money is mentioned — and scores how important and trustworthy it is.',
      },
      {
        icon: '📊',
        title: 'Scores & Ranks',
        body: 'Every piece of information gets a composite score from 0 to 1 based on five factors: credibility, materiality, recency, opportunity, and risk. The best signals float to the top.',
      },
      {
        icon: '🔒',
        title: 'Proves Everything',
        body: 'Every document gets a unique fingerprint (SHA-256 hash). Nothing is edited or deleted — ever. There\'s a full audit trail so you can prove exactly where each piece of intelligence came from.',
      },
    ],

    // Sectors
    sectorsTitle: 'Five Sectors. One Dashboard.',
    sectorsSub: 'DICS covers the infrastructure pillars that drive the Dominican Republic forward.',
    sectors: [
      { icon: '⛏️', name: 'Mining & Rare Earths', body: 'Permits, geological surveys, export volumes, company filings' },
      { icon: '⚡', name: 'Energy & Renewables', body: 'Solar projects, grid capacity, battery storage, utility reports' },
      { icon: '📡', name: 'Telecom & Connectivity', body: 'Spectrum auctions, submarine cables, 5G rollout, broadband data' },
      { icon: '🚢', name: 'Logistics & Ports', body: 'Shipping manifests, port throughput, customs data, trade routes' },
      { icon: '💰', name: 'Finance & Investment', body: 'FDI flows, bond issuances, central bank bulletins, GDP data' },
    ],

    // How it's built
    builtTitle: 'How It\'s Built',
    builtSub: 'Enterprise-grade open-source stack. No vendor lock-in. Data stays yours.',
    builtParts: [
      { label: 'Collector', tech: 'Node.js + TypeScript', desc: 'Schedules fetches, deduplicates documents, respects robots.txt' },
      { label: 'Extractor', tech: 'Python + spaCy + AI', desc: 'Reads text, pulls entities, scores claims, generates embeddings' },
      { label: 'Database', tech: 'PostgreSQL + pgvector', desc: 'Stores everything — documents, entities, scores, vectors, audit logs' },
      { label: 'Dashboard', tech: 'Next.js + Tailwind', desc: 'Live charts, risk radar, signal board, source health — all real-time' },
      { label: 'Alerts', tech: 'Cloudflare Workers', desc: 'Webhook notifications when high-priority signals land' },
    ],

    // Numbers
    statsTitle: 'By the Numbers',
    stats: [
      { value: '19', label: 'Sources monitored' },
      { value: '5', label: 'Sectors covered' },
      { value: '24/7', label: 'Continuous monitoring' },
      { value: '100%', label: 'Auditable trail' },
    ],

    // Footer
    footerBuilt: 'Built by',
    footerCompany: 'FTH Trading',
    footerOpen: 'Open-source under MIT license.',
    footerTagline: 'Intelligence infrastructure for the Dominican Republic.',
  },

  es: {
    langToggle: 'English',
    heroTag: 'Inteligencia de Infraestructura de República Dominicana',
    heroTitle: 'Vea Lo Que Realmente Está Pasando — Antes Que Todos',
    heroSub:
      'DICS monitorea 19 fuentes oficiales y abiertas en República Dominicana las 24 horas. Lee documentos gubernamentales, reportes comerciales, datos portuarios, actualizaciones energéticas y anuncios de telecomunicaciones — luego los convierte en señales de inteligencia verificadas y puntuadas para tomar decisiones.',
    ctaDashboard: 'Abrir Panel en Vivo',
    ctaGitHub: 'Ver en GitHub',

    whatTitle: '¿Qué Hace Exactamente?',
    whatSub:
      'Piense en DICS como un sistema de radar para la infraestructura dominicana. En vez de rastrear aviones, rastrea información.',
    whatSteps: [
      {
        icon: '📡',
        title: 'Recolecta',
        body: 'Cada 15 minutos, descarga las últimas publicaciones de 19 fuentes — portales gubernamentales, organismos comerciales, noticias y registros de datos abiertos. Respeta las reglas de cada sitio web.',
      },
      {
        icon: '🧠',
        title: 'Lee y Entiende',
        body: 'Una inteligencia artificial lee cada documento, extrae los hechos importantes — quién está involucrado, qué sector, qué dinero se menciona — y califica qué tan importante y confiable es.',
      },
      {
        icon: '📊',
        title: 'Puntúa y Clasifica',
        body: 'Cada pieza de información recibe un puntaje compuesto de 0 a 1 basado en cinco factores: credibilidad, materialidad, actualidad, oportunidad y riesgo. Las mejores señales aparecen primero.',
      },
      {
        icon: '🔒',
        title: 'Lo Demuestra Todo',
        body: 'Cada documento recibe una huella digital única (hash SHA-256). Nada se edita ni se borra — nunca. Hay un registro de auditoría completo para que pueda probar exactamente de dónde vino cada dato.',
      },
    ],

    sectorsTitle: 'Cinco Sectores. Un Solo Panel.',
    sectorsSub: 'DICS cubre los pilares de infraestructura que impulsan a República Dominicana.',
    sectors: [
      { icon: '⛏️', name: 'Minería y Tierras Raras', body: 'Permisos, estudios geológicos, volúmenes de exportación, registros de empresas' },
      { icon: '⚡', name: 'Energía y Renovables', body: 'Proyectos solares, capacidad de red, almacenamiento de baterías, reportes de servicios' },
      { icon: '📡', name: 'Telecomunicaciones', body: 'Subastas de espectro, cables submarinos, despliegue 5G, datos de banda ancha' },
      { icon: '🚢', name: 'Logística y Puertos', body: 'Manifiestos de envío, rendimiento portuario, datos aduaneros, rutas comerciales' },
      { icon: '💰', name: 'Finanzas e Inversión', body: 'Flujos de IED, emisiones de bonos, boletines del banco central, datos del PIB' },
    ],

    builtTitle: 'Cómo Está Construido',
    builtSub: 'Tecnología empresarial de código abierto. Sin dependencia de proveedores. Los datos son suyos.',
    builtParts: [
      { label: 'Recolector', tech: 'Node.js + TypeScript', desc: 'Programa búsquedas, deduplica documentos, respeta robots.txt' },
      { label: 'Extractor', tech: 'Python + spaCy + IA', desc: 'Lee texto, extrae entidades, puntúa reclamos, genera embeddings' },
      { label: 'Base de Datos', tech: 'PostgreSQL + pgvector', desc: 'Almacena todo — documentos, entidades, puntajes, vectores, auditoría' },
      { label: 'Panel', tech: 'Next.js + Tailwind', desc: 'Gráficos en vivo, radar de riesgo, señales, salud de fuentes — todo en tiempo real' },
      { label: 'Alertas', tech: 'Cloudflare Workers', desc: 'Notificaciones webhook cuando llegan señales de alta prioridad' },
    ],

    statsTitle: 'En Números',
    stats: [
      { value: '19', label: 'Fuentes monitoreadas' },
      { value: '5', label: 'Sectores cubiertos' },
      { value: '24/7', label: 'Monitoreo continuo' },
      { value: '100%', label: 'Rastro auditable' },
    ],

    footerBuilt: 'Desarrollado por',
    footerCompany: 'FTH Trading',
    footerOpen: 'Código abierto bajo licencia MIT.',
    footerTagline: 'Infraestructura de inteligencia para República Dominicana.',
  },
} as const;

type Lang = keyof typeof t;

/* ─── Page component ─────────────────────────────────────────── */

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');
  const d = t[lang];

  return (
    <div className="min-h-screen bg-black">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/70 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-gold font-extrabold text-xl tracking-tight">DICS</span>
            <span className="hidden sm:inline text-xs text-zinc-500 border-l border-zinc-700 pl-2 ml-1">
              Intelligence Command
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              🌐 {d.langToggle}
            </button>
            <a
              href="/dashboard"
              className="px-4 py-1.5 rounded-lg bg-gold text-black text-xs font-bold hover:bg-yellow-500 transition-colors"
            >
              {d.ctaDashboard}
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6 pt-24 pb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4 font-semibold">
            {d.heroTag}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            {d.heroTitle}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {d.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/dashboard"
              className="px-8 py-3 rounded-xl bg-gold text-black font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/20"
            >
              {d.ctaDashboard} →
            </a>
            <a
              href="https://github.com/FTHTrading/DR"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-900 transition-colors"
            >
              {d.ctaGitHub}
            </a>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ── What it does ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-3">{d.whatTitle}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{d.whatSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {d.whatSteps.map((step, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{step.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    <span className="text-gold mr-2">{i + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ── Sectors ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-3">{d.sectorsTitle}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{d.sectorsSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {d.sectors.map((s, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center hover:border-gold/40 transition-colors group"
            >
              <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <h3 className="text-sm font-bold text-white mb-1">{s.name}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-extrabold text-white text-center mb-12">{d.statsTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {d.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-extrabold text-gold mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ── How it's built ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-3">{d.builtTitle}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{d.builtSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {d.builtParts.map((p, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-sm font-bold text-gold mb-0.5">{p.label}</h3>
              <p className="text-[10px] text-zinc-500 font-mono mb-2">{p.tech}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ── Architecture diagram ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 font-mono text-xs text-zinc-400">
          <pre className="overflow-x-auto whitespace-pre leading-6">{`
  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
  │  19 Sources  │────▶│  Collector   │────▶│  PostgreSQL   │
  │  (gov, trade │     │  (Node.js)   │     │  + pgvector   │
  │   open data) │     └──────┬──────┘     └──────┬───────┘
  └─────────────┘            │                    │
                              ▼                    ▼
                       ┌─────────────┐     ┌──────────────┐
                       │  Extractor   │────▶│  Dashboard    │
                       │  (Python AI) │     │  (Next.js)    │
                       └─────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │   Alerts      │
                                           │  (Cloudflare) │
                                           └──────────────┘`}
          </pre>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-zinc-400">
              {d.footerBuilt}{' '}
              <a
                href="https://github.com/FTHTrading"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline font-semibold"
              >
                {d.footerCompany}
              </a>
            </p>
            <p className="text-xs text-zinc-600 mt-1">{d.footerOpen}</p>
          </div>
          <p className="text-xs text-zinc-600">{d.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}
