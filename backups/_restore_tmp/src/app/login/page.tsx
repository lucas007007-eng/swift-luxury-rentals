'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Carousel from './Carousel'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.ok) {
      window.location.href = '/'
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left: form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text">Sign In</div>
              <h1 className="text-3xl font-extrabold mt-1">Welcome back</h1>
              <p className="text-white/60 text-sm">Use your email or Google account to continue</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <form onSubmit={onSubmit} className="space-y-4">
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                {error && <div className="text-amber-400 text-sm">{error}</div>}
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded transition">Sign In</button>
              </form>
              <button onClick={()=>signIn('google')} className="w-full mt-3 bg-white text-black font-semibold py-2 rounded hover:bg-gray-100 transition">Sign in with Google</button>
              <div className="text-center text-sm text-white/70 mt-4">
                Don’t have an account? <Link href="/register" className="text-amber-400 hover:text-amber-300">Create account</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Right: image carousel */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
          <div className="w-full h-full animate-fadeInUp">
            <Carousel />
          </div>
        </div>
      </div>
    </main>
  )
}
