'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/support-dashboard'

  useEffect(() => {
    // Use central NextAuth login so the session is recognized across APIs
    router.replace(`/login?callbackUrl=${encodeURIComponent(next)}`)
  }, [next, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8">
        <div className="text-2xl mb-2">Redirecting to secure login…</div>
        <a className="text-purple-400 underline" href={`/login?callbackUrl=${encodeURIComponent(next)}`}>Click here if not redirected</a>
      </div>
    </main>
  )
}


