'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Translation dictionary — EN / ES
   ═══════════════════════════════════════════════════════════════ */
const t = {
  en: {
    lang: 'en',
    toggle: 'Español',
    nav: { console: 'Intelligence Console', github: 'GitHub' },

    /* ── Hero ─────────────────────────────────────────────── */
    heroKicker: 'Infrastructure Intelligence · Dominican Republic',
    heroTitle: 'Three sectors are converging.\nMost people won\'t see it until it\'s obvious.',
    heroBody:
      'In the last 90 days, the Dominican Republic announced 150\u00A0M+ tons of rare earth deposits, received a $500\u00A0M Google digital-exchange commitment, and activated an Amazon logistics hub. These are not isolated headlines. They are convergence signals — and DICS was built to detect them.',
    heroCta: 'Open Intelligence Console',
    heroCtaSec: 'Read the Thesis',

    /* ── Situation banner ─────────────────────────────────── */
    sitTitle: 'Current Situation',
    sitDate: 'As of March 2026',

    /* ── 3 Signals ────────────────────────────────────────── */
    signals: [
      {
        color: 'gold',
        tag: 'Mineral Discovery',
        date: 'Feb 27, 2026 · Reuters',
        title: '150+ Million Tons of Rare Earth Deposits Identified',
        body: 'President Abinader confirmed preliminary geological studies showing gross deposits exceeding 150\u00A0million tons of rare earth elements across 17\u00A0critical metals — used in semiconductors, aerospace, military systems, and advanced energy. Located in Pedernales province. Reserve certification expected by early 2027.',
        score: '0.82',
        factors: 'Credibility: Official · Materiality: Very High · Status: Pre-certification',
      },
      {
        color: 'blue',
        tag: 'Digital Infrastructure',
        date: 'Feb 23, 2026 · DataCenterDynamics',
        title: 'Google Invests $500M in Digital Exchange Hub',
        body: 'Google will build a 7,000\u00A0m² international digital exchange hub with new submarine cable connections direct to South Carolina and Virginia. This triples direct US cable routes, increases fiber pairs 10×, and positions DR as a regional data-transit node between North America, Central America, and the Caribbean. Declared high national priority via Decree\u00A0113-26. Construction starts March\u00A02026.',
        score: '0.88',
        factors: 'Credibility: Hyperscaler-confirmed · Materiality: $500M capex · Status: Under construction',
      },
      {
        color: 'orange',
        tag: 'Logistics Activation',
        date: 'Sep 2025 · Amazon',
        title: 'Amazon Regional Logistics Hub Activated',
        body: 'Amazon launched a regional logistics hub near Las Américas International Airport in Santo Domingo. Direct cargo flights, AmazonGlobal shipping, and DHL integration now operational. This accelerates physical goods routing alongside the digital backbone expansion — a dual-layer infrastructure convergence.',
        score: '0.71',
        factors: 'Credibility: Corporate · Materiality: High · Status: Operational',
      },
    ],

    /* ── Convergence thesis ───────────────────────────────── */
    convTitle: 'The Convergence Thesis',
    convBody:
      'When a country simultaneously develops strategic mineral extraction, digital backbone infrastructure, and logistics acceleration — that is not coincidence. That is infrastructure convergence. Mining requires power, logistics, connectivity, export routes, and financing. Google builds the digital layer. Amazon builds the physical layer. Government signals the resource layer. Very few small nations pull this off. Singapore did. Ireland did. The UAE did. The Dominican Republic is attempting something structurally similar.',
    convLabel1: 'Strategic Minerals',
    convLabel2: 'Digital Backbone',
    convLabel3: 'Logistics Routing',
    convCenter: 'Convergence',

    /* ── What DICS does ───────────────────────────────────── */
    whatTitle: 'What DICS Does',
    whatBody: 'DICS is an automated infrastructure intelligence system. It monitors 19 government, trade, and open-data sources across the Dominican Republic around the clock — then extracts, scores, and verifies every signal so you don\'t have to.',
    pipeline: [
      {
        step: '01',
        title: 'Collect',
        body: 'Every 15 minutes, the collector pulls the latest publications from government portals, trade bodies, regulatory filings, and open-data registries. It respects every site\'s policies. Every document gets a SHA-256 fingerprint on arrival.',
      },
      {
        step: '02',
        title: 'Extract',
        body: 'An NLP pipeline reads each document, identifies entities (people, organizations, monetary values, locations), and tags the relevant sector. No manual classification — the system reads and categorizes autonomously.',
      },
      {
        step: '03',
        title: 'Score',
        body: 'Each extracted claim receives a composite score from 0\u00A0to\u00A01 based on five dimensions: credibility, materiality, recency, opportunity, and risk. High-scoring signals surface automatically.',
      },
      {
        step: '04',
        title: 'Prove',
        body: 'Every document, score, and extraction is logged in an append-only audit trail. Nothing is edited or deleted. Every claim links back to its original source. The entire chain is cryptographically verifiable.',
      },
    ],

    /* ── Sectors ──────────────────────────────────────────── */
    sectorsTitle: 'Sectors Under Watch',
    sectors: [
      { icon: '⛏️', name: 'Mining & Rare Earths', body: 'Permits, geological surveys, export volumes, company filings, reserve certifications' },
      { icon: '⚡', name: 'Energy & Renewables', body: 'Solar projects, grid capacity, battery storage, utility reports, power policy' },
      { icon: '📡', name: 'Telecom & Connectivity', body: 'Submarine cables, spectrum auctions, 5G deployment, broadband expansion, IXPs' },
      { icon: '🚢', name: 'Logistics & Ports', body: 'Port throughput, cargo flights, customs modernization, trade route shifts' },
      { icon: '💰', name: 'Finance & Investment', body: 'FDI flows, bond issuances, central bank data, fiscal policy, capital formation' },
    ],

    /* ── Architecture ─────────────────────────────────────── */
    archTitle: 'System Architecture',
    archBody: 'Enterprise-grade open-source stack. No vendor lock-in. Full data sovereignty.',
    archParts: [
      { label: 'Collector', tech: 'Node.js · TypeScript · p-queue', desc: 'Scheduled fetching, deduplication, robots.txt compliance, rate limiting' },
      { label: 'Extractor', tech: 'Python · spaCy · Transformers', desc: 'NLP entity extraction, claim generation, embedding computation' },
      { label: 'Database', tech: 'PostgreSQL 16 · pgvector', desc: 'Relational storage, vector similarity search, append-only audit log' },
      { label: 'Dashboard', tech: 'Next.js 14 · Tailwind · Recharts', desc: 'Real-time intelligence console with risk radar, trends, signal board' },
      { label: 'Alerts', tech: 'Cloudflare Workers', desc: 'Webhook-based notifications when high-priority signals surface' },
    ],

    /* ── Stats ────────────────────────────────────────────── */
    stats: [
      { value: '19', label: 'Sources Monitored' },
      { value: '5', label: 'Sectors Covered' },
      { value: '24/7', label: 'Continuous Collection' },
      { value: '100%', label: 'Auditable Trail' },
    ],

    /* ── Signal → PPA → Funding ────────────────────────────── */
    fundingTitle: 'From Signal to Funding',
    fundingSub: 'DICS doesn\u2019t just track news. It turns real assets into bankable, provable, fundable dossiers.',
    fundingSteps: [
      { step: '01', label: 'Detect', desc: 'Signals, permits, grid updates, policy changes', icon: '📡', color: '#D4AF37' },
      { step: '02', label: 'Prove', desc: 'Hashed evidence, audit trail, chain-of-custody', icon: '🔒', color: '#3b82f6' },
      { step: '03', label: 'Package', desc: 'PPA offer pack, credit memo, investor dossier', icon: '📋', color: '#f59e0b' },
      { step: '04', label: 'Close', desc: 'Funding pathway checklists, term sheet workflow', icon: '💰', color: '#10b981' },
    ],
    assetsTitle: 'Live Assets in the Pipeline',
    assets: [
      {
        icon: '☀️',
        name: 'SunFarm Baní — 50 MW Solar + 25 MW BESS',
        status: 'Shovel-Ready',
        statusColor: '#10b981',
        kpi: '$90M basis · $70/MWh PPA target · 4 permits granted',
        desc: 'Fully permitted photovoltaic + battery storage project. 60/40 debt-equity stack. 8 funding pathways identified.',
        href: '/console/projects/sunfarm',
      },
      {
        icon: '🌿',
        name: 'Proyecto Ecoturístico Cabrera — 1.17M m²',
        status: 'Concept',
        statusColor: '#f59e0b',
        kpi: '$593M total value · $93M land equity · 380 residential units',
        desc: 'Master-planned ecotourism destination district. Villas, commercial center, recreation, conservation. Land-contributed equity model.',
        href: '/console/projects/cabrera',
      },
    ],

    /* ── CTA ──────────────────────────────────────────────── */
    ctaTitle: 'The signals are already moving.',
    ctaBody: 'DICS surfaces what matters before consensus forms. Access the live intelligence console or explore the open-source architecture.',
    ctaConsole: 'Open Console',
    ctaRepo: 'View Repository',

    /* ── Footer ──────────────────────────────────────────── */
    footerBy: 'Built by',
    footerCo: 'FTH Trading',
    footerLicense: 'Open-source · MIT License',
    footerTag: 'Infrastructure intelligence for the Dominican Republic.',
  },

  es: {
    lang: 'es',
    toggle: 'English',
    nav: { console: 'Consola de Inteligencia', github: 'GitHub' },

    heroKicker: 'Inteligencia de Infraestructura · República Dominicana',
    heroTitle: 'Tres sectores están convergiendo.\nLa mayoría no lo verá hasta que sea obvio.',
    heroBody:
      'En los últimos 90 días, la República Dominicana anunció más de 150\u00A0millones de toneladas de depósitos de tierras raras, recibió un compromiso de Google por $500\u00A0M para un centro de intercambio digital, y activó un centro logístico de Amazon. No son titulares aislados. Son señales de convergencia — y DICS fue construido para detectarlas.',
    heroCta: 'Abrir Consola de Inteligencia',
    heroCtaSec: 'Leer la Tesis',

    sitTitle: 'Situación Actual',
    sitDate: 'A marzo 2026',

    signals: [
      {
        color: 'gold',
        tag: 'Descubrimiento Mineral',
        date: '27 feb 2026 · Reuters',
        title: 'Identificados 150+ Millones de Toneladas de Tierras Raras',
        body: 'El Presidente Abinader confirmó estudios geológicos preliminares que muestran depósitos brutos superiores a 150\u00A0millones de toneladas de elementos de tierras raras — 17\u00A0metales críticos usados en semiconductores, aeroespacial, sistemas militares y energía avanzada. Ubicados en la provincia de Pedernales. Certificación de reservas prevista para inicios de 2027.',
        score: '0.82',
        factors: 'Credibilidad: Oficial · Materialidad: Muy Alta · Estado: Pre-certificación',
      },
      {
        color: 'blue',
        tag: 'Infraestructura Digital',
        date: '23 feb 2026 · DataCenterDynamics',
        title: 'Google Invierte $500M en Centro de Intercambio Digital',
        body: 'Google construirá un centro de intercambio digital internacional de 7.000\u00A0m² con nuevas conexiones de cable submarino directo a Carolina del Sur y Virginia. Esto triplica las rutas de cable directas a EE.UU., aumenta los pares de fibra 10×, y posiciona a RD como nodo regional de tránsito de datos. Declarado de alta prioridad nacional mediante Decreto\u00A0113-26. Construcción inicia marzo\u00A02026.',
        score: '0.88',
        factors: 'Credibilidad: Confirmado por hyperscaler · Materialidad: $500M capex · Estado: En construcción',
      },
      {
        color: 'orange',
        tag: 'Activación Logística',
        date: 'Sep 2025 · Amazon',
        title: 'Centro Logístico Regional de Amazon Activado',
        body: 'Amazon lanzó un centro logístico regional cerca del Aeropuerto Internacional Las Américas en Santo Domingo. Vuelos de carga directos, envío AmazonGlobal e integración con DHL ahora operativos. Esto acelera el enrutamiento físico de bienes junto con la expansión de la infraestructura digital — una convergencia de doble capa.',
        score: '0.71',
        factors: 'Credibilidad: Corporativa · Materialidad: Alta · Estado: Operativo',
      },
    ],

    convTitle: 'La Tesis de Convergencia',
    convBody:
      'Cuando un país desarrolla simultáneamente extracción de minerales estratégicos, infraestructura digital troncal y aceleración logística — eso no es coincidencia. Es convergencia de infraestructura. La minería requiere energía, logística, conectividad, rutas de exportación y financiamiento. Google construye la capa digital. Amazon construye la capa física. El gobierno señala la capa de recursos. Muy pocas naciones pequeñas logran esto. Singapur lo hizo. Irlanda lo hizo. Los EAU lo hicieron. La República Dominicana está intentando algo estructuralmente similar.',
    convLabel1: 'Minerales Estratégicos',
    convLabel2: 'Infraestructura Digital',
    convLabel3: 'Enrutamiento Logístico',
    convCenter: 'Convergencia',

    whatTitle: 'Qué Hace DICS',
    whatBody: 'DICS es un sistema automatizado de inteligencia de infraestructura. Monitorea 19 fuentes gubernamentales, comerciales y de datos abiertos de la República Dominicana las 24 horas — luego extrae, puntúa y verifica cada señal para que usted no tenga que hacerlo.',
    pipeline: [
      {
        step: '01',
        title: 'Recolectar',
        body: 'Cada 15 minutos, el recolector descarga las últimas publicaciones de portales gubernamentales, organismos comerciales, registros regulatorios y datos abiertos. Respeta las políticas de cada sitio. Cada documento recibe una huella SHA-256 al llegar.',
      },
      {
        step: '02',
        title: 'Extraer',
        body: 'Un pipeline de procesamiento de lenguaje natural lee cada documento, identifica entidades (personas, organizaciones, valores monetarios, ubicaciones) y etiqueta el sector relevante. Sin clasificación manual — el sistema lee y categoriza de forma autónoma.',
      },
      {
        step: '03',
        title: 'Puntuar',
        body: 'Cada reclamo extraído recibe un puntaje compuesto de 0\u00A0a\u00A01 basado en cinco dimensiones: credibilidad, materialidad, actualidad, oportunidad y riesgo. Las señales de alto puntaje se destacan automáticamente.',
      },
      {
        step: '04',
        title: 'Demostrar',
        body: 'Cada documento, puntaje y extracción se registra en un log de auditoría que solo permite agregar. Nada se edita ni se elimina. Cada reclamo se vincula a su fuente original. La cadena completa es verificable criptográficamente.',
      },
    ],

    sectorsTitle: 'Sectores Bajo Vigilancia',
    sectors: [
      { icon: '⛏️', name: 'Minería y Tierras Raras', body: 'Permisos, estudios geológicos, volúmenes de exportación, registros empresariales, certificaciones de reservas' },
      { icon: '⚡', name: 'Energía y Renovables', body: 'Proyectos solares, capacidad de red, almacenamiento de baterías, reportes de servicios, política energética' },
      { icon: '📡', name: 'Telecomunicaciones', body: 'Cables submarinos, subastas de espectro, despliegue 5G, expansión de banda ancha, IXPs' },
      { icon: '🚢', name: 'Logística y Puertos', body: 'Rendimiento portuario, vuelos de carga, modernización aduanera, cambios en rutas comerciales' },
      { icon: '💰', name: 'Finanzas e Inversión', body: 'Flujos de IED, emisiones de bonos, datos del banco central, política fiscal, formación de capital' },
    ],

    archTitle: 'Arquitectura del Sistema',
    archBody: 'Stack empresarial de código abierto. Sin dependencia de proveedores. Soberanía total de datos.',
    archParts: [
      { label: 'Recolector', tech: 'Node.js · TypeScript · p-queue', desc: 'Búsqueda programada, deduplicación, cumplimiento de robots.txt, límites de velocidad' },
      { label: 'Extractor', tech: 'Python · spaCy · Transformers', desc: 'Extracción de entidades NLP, generación de reclamos, cálculo de embeddings' },
      { label: 'Base de Datos', tech: 'PostgreSQL 16 · pgvector', desc: 'Almacenamiento relacional, búsqueda por similitud vectorial, log de auditoría' },
      { label: 'Panel', tech: 'Next.js 14 · Tailwind · Recharts', desc: 'Consola de inteligencia en tiempo real con radar de riesgo, tendencias, tablero de señales' },
      { label: 'Alertas', tech: 'Cloudflare Workers', desc: 'Notificaciones webhook cuando surgen señales de alta prioridad' },
    ],

    stats: [
      { value: '19', label: 'Fuentes Monitoreadas' },
      { value: '5', label: 'Sectores Cubiertos' },
      { value: '24/7', label: 'Recolección Continua' },
      { value: '100%', label: 'Rastro Auditable' },
    ],

    fundingTitle: 'De la Señal al Financiamiento',
    fundingSub: 'DICS no solo rastrea noticias. Convierte activos reales en dossiers bancables, demostrables y financiables.',
    fundingSteps: [
      { step: '01', label: 'Detectar', desc: 'Señales, permisos, actualizaciones de red, cambios de política', icon: '📡', color: '#D4AF37' },
      { step: '02', label: 'Demostrar', desc: 'Evidencia hash, rastro de auditoría, cadena de custodia', icon: '🔒', color: '#3b82f6' },
      { step: '03', label: 'Empaquetar', desc: 'Paquete de oferta PPA, memo de crédito, dossier de inversión', icon: '📋', color: '#f59e0b' },
      { step: '04', label: 'Cerrar', desc: 'Checklists de vías de financiamiento, flujo de term sheets', icon: '💰', color: '#10b981' },
    ],
    assetsTitle: 'Activos Vivos en el Pipeline',
    assets: [
      {
        icon: '☀️',
        name: 'SunFarm Baní — 50 MW Solar + 25 MW BESS',
        status: 'Listo para Construir',
        statusColor: '#10b981',
        kpi: '$90M base · $70/MWh PPA objetivo · 4 permisos otorgados',
        desc: 'Proyecto fotovoltaico + almacenamiento de baterías totalmente permitido. Estructura deuda-capital 60/40. 8 vías de financiamiento identificadas.',
        href: '/console/projects/sunfarm',
      },
      {
        icon: '🌿',
        name: 'Proyecto Ecoturístico Cabrera — 1.17M m²',
        status: 'Conceptual',
        statusColor: '#f59e0b',
        kpi: '$593M valor total · $93M capital en tierra · 380 unidades residenciales',
        desc: 'Distrito destino ecoturístico planificado. Villas, centro comercial, recreación, conservación. Modelo de capital aportado en tierra.',
        href: '/console/projects/cabrera',
      },
    ],

    ctaTitle: 'Las señales ya se están moviendo.',
    ctaBody: 'DICS identifica lo que importa antes de que se forme el consenso. Acceda a la consola de inteligencia en vivo o explore la arquitectura de código abierto.',
    ctaConsole: 'Abrir Consola',
    ctaRepo: 'Ver Repositorio',

    footerBy: 'Desarrollado por',
    footerCo: 'FTH Trading',
    footerLicense: 'Código abierto · Licencia MIT',
    footerTag: 'Infraestructura de inteligencia para República Dominicana.',
  },
} as const;

type Lang = keyof typeof t;

const SIGNAL_BORDER: Record<string, string> = {
  gold: 'border-l-[#D4AF37]',
  blue: 'border-l-[#1565C0]',
  orange: 'border-l-[#E65100]',
};
const SIGNAL_DOT: Record<string, string> = {
  gold: 'bg-[#D4AF37]',
  blue: 'bg-[#1565C0]',
  orange: 'bg-[#E65100]',
};
const SIGNAL_TAG_BG: Record<string, string> = {
  gold: 'bg-[#D4AF37]/10 text-[#D4AF37]',
  blue: 'bg-[#1565C0]/10 text-[#60A5FA]',
  orange: 'bg-[#E65100]/10 text-[#FB923C]',
};

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');
  const d = t[lang];

  return (
    <div className="min-h-screen bg-black text-zinc-300 antialiased">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-gold font-extrabold text-lg tracking-tight">DICS</span>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium"
            >
              {d.toggle}
            </button>
            <a
              href="https://github.com/FTHTrading/DR"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline px-3 py-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {d.nav.github}
            </a>
            <a
              href="/console"
              className="px-4 py-1.5 rounded bg-gold text-black font-bold hover:bg-yellow-500 transition-colors"
            >
              {d.nav.console}
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold/[0.03] rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-6 font-medium">
            {d.heroKicker}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-snug whitespace-pre-line mb-8">
            {d.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
            {d.heroBody}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/console"
              className="px-7 py-3 rounded-lg bg-gold text-black font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/10"
            >
              {d.heroCta}
            </a>
            <a
              href="#convergence"
              className="px-7 py-3 rounded-lg border border-zinc-700 text-zinc-400 font-medium text-sm hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {d.heroCtaSec}
            </a>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Active Signals ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h2 className="text-xl font-bold text-white">{d.sitTitle}</h2>
            <p className="text-xs text-zinc-500 mt-1">{d.sitDate}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-dics-green animate-pulse" />
            DICS Active
          </div>
        </div>

        <div className="space-y-5">
          {d.signals.map((sig, i) => (
            <div
              key={i}
              className={`bg-zinc-950 border border-zinc-800 ${SIGNAL_BORDER[sig.color]} border-l-4 rounded-xl p-6 hover:border-zinc-700 transition-colors`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`w-2 h-2 rounded-full ${SIGNAL_DOT[sig.color]}`} />
                <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded ${SIGNAL_TAG_BG[sig.color]}`}>
                  {sig.tag}
                </span>
                <span className="text-[11px] text-zinc-600">{sig.date}</span>
                <span className="ml-auto text-[11px] font-mono text-zinc-500">
                  Score: <span className="text-white font-bold">{sig.score}</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{sig.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">{sig.body}</p>
              <p className="text-[11px] text-zinc-600 font-mono">{sig.factors}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Convergence Thesis ────────────────────────────────── */}
      <section id="convergence" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-extrabold text-white mb-6">{d.convTitle}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12">{d.convBody}</p>

        {/* Convergence visual */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center mb-4">
          <PillarCard color="#D4AF37" label={d.convLabel1} icon="⛏️" />
          <PillarCard color="#1565C0" label={d.convLabel2} icon="📡" />
          <PillarCard color="#E65100" label={d.convLabel3} icon="🚢" />
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="block w-16 h-px bg-zinc-700" />
            <span className="block w-px h-8 bg-zinc-700" />
            <span className="block w-16 h-px bg-zinc-700" />
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <span className="px-4 py-1.5 rounded border border-gold/30 text-gold text-xs font-bold tracking-wider uppercase">
            {d.convCenter}
          </span>
        </div>
      </section>

      <Divider />

      {/* ── How DICS Works ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-14">
          <h2 className="text-2xl font-extrabold text-white mb-3">{d.whatTitle}</h2>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">{d.whatBody}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {d.pipeline.map((p) => (
            <div
              key={p.step}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <span className="text-gold font-mono text-xs font-bold">{p.step}</span>
              <h3 className="text-base font-bold text-white mt-1 mb-2">{p.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Sectors ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-extrabold text-white mb-10">{d.sectorsTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {d.sectors.map((s, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center hover:border-gold/30 transition-colors group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{s.icon}</span>
              <h3 className="text-xs font-bold text-white mb-1">{s.name}</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {d.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-extrabold text-gold mb-1">{s.value}</div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Architecture ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-14">
          <h2 className="text-2xl font-extrabold text-white mb-3">{d.archTitle}</h2>
          <p className="text-sm text-zinc-400">{d.archBody}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {d.archParts.map((p, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-xs font-bold text-gold mb-0.5">{p.label}</h3>
              <p className="text-[10px] text-zinc-600 font-mono mb-2">{p.tech}</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Signal → PPA → Funding ────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-14">
          <h2 className="text-2xl font-extrabold text-white mb-3">{d.fundingTitle}</h2>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">{d.fundingSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {d.fundingSteps.map((s) => (
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

        <h3 className="text-lg font-bold text-white mb-6">{d.assetsTitle}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {d.assets.map((a) => (
            <a
              key={a.name}
              href={a.href}
              className="group bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors block"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.icon}</span>
                  <h4 className="text-base font-bold text-white group-hover:text-gold transition-colors">{a.name}</h4>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: a.statusColor, backgroundColor: `${a.statusColor}22` }}
                >
                  {a.status}
                </span>
              </div>
              <p className="text-xs text-gold font-mono mb-2">{a.kpi}</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{a.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-4">{d.ctaTitle}</h2>
        <p className="text-sm text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">{d.ctaBody}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/console"
            className="px-7 py-3 rounded-lg bg-gold text-black font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/10"
          >
            {d.ctaConsole}
          </a>
          <a
            href="https://github.com/FTHTrading/DR"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 rounded-lg border border-zinc-700 text-zinc-400 font-medium text-sm hover:text-white hover:bg-zinc-900 transition-colors"
          >
            {d.ctaRepo}
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600">
          <p>
            {d.footerBy}{' '}
            <a href="https://github.com/FTHTrading" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-semibold">
              {d.footerCo}
            </a>{' '}
            · {d.footerLicense}
          </p>
          <p>{d.footerTag}</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────────── */

function Divider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />;
}

function PillarCard({ color, label, icon }: { color: string; label: string; icon: string }) {
  return (
    <div
      className="bg-zinc-950 border rounded-lg p-4"
      style={{ borderColor: `${color}33` }}
    >
      <span className="text-xl block mb-1">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
    </div>
  );
}