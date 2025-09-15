"use client"

import { useEffect } from 'react'

/**
 * Development-only cache reset utility.
 * - Unregisters any Service Workers (from past experiments)
 * - Clears Cache Storage entries
 * - Busts prefetch caches by toggling a version key
 * Runs once on first mount in development.
 */
export default function DevCacheReset() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const run = async () => {
      try {
        // Unregister all service workers
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map(r => r.unregister().catch(() => {})))
          try { await navigator.serviceWorker?.ready?.then(r => r.unregister().catch(() => {})) } catch {}
        }

        // Clear Cache Storage
        if (typeof caches !== 'undefined' && caches.keys) {
          const keys = await caches.keys()
          await Promise.all(keys.map(k => caches.delete(k).catch(() => false)))
        }

        // Local bust flag so we can detect one-time execution per session
        try { localStorage.setItem('__dev_cache_busted', String(Date.now())) } catch {}
      } catch {}
    }

    // Small timeout to ensure it runs after hydration
    const id = setTimeout(run, 50)
    return () => clearTimeout(id)
  }, [])

  return null
}


