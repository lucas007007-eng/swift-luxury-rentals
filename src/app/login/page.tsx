'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Carousel from './Carousel'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const callbackUrl = params.get('callbackUrl') || '/'
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl })
    if (res?.ok) {
      window.location.href = callbackUrl
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
              {/* Google Sign In */}
              <button 
                onClick={() => signIn('google', { callbackUrl: params.get('callbackUrl') || '/dashboard' })}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-3 mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-white/60">or</span>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                {error && <div className="text-amber-400 text-sm">{error}</div>}
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded transition">Sign In</button>
              </form>
              <div className="text-center text-sm text-white/70 mt-4">
                Don’t have an account? <Link href={`/register?callbackUrl=${encodeURIComponent(params.get('callbackUrl') || '/')}`} className="text-amber-400 hover:text-amber-300">Create account</Link>
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
