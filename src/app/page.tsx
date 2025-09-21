// server component (no "use client") to minimize client-side JS on homepage

import React from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import Hero from '@/components/Hero'
import dynamic from 'next/dynamic'

// Defer below-the-fold components to reduce initial bundle
const About = dynamic(() => import('@/components/About'), { ssr: false })
const Locations = dynamic(() => import('@/components/Locations'), { 
  ssr: false,
  loading: () => <div className="py-20 bg-black flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div></div>
})
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })


export default function Home() {

  return (
    <main className="min-h-screen">
      <Header forceBackground={true} />
      <Hero />
      
      {/* Featured Properties grid removed per request */}

      

      {/* About section removed per request */}
      <Locations />

      {/* Crypto Payment Section moved below Our European Destinations */}
      <section className="pt-8 pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold crypto-shine mb-6 leading-tight py-2">
              Revolutionary Crypto Rent Payments
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              The first platform in Berlin to accept cryptocurrency for rent payments. 
              We handle all the complexity - you just pay and move in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Crypto Payment */}
            <div className="luxury-feature-card">
              <svg className="w-20 h-20 mx-auto mb-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 2500">
                <defs>
                  <linearGradient id="btcGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DB9125"/>
                    <stop offset="20%" stopColor="#FFF778"/>
                    <stop offset="34%" stopColor="#D99A26"/>
                    <stop offset="68%" stopColor="#F6CE69"/>
                    <stop offset="100%" stopColor="#F6CE69"/>
                  </linearGradient>
                </defs>
                <circle fill="url(#btcGold)" cx="1250" cy="1250" r="1250"/>
                <path fill="#1a1a1a" d="M1563.2,1208.4c29.9-45.5,45.5-98.8,45.5-153.3c0-140.3-102.7-258.6-240.4-278.1V648.4l0-9.1h-10.4h-122.1h-10.4v10.4v124.7l-63.7,0V649.7v-10.4h-10.4h-122.1h-10.4v10.4v124.7l-198.8,0h-10.4v10.4v153.3v10.4h10.4H955v602.9H819.9h-10.4v10.4v153.3v10.4h10.4h198.8v124.7v10.4l10.4,0h122.1h10.4v-10.4v-124.7l63.7,0v124.7v10.4l10.4,0h122.1h10.4v-10.4v-124.7l41.6,0c154.6,0,280.7-126,280.7-280.7C1690.5,1350.1,1641.1,1260.4,1563.2,1208.4L1563.2,1208.4z M1129.2,1337.1H1328h81.9c59.8,0,107.8,48.1,107.8,107.8c0,59.8-48.1,107.8-107.8,107.8l-279.4,0v-215.7L1129.2,1337.1L1129.2,1337.1z M1129.2,1162.9V948.5H1328c59.8,0,107.8,48.1,107.8,107.8c0,59.8-48.1,107.8-107.8,107.8l-198.8,0V1162.9L1129.2,1162.9z"/>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4 font-sora">Crypto Friendly</h3>
              <div className="luxury-badge">
                Secured Payments
              </div>
              <div className="flex justify-center space-x-2 mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">BTC</span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">ETH</span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">USDT</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Bitcoin, Ethereum, USDT, or traditional credit card payments accepted
              </p>
            </div>

            {/* EU Compliance */}
            <div className="luxury-feature-card">
              <svg className="w-20 h-20 mx-auto mb-8" viewBox="0 0 100 100" fill="none">
                {/* Outer golden ring */}
                <circle cx="50" cy="50" r="48" fill="url(#goldGradient2)" stroke="url(#goldBorder2)" strokeWidth="2"/>
                
                {/* Inner black circle */}
                <circle cx="50" cy="50" r="38" fill="#1a1a1a" stroke="url(#goldInner2)" strokeWidth="1"/>
                
                {/* Shield symbol - smaller */}
                <path d="M50 30L38 36v16c0 7 5 12 12 14 7-2 12-7 12-14V36L50 30z" 
                      fill="url(#goldInner2)" stroke="#1a1a1a" strokeWidth="1"/>
                
                {/* Checkmark - smaller */}
                <path d="M44 50l4 4 8-8" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                
                <defs>
                  <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="50%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldBorder2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldInner2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="50%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4 font-sora">EU Compliant</h3>
              <div className="luxury-badge">
                Fully Regulated
              </div>
              <p className="text-gray-300 leading-relaxed">
                All transactions comply with European banking regulations and anti-money laundering laws
              </p>
            </div>

            {/* Seamless Conversion */}
            <div className="luxury-feature-card">
              <svg className="w-20 h-20 mx-auto mb-8" viewBox="0 0 100 100" fill="none">
                {/* Outer golden ring */}
                <circle cx="50" cy="50" r="48" fill="url(#goldGradient3)" stroke="url(#goldBorder3)" strokeWidth="2"/>
                
                {/* Inner black circle */}
                <circle cx="50" cy="50" r="38" fill="#1a1a1a" stroke="url(#goldInner3)" strokeWidth="1"/>
                
                {/* Lightning bolt - smaller */}
                <path d="M52 25L35 50h12L45 75 62 50H50L52 25z" 
                      fill="url(#goldInner3)" stroke="#1a1a1a" strokeWidth="1"/>
                
                <defs>
                  <linearGradient id="goldGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="50%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldBorder3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldInner3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="50%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4 font-sora">Instant Booking</h3>
              <div className="luxury-badge">
                Auto Bank Wire
              </div>
              <p className="text-gray-300 leading-relaxed">
                Automatic crypto to fiat conversion with wire transfer to landlords
              </p>
            </div>

            {/* Move In! card */}
            <div className="luxury-feature-card">
              <svg className="w-20 h-20 mx-auto mb-8" viewBox="0 0 100 100" fill="none">
                {/* Outer golden ring */}
                <circle cx="50" cy="50" r="48" fill="url(#goldGradient4)" stroke="url(#goldBorder4)" strokeWidth="2"/>
                
                {/* Inner black circle */}
                <circle cx="50" cy="50" r="38" fill="#1a1a1a" stroke="url(#goldInner4)" strokeWidth="1"/>
                
                {/* House symbol - smaller */}
                <path d="M50 28L35 42v25h8V55h14v12h8V42L50 28z" 
                      fill="url(#goldInner4)" stroke="#1a1a1a" strokeWidth="1"/>
                
                {/* Roof accent - smaller */}
                <path d="M50 28L38 38h24L50 28z" 
                      fill="url(#goldInner4)" opacity="0.8"/>
                
                <defs>
                  <linearGradient id="goldGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="50%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldBorder4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="goldInner4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DAA520"/>
                    <stop offset="50%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4 font-sora">Move In!</h3>
              <div className="luxury-badge">
                Seamless Check‑in
              </div>
              <p className="text-gray-300 leading-relaxed">
                Keys, utilities, and Wi‑Fi ready from day one with hotel‑grade service
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Spy-themed CTA component (inserted from web-to-mcp reference 8c3d847a-c8c1-43e9-b362-f923d83e1c3b) */}
      <section className="relative bg-black py-14">
        <div className="pointer-events-none absolute inset-0 agent-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="spy-cta-section rounded-3xl border border-gray-400/40 bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#000000] p-8 md:p-12 text-center shadow-[0_0_40px_rgba(192,192,192,0.15)]">
            <div className="relative z-10">
              <div className="font-mono uppercase tracking-wider text-sm text-gray-300 mb-2">Access Granted</div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 font-sora">Join the Swift Luxury Network</h3>
              <p className="text-gray-300 max-w-3xl mx-auto mb-6">Create your account to manage bookings, preferences, and secure crypto-enabled payments with our agent-style dashboard.</p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/register" className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-white text-black font-bold shadow-lg transition border border-gray-300">Register</Link>
                <Link href="/login" className="px-6 py-3 rounded-xl bg-transparent hover:bg-gray-800/50 text-white font-bold border-2 border-gray-400 hover:border-gray-300 transition">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
