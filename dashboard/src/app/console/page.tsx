import { MetricCard }          from '@/components/MetricCard';
import { SignalBoard }          from '@/components/SignalBoard';
import { ScoreHistogram }       from '@/components/ScoreHistogram';
import { RiskRadar }            from '@/components/RiskRadar';
import { SourceHealthTable }    from '@/components/SourceHealth';
import { AuditPanel }           from '@/components/AuditPanel';
import { ConvergenceIndexTile } from '@/components/ConvergenceIndex';
import { TrendCharts }          from '@/components/TrendCharts';
import { DEMO_SIGNALS, DEMO_METRICS, DEMO_SOURCES } from '@/lib/demo-data';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
          DR Infrastructure Intelligence
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Rare Earths · Connectivity · Energy · Logistics · Telecom
        </p>
      </header>

      {/* KPI row + Convergence Index */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 content-start">
          <MetricCard label="Active Signals"    value={DEMO_SIGNALS.length}            trend="up"      colorClass="text-dics-green" />
          <MetricCard label="Avg Score"          value={DEMO_METRICS.avg_score.toFixed(2)} unit="/ 1.0"    colorClass="text-gold-400" />
          <MetricCard label="Above Threshold"    value={DEMO_METRICS.above_threshold}    trend="up"      colorClass="text-dics-blue" />
          <MetricCard label="Sources Monitored"  value={DEMO_SOURCES.length}            colorClass="text-dics-teal" />
        </div>
        <ConvergenceIndexTile refreshInterval={120_000} />
      </section>

      {/* Trend Engine */}
      <section id="trends">
        <SectionHeader
          title="Trend Engine"
          subtitle="7-day velocity · 30-day sector density · risk delta"
        />
        <Panel>
          <TrendCharts refreshInterval={120_000} />
        </Panel>
      </section>

      {/* Signal Board */}
      <section id="signals">
        <SectionHeader title="Signal Board" subtitle="Top-ranked intelligence claims ordered by composite score" />
        <Panel>
          <SignalBoard minScore={0} limit={25} refreshInterval={30_000} />
        </Panel>
      </section>

      {/* Score histogram + Risk radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionHeader title="Score Distribution" subtitle="Composite score histogram across all claims" />
          <Panel>
            <ScoreHistogram refreshInterval={60_000} />
          </Panel>
        </section>

        <section id="risk">
          <SectionHeader title="Risk Radar" subtitle="Multi-dimensional risk by sector" />
          <Panel>
            <RiskRadar refreshInterval={60_000} />
          </Panel>
        </section>
      </div>

      {/* Source health */}
      <section id="sources">
        <SectionHeader title="Source Health" subtitle="Per-source document ingestion stats and robots compliance" />
        <Panel>
          <SourceHealthTable refreshInterval={60_000} />
        </Panel>
      </section>

      {/* Audit + Proof */}
      <section id="audit">
        <SectionHeader title="Audit & Proof Registry" subtitle="Append-only event log and on-chain anchoring status" />
        <Panel>
          <AuditPanel refreshInterval={60_000} />
        </Panel>
      </section>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-bold text-zinc-100">{title}</h2>
      <p className="text-xs text-zinc-500">{subtitle}</p>
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
