import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DICS | DR Intelligence Command System',
  description: 'Dominican Republic Infrastructure Convergence Intelligence Dashboard',
};

const NAV = [
  { href: '#signals', label: 'Signals',     icon: '⚡' },
  { href: '#trends',  label: 'Trends',      icon: '📈' },
  { href: '#risk',    label: 'Risk',        icon: '🎯' },
  { href: '#sources', label: 'Sources',     icon: '📡' },
  { href: '#audit',   label: 'Audit',       icon: '🔒' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-black text-zinc-100">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
          {/* Wordmark */}
          <div className="px-6 py-5 border-b border-zinc-800">
            <span className="text-gold-400 font-extrabold text-lg tracking-tight">DICS</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 leading-none">Intelligence Command</p>
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

          {/* Status footer */}
          <div className="px-5 py-4 border-t border-zinc-800 text-[10px] text-zinc-600 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-dics-green animate-pulse" />
              <span>Live · 30s refresh</span>
            </div>
            <div>DR Infrastructure · Tier 1–4</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
