"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#111] flex items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-2xl p-8 border border-amber-400/40 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="font-mono uppercase tracking-wider text-amber-300 text-sm">System Alert</div>
          </div>

          <h1 className="text-3xl font-bold text-amber-400 mb-2">Something went wrong</h1>
          <p className="text-amber-200/80 mb-6">We encountered an unexpected error. Our agents are on it.</p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:border-amber-300 transition-colors"
            >
              <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 109-9" />
                <path d="M3 3v6h6" />
              </svg>
              Try again
            </button>
            {error?.digest ? (
              <div className="text-xs text-amber-200/60 font-mono">Ref: {error.digest}</div>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  )
}


