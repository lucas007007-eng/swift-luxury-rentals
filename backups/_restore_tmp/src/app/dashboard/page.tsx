'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientDashboard() {
  const cards = [
    { title: 'Personal info', desc: 'Provide personal details and how we can reach you', href: '#', icon: '💳' },
    { title: 'Login & security', desc: 'Update your password and secure your account', href: '#', icon: '🛡️' },
    { title: 'Payments & payouts', desc: 'View payments, payouts, coupons, and taxes', href: '#', icon: '💶' },
    { title: 'Notifications', desc: 'Choose notification preferences and how you want to be contacted', href: '#', icon: '🔔' },
    { title: 'Privacy & sharing', desc: 'Control connected apps, what you share, and who sees it', href: '#', icon: '👁️' },
    { title: 'Global preferences', desc: 'Set your default language, currency, and timezone', href: '#', icon: '🌐' },
  ]
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header forceBackground={true} />
      <section className="flex-1 pt-36 md:pt-40 pb-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-3xl font-extrabold mb-1 text-center">Account</h1>
          <p className="text-white/60 mb-8 text-center">Welcome to your Swift Luxury dashboard</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {cards.map((c) => (
            <Link key={c.title} href={c.href} className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-6 block">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="text-white/70 text-sm mt-1">{c.desc}</div>
            </Link>
          ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}


