'use client'

import { useEffect } from 'react'

export default function Highlighter({ targetId }: { targetId?: string }) {
  useEffect(() => {
    if (!targetId) return
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-emerald-400/60')
      const t = setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-400/60')
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [targetId])
  return null
}


