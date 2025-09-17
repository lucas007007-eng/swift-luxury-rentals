import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] to-[#111] px-6">
      <div className="relative w-full max-w-2xl rounded-2xl p-8 border border-amber-400/40 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_25px_rgba(245,158,11,0.25)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 [mask-image:radial-gradient(600px_circle_at_var(--x)_var(--y),black,transparent)]" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
          </div>
          <div className="font-mono uppercase tracking-wider text-amber-300 text-sm">Navigation Notice</div>
        </div>

        <h1 className="text-3xl font-bold text-amber-400 mb-2">Page not found</h1>
        <p className="text-amber-200/80 mb-6">The page you’re looking for has gone dark. It may have moved or never existed.</p>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:border-amber-300 transition-colors">
            <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:border-amber-300 transition-colors">
            <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Admin Dashboard
          </Link>
        </div>

        <div className="mt-6 text-xs text-amber-200/60 font-mono">Error code: 404 • Surveillance offline</div>
      </div>
    </div>
  )
}


