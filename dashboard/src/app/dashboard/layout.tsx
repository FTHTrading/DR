const NAV = [
  { href: '#signals', label: 'Signals', icon: '⚡' },
  { href: '#trends',  label: 'Trends',  icon: '📈' },
  { href: '#risk',    label: 'Risk',    icon: '🎯' },
  { href: '/dashboard/projects', label: 'Projects', icon: '🏗️' },
  { href: '#sources', label: 'Sources', icon: '📡' },
  { href: '#audit',   label: 'Audit',   icon: '🔒' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-800">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-gold font-extrabold text-lg tracking-tight">DICS</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 leading-none">
              Intelligence Command
            </p>
          </a>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-zinc-800 text-[10px] text-zinc-600 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-dics-green animate-pulse" />
            <span>Live · 30s refresh</span>
          </div>
          <div>DR Infrastructure · Tier 1–4</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
