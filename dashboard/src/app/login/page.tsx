'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/console';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-8">
        {/* Logo */}
        <div>
          <span className="text-gold font-extrabold text-3xl tracking-tight">DICS</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">
            Intelligence Command System
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-6">
          <div>
            <h1 className="text-lg font-bold text-white mb-2">Console Access Required</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The Intelligence Console is protected by Cloudflare Zero Trust.
              Authenticate with your authorized identity to proceed.
            </p>
          </div>

          {/* Cloudflare Access handles auth — this button triggers the flow */}
          <a
            href={redirect}
            className="block w-full px-6 py-3 rounded-lg bg-gold text-black font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/10"
          >
            Authenticate &amp; Continue
          </a>

          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Access is restricted to authorized personnel only.
            <br />
            All sessions are logged and auditable.
          </p>
        </div>

        {/* Back link */}
        <a
          href="/"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          ← Back to Public Briefing
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-gold font-extrabold text-3xl tracking-tight animate-pulse">DICS</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
