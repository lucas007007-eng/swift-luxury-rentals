// server component (no "use client") to minimize client-side JS on homepage

import React from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import Hero from '@/components/Hero'
import dynamic from 'next/dynamic'

// Defer below-the-fold components to reduce initial bundle
const About = dynamic(() => import('@/components/About'), { ssr: false })
const Locations = dynamic(() => import('@/components/Locations'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })


export default function Home() {

  return (
    <main className="min-h-screen">
      <Header forceBackground={true} />
      <Hero />
      
      {/* Featured Properties grid removed per request */}

      

      <About />
      <Locations />

      {/* Crypto Payment Section moved below Our European Destinations */}
      <section className="pt-8 pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold crypto-shine mb-6">
              Revolutionary Crypto Rent Payments
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              The first platform in Berlin to accept cryptocurrency for rent payments. 
              We handle all the complexity - you just pay and move in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Crypto Payment */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 text-center border-2 border-gray-700">
              <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">₿</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Crypto & Credit Card</h3>
              <div className="flex justify-center space-x-4 mb-4">
                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-semibold">BTC</span>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-semibold">ETH</span>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">USDT</span>
              </div>
              <p className="text-gray-300">
                Use Bitcoin, Ethereum, USDT, or traditional credit card payments
              </p>
            </div>

            {/* EU Compliance */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 text-center border-2 border-gray-700">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🏦</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">EU Compliant</h3>
              <div className="bg-blue-500/20 rounded-lg p-3 mb-4">
                <span className="text-blue-400 font-semibold">Fully Regulated</span>
              </div>
              <p className="text-gray-300">
                All transactions comply with European banking regulations and anti-money laundering laws
              </p>
            </div>

            {/* Seamless Conversion */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 text-center border-2 border-gray-700">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Booking</h3>
              <div className="bg-purple-500/20 rounded-lg p-3 mb-4">
                <span className="text-purple-400 font-semibold">Auto Bank Wire</span>
              </div>
              <p className="text-gray-300">
                We automatically convert crypto to fiat and wire transfer to landlords
              </p>
            </div>

            {/* Move In! card */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 text-center border-2 border-gray-700">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🏠</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Move In!</h3>
              <div className="bg-emerald-500/20 rounded-lg p-3 mb-4">
                <span className="text-emerald-400 font-semibold">Seamless Check‑in</span>
              </div>
              <p className="text-gray-300">Keys, utilities, and Wi‑Fi are live from day one; suites are deep‑cleaned with hotel‑grade linens, and our guided check‑in gets you settled in minutes.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Spy-themed CTA component (inserted from web-to-mcp reference 8c3d847a-c8c1-43e9-b362-f923d83e1c3b) */}
      <section className="relative bg-black py-14">
        <div className="pointer-events-none absolute inset-0 agent-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-8 md:p-12 text-center shadow-[0_0_28px_rgba(16,185,129,0.18)]">
            <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text mb-2">Access Granted</div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Join the Swift Luxury Network</h3>
            <p className="text-white/70 max-w-3xl mx-auto mb-6">Create your account to manage bookings, preferences, and secure crypto-enabled payments with our agent-style dashboard.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg transition">Register</Link>
              <Link href="/login" className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition">Login</Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
