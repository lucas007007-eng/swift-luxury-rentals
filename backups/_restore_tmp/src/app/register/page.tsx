'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Carousel from '../login/Carousel'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (password !== confirm) { setMessage('Passwords do not match'); return }
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, password }) })
    if (res.ok) {
      // Auto-redirect to client dashboard after brief success state
      setMessage('Registered successfully. Redirecting…')
      setTimeout(()=>{ window.location.href = '/dashboard' }, 800)
    } else {
      const data = await res.json().catch(()=>({}))
      setMessage(data?.message || 'Failed to register')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left: form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text">Create Account</div>
              <h1 className="text-3xl font-extrabold mt-1">Join Swift Luxury</h1>
              <p className="text-white/60 text-sm">It only takes a minute</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <form onSubmit={onSubmit} className="space-y-4">
                <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Full name" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="Phone number" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" placeholder="Confirm password" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
                {message && <div className="text-amber-400 text-sm">{message}</div>}
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded transition">Create account</button>
              </form>
              <div className="text-center text-sm text-white/70 mt-4">
                Already have an account? <Link href="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
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
