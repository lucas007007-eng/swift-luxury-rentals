'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('[SW] New content available, please refresh')
                  
                  // Force update to clear filter cache
                  console.log('[SW] Forcing cache update to clear old filter version')
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                }
              })
            }
          })
        })
        .catch((error) => {
          console.warn('[SW] Service Worker registration failed:', error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message from Service Worker:', event.data)
        
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[SW] Cache updated for:', event.data.url)
        }
      })

      // Handle offline/online events
      window.addEventListener('online', () => {
        console.log('[SW] Back online')
        // Optionally sync pending data
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('background-sync')
          })
        }
      })

      window.addEventListener('offline', () => {
        console.log('[SW] Gone offline')
      })
    } else {
      console.warn('[SW] Service Worker not supported in this browser')
    }
  }, [])

  return null // This component doesn't render anything
}
