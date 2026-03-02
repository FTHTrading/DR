import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DICS | DR Intelligence Command System',
  description:
    'Dominican Republic Infrastructure Convergence Intelligence — real-time signals, risk scoring, and audit-grade proof across Energy, Mining, Telecom, Logistics, and Finance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-100">{children}</body>
    </html>
  );
}
