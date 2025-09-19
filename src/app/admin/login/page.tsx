'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const next = searchParams.get('next') || '/support-dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(next)
    }
  }, [status, next, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await signIn('credentials', {
      username: email,
      email,
      password,
      redirect: false,
      callbackUrl: next,
    })
    if (result && !result.error) {
      setGranted(true)
      router.replace(result.url || next)
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Gold matrix dripping animation */}
      <div className="absolute inset-0 -z-10 bg-black">
        <canvas id="gold-matrix" className="w-full h-full opacity-30" />
      </div>

      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-black/70 border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold text-amber-400 tracking-wide">Swift Luxury</div>
            <div className="text-white/80">Admin Portal</div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Username or Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="adminboss or your email" className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-lg transition-colors">Log In</button>
            <button type="button" onClick={() => signIn('google', { callbackUrl: next })} className="w-full mt-2 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-100">Continue with Google</button>
            {granted && (
              <div className="mt-4">
                <div className="relative inline-flex items-center px-5 py-2 rounded-full bg-emerald-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.6)] overflow-hidden">
                  <span className="relative z-10">ACCESS GRANTED</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* tiny canvas animation */}
      <script dangerouslySetInnerHTML={{__html:`
      (function(){
        const c=document.getElementById('gold-matrix');if(!c) return;const ctx=c.getContext('2d');
        function resize(){c.width=window.innerWidth;c.height=window.innerHeight}
        resize();window.addEventListener('resize',resize)
        const cols=Math.floor(window.innerWidth/14);const drops=Array(cols).fill(0)
        function draw(){ctx.fillStyle='rgba(0,0,0,0.08)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#fbbf24';
          drops.forEach((y,i)=>{const x=i*14;ctx.fillRect(x,y*14,2,10);drops[i]= (y*14>c.height&&Math.random()>0.975)?0:y+1})}
        setInterval(draw,40)
      })();
      `}} />
      <style jsx>{`
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
        .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); transform: translateX(-120%); animation: shimmer 2s linear infinite; }
      `}</style>
    </main>
  )
}


