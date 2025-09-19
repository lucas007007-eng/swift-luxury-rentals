'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cityProperties } from '@/data/cityProperties'
import Header from '@/components/Header'
import dynamic from 'next/dynamic'
const SpyEuropeMap = dynamic(() => import('@/components/SpyEuropeMap'), { ssr: false })
const AdminCalendar = dynamic(() => import('@/components/PublicCalendar'), { ssr: false })
const MvpAccomplishments = dynamic(() => import('@/components/MvpAccomplishments'), { ssr: false })
const SimpleTimer = dynamic(() => import('@/components/SimpleTimer'), { ssr: false })

export default function AdminDashboard() {
  const router = useRouter()
  const cities = Object.keys(cityProperties)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [crmRows, setCrmRows] = useState<any[]>([])
  const monthNamesFull = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const currentMonthLabel = monthNamesFull[new Date().getMonth()]

  const reloadAnalytics = async () => {
    // Avoid duplicate fetches if a concurrent call is in-flight
    if ((window as any).__adminLoading) return
    ;(window as any).__adminLoading = true
    try {
      const [analyticsRes, crmRes] = await Promise.all([
        fetch('/api/admin/analytics', { cache: 'no-store' }),
        fetch('/api/admin/crm', { cache: 'no-store' }),
      ])
      const [analyticsData, crmData] = await Promise.all([
        analyticsRes.json(),
        crmRes.json(),
      ])
      setMetrics(analyticsData)
    setCrmRows(crmData?.rows || [])
    ;(window as any).__depositsHeld = crmData?.depositsHeld || 0
    } finally {
      ;(window as any).__adminLoading = false
    }
  }

  useEffect(() => {
    (async()=>{
      try { await reloadAnalytics() } finally { setLoading(false) }
    })()
  }, [])

  const monthLabels = useMemo(() => metrics?.monthly?.map((m: any) => m.label) || [], [metrics])
  const revenueSeries = useMemo(() => metrics?.monthly?.map((m: any) => m.revenue) || [], [metrics])
  const bookingsSeries = useMemo(() => metrics?.monthly?.map((m: any) => m.bookings) || [], [metrics])
  const commissionSeries = useMemo(() => metrics?.monthly?.map((m: any) => m.commission) || [], [metrics])
  const growthSeries = useMemo(() => metrics?.monthly?.map((m: any) => m.growth) || [], [metrics])
  const topCities = useMemo(() => {
    try {
      const byCity: Record<string, number> = {}
      const y = new Date().getFullYear()
      for (const r of crmRows) {
        if (!r?.city) continue
        const ciYear = Number(String(r?.checkIn || '').slice(0,4))
        if (isNaN(ciYear) || ciYear !== y) continue
        const amt = Number(r?.total || 0)
        byCity[r.city] = (byCity[r.city] || 0) + (isNaN(amt) ? 0 : amt)
      }
      return Object.entries(byCity)
        .map(([city, total]) => ({ city, total }))
        .sort((a,b)=>b.total - a.total)
        .slice(0,5)
    } catch {
      return []
    }
  }, [crmRows])
  const formatShortDate = (iso: string) => {
    try {
      const parts = String(iso).split('-').map((x)=>Number(x))
      const [y, m, d] = parts
      if (!y || !m || !d) return iso
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const j = d % 10, k = d % 100
      let suffix = 'th'
      if (k !== 11 && k !== 12 && k !== 13) {
        if (j === 1) suffix = 'st'
        else if (j === 2) suffix = 'nd'
        else if (j === 3) suffix = 'rd'
      }
      const yy = String(y).slice(2)
      return `${months[m-1]} ${d}${suffix}, ${yy}'`
    } catch { return iso }
  }
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header forceBackground={true} />
      <div className="flex-1 flex items-center justify-center pt-8 pb-16">
        <div className="max-w-[1800px] mx-auto px-6 py-8 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/70">Select a city to manage its listings.</p>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch('/api/admin/logout', { method: 'POST' })
                router.push('/admin/login')
              } catch (e) {
                console.error('Logout failed:', e)
              }
            }}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
        {/* Quick Access CTAs */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CMS Dashboard CTA */}
          <div
            className="relative rounded-2xl p-6 border border-green-400/30 bg-gradient-to-br from-[#0b1a0b] to-[#08120a] shadow-[0_0_22px_rgba(34,197,94,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/admin/pages')}
            role="link"
            aria-label="Click to access CMS dashboard"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-green-400">Content Management</div>
                <div className="text-xl font-extrabold text-white mt-1">CMS Dashboard</div>
                <div className="text-white/70 mt-1 text-sm">Edit page content, SEO, and site copy.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-green-500 text-white font-semibold text-sm group-hover:bg-green-400 transition-colors">Open CMS →</div>
              </div>
            </div>
          </div>
          
          {/* CRM Dashboard CTA */}
          <div
            className="relative rounded-2xl p-6 border border-amber-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_22px_rgba(245,158,11,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/crm')}
            role="link"
            aria-label="Click to access CRM dashboard"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-amber-400">Customer Relations</div>
                <div className="text-xl font-extrabold text-white mt-1">CRM Dashboard</div>
                <div className="text-white/70 mt-1 text-sm">Manage customers, VIPs, and lease agreements.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-amber-500 text-black font-semibold text-sm group-hover:bg-amber-400 transition-colors">Open CRM →</div>
              </div>
            </div>
          </div>
          
          {/* Sales Analytics CTA */}
          <div
            className="relative rounded-2xl p-6 border border-blue-400/30 bg-gradient-to-br from-[#0b0f1a] to-[#08120d] shadow-[0_0_22px_rgba(59,130,246,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/sales-analytics')}
            role="link"
            aria-label="Click to access sales analytics"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-blue-400">Analytics</div>
                <div className="text-xl font-extrabold text-white mt-1">Sales Analytics</div>
                <div className="text-white/70 mt-1 text-sm">Revenue targets, metrics, and charts.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-blue-500 text-white font-semibold text-sm group-hover:bg-blue-400 transition-colors">Open Analytics →</div>
              </div>
            </div>
          </div>
        </div>

        {/* Operations, Edit Live Listings, and Accounting Tools */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Radar CTA */}
          <div
            className="relative rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_22px_rgba(16,185,129,0.22)] cursor-pointer overflow-hidden group h-[280px] flex flex-col justify-center"
            onClick={() => router.push('/admin/bookings')}
            role="link"
            aria-label="Click to manage bookings"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-amber-400">Operations</div>
                <div className="text-xl font-extrabold text-white mt-1">Manage Bookings</div>
                <div className="text-white/70 mt-1 text-sm">View, confirm, or cancel reservations.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-emerald-500 text-black font-semibold text-sm group-hover:bg-emerald-400 transition-colors">Open Bookings →</div>
              </div>
            </div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.5)] h-[280px] bg-[#07140F]">
            <div className="absolute top-3 left-4 z-10">
              <div className="font-mono uppercase tracking-wider text-sm md:text-base gold-metallic-text">Edit Live Listings</div>
            </div>
            <SpyEuropeMap onPinClick={(city) => router.push(`/admin/city/${encodeURIComponent(city)}`)} />
          </div>
          
          {/* Accounting CTA */}
          <div
            className="relative rounded-2xl p-6 border border-indigo-400/30 bg-gradient-to-br from-[#0b0f1a] to-[#080a12] shadow-[0_0_22px_rgba(99,102,241,0.22)] cursor-pointer overflow-hidden group h-[280px] flex flex-col justify-center"
            onClick={() => router.push('/admin/accounting')}
            role="link"
            aria-label="Click to access accounting dashboard"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-indigo-400">Financial Management</div>
                <div className="text-xl font-extrabold text-white mt-1">Accounting</div>
                <div className="text-white/70 mt-1 text-sm">Track expenses, profits, and financial reports.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-indigo-500 text-white font-semibold text-sm group-hover:bg-indigo-400 transition-colors">Open Accounting →</div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools CTAs */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skill Tree CTA */}
          <div
            className="relative rounded-2xl p-6 border border-yellow-400/30 bg-gradient-to-br from-[#1a1a0b] to-[#12120a] shadow-[0_0_22px_rgba(234,179,8,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/admin/accomplishments')}
            role="link"
            aria-label="Click to view skill tree"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-yellow-400">Development</div>
                <div className="text-xl font-extrabold text-white mt-1">Skill Tree</div>
                <div className="text-white/70 mt-1 text-sm">Interactive skill tree with completed achievements and current objectives.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-yellow-500 text-black font-semibold text-sm group-hover:bg-yellow-400 transition-colors">Open Skill Tree →</div>
              </div>
            </div>
          </div>
          
          {/* DevOps Tools CTA */}
          <div
            className="relative rounded-2xl p-6 border border-orange-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_22px_rgba(249,115,22,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/admin/devops')}
            role="link"
            aria-label="Click to access DevOps tools"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-orange-400">Development</div>
                <div className="text-xl font-extrabold text-white mt-1">DevOps Tools</div>
                <div className="text-white/70 mt-1 text-sm">Page Edits, Operating Manual, Engineering Playbooks, Saved Prompts, Repo Map, Week Plan.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-orange-500 text-white font-semibold text-sm group-hover:bg-orange-400 transition-colors">Open DevOps →</div>
              </div>
            </div>
          </div>
          
          {/* Support Tickets CTA */}
          <div
            className="relative rounded-2xl p-6 border border-purple-400/30 bg-gradient-to-br from-[#1a0b1a] to-[#120a12] shadow-[0_0_22px_rgba(168,85,247,0.22)] cursor-pointer overflow-hidden group"
            onClick={() => router.push('/support-dashboard')}
            role="link"
            aria-label="Click to access support tickets"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-purple-400">Support</div>
                <div className="text-xl font-extrabold text-white mt-1">Support Tickets</div>
                <div className="text-white/70 mt-1 text-sm">Manage tenant communications and support requests.</div>
                <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-purple-500 text-white font-semibold text-sm group-hover:bg-purple-400 transition-colors">Open Support →</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

    </main>
  )
}

function MVPProgress() {
  const [items, setItems] = React.useState<{ id: string; label: string; done: boolean }[]>([])
  const [expanded, setExpanded] = React.useState(false)
  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mvp_checklist_v2') : null
      const versionKey = 'mvp_checklist_version_v2'
      const currentVersion = '2025-09-15-accomplishments-v14'
      const savedVersion = typeof window !== 'undefined' ? localStorage.getItem(versionKey) : null
      // Seed from accomplishments + MVP roadmap
      const seed = [
        // ✅ COMPLETED - Frontend Foundation
        { id: 'frontend-pages', label: 'Complete site structure: Homepage, City/Property pages, all legal pages', done: true },
        { id: 'frontend-search', label: 'Search interface with date pickers and responsive layout', done: true },
        { id: 'frontend-filters', label: 'Airbnb-style filter modal (beds, baths, amenities, price range)', done: true },
        { id: 'frontend-performance', label: 'Performance optimization: dynamic imports, Service Worker, RSC-safe navigation', done: true },
        { id: 'frontend-gallery', label: 'Image galleries with modal viewers and property detail UX', done: true },
        { id: 'frontend-responsive', label: 'Mobile-responsive design with hamburger menu and touch-friendly controls', done: true },

        // ✅ COMPLETED - Admin Foundation  
        { id: 'admin-auth', label: 'Admin authentication with middleware, rate limiting, secure cookies', done: true },
        { id: 'admin-dashboard', label: 'CRM dashboard with analytics, metrics, VIP customers, charts', done: true },
        { id: 'admin-bookings', label: 'Booking operations: status updates, deposit lifecycle, tools', done: true },
        { id: 'admin-listings', label: 'Property management: edit details, pricing, media, availability calendars', done: true },
        { id: 'admin-tools', label: 'Productivity toolkit: Operating Manual, Playbooks, Prompts, Repo Map', done: true },

        // ✅ COMPLETED - Data & Infrastructure
        { id: 'data-prisma', label: 'Prisma schema, migrations, AdminOverride model with performance indexes', done: true },
        { id: 'data-environment', label: 'One-click environment: start-server.bat, Docker Postgres, health checks', done: true },
        { id: 'data-backup', label: 'Backup/restore system with zip snapshots and git tagging', done: true },
        { id: 'data-timer', label: 'Development Timer with localStorage persistence and activity tracking', done: true },
        { id: 'data-maps', label: 'Google Maps integration with property pins and city coordinates', done: true },
        { id: 'data-cache', label: 'Service Worker caching with cache invalidation system', done: true },

        // ✅ COMPLETED - Core Features (Left Box)
        { id: 'core-middleware', label: 'Anti-cache middleware with timestamp ETags and cache busting', done: true },
        { id: 'core-forms', label: 'Contact forms with React Hook Form validation and success states', done: true },
        { id: 'core-analytics', label: 'Sales analytics dashboard: revenue tracking, bar charts, growth metrics, conversion rates', done: true },
        { id: 'core-multicity', label: 'Multi-city property system with 10+ European cities and localized data', done: true },
        { id: 'core-overrides', label: 'Admin override system for real-time property updates (pricing, amenities, availability)', done: true },
        { id: 'core-calendar', label: 'Sophisticated booking calendar system with month navigation and availability management', done: true },
        
        // ✅ COMPLETED - Core Features (Right Box - Top Priority)
        { id: 'core-pdf', label: 'PDF generation system for lease agreements and invoices with admin controls', done: true },
        { id: 'core-radar', label: 'Interactive spy-themed radar map for city navigation with animated sweeps', done: true },
        { id: 'core-targets', label: 'Sales targets system: monthly/quarterly/annual with pace tracking and editable goals', done: true },
        { id: 'core-vip', label: 'VIP customer tracking with spend analytics and join date history', done: true },
        
        // 🔄 IN PROGRESS - Week 2: Payments & Pricing
        { id: 'w2-stripe', label: 'Stripe PaymentIntents + webhooks + metadata', done: false },
        { id: 'w2-coinbase', label: 'Coinbase Commerce charges + webhooks', done: false },
        { id: 'w2-escrow', label: 'Escrow flow: hold TTL, approve/capture, decline/auto-refund', done: false },
        { id: 'w2-pricing', label: 'Pricing/fees engine (nightly/monthly, pro‑ration, deposit/move-in, VAT)', done: false },
        { id: 'w2-concurrency', label: 'Availability concurrency (SELECT FOR UPDATE, expiresAt, idempotent webhooks)', done: false },

        // 📅 PLANNED - Week 3: KYC, owners, storage, comms
        { id: 'w3-kyc', label: 'KYC/ID verification (Stripe Identity/Persona) + store status', done: false },
        { id: 'w3-owners', label: 'Owner intake form + minimal owner dashboard', done: false },
        { id: 'w3-storage', label: 'S3 storage with signed PUT/GET; migrate uploads', done: false },
        { id: 'w3-emails', label: 'Email templates with Postmark/SES for key booking events', done: false },

        // 📅 PLANNED - Week 4: Hardening, tests, deploy
        { id: 'w4-observability', label: 'Observability: Sentry, PostHog, rate limits, cache headers, RBAC', done: false },
        { id: 'w4-tests', label: 'Testing suite: API tests, webhook signatures, Playwright E2E', done: false },
        { id: 'w4-compliance', label: 'Compliance + SEO: Cookie Settings, sitemap/robots, legal pages', done: false },
        { id: 'w4-deploy', label: 'Production deployment: Vercel + managed Postgres, webhooks, launch checklist', done: false },
      ]
      const shouldReplace = !raw || savedVersion !== currentVersion
      if (shouldReplace) {
        setItems(seed)
        if (typeof window !== 'undefined') {
          localStorage.setItem('mvp_checklist_v2', JSON.stringify(seed))
          localStorage.setItem(versionKey, currentVersion)
        }
      } else {
        try { setItems(JSON.parse(raw as string)) } catch { setItems(seed) }
      }
    } catch {}
  }, [])
  const completed = items.filter(i=>i.done).length
  const total = Math.max(1, items.length)
  const pct = Math.round((completed/total)*100)
  const toggle = (id: string) => {
    const next = items.map(i => i.id===id ? { ...i, done: !i.done } : i)
    setItems(next)
    try { if (typeof window !== 'undefined') localStorage.setItem('mvp_checklist_v2', JSON.stringify(next)) } catch {}
  }
  return (
    <div className="relative rounded-2xl p-6 border border-amber-400/40 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_25px_rgba(245,158,11,0.3)] overflow-hidden flex-1">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,158,11,0.1)_1px,transparent_1px),linear-gradient(rgba(245,158,11,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
      </div>
      
      {/* Glowing corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60" />

      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(v => {
              const newExpanded = !v
              // Sync with overflow component
              if (typeof window !== 'undefined') {
                (window as any).__mvpExpanded = newExpanded
              }
              return newExpanded
            })
          }}
          className="w-full text-left group cursor-pointer"
          aria-expanded={expanded}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono uppercase tracking-wider text-lg text-amber-400 font-bold group-hover:text-amber-300 transition-colors">MVP Progress</div>
              <div className="text-amber-200/80 text-sm">{completed} of {total} tasks completed</div>
            </div>
            <div className="relative">
              {/* Cool animated dropdown arrow */}
              <div className={`w-8 h-8 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center group-hover:border-amber-300 group-hover:bg-amber-400/20 transition-all ${expanded ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          </div>
        </button>

        {!expanded ? (
          <div className="space-y-4">
            {/* Status indicator to match timer */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-amber-200/80 font-mono">
                PROGRESS TRACKING
              </span>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Completed</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {completed}
                </div>
                <div className="text-xs text-amber-200/60">Features done</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Remaining</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {total - completed}
                </div>
                <div className="text-xs text-amber-200/60">Tasks left</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Progress</div>
                <div className="text-3xl font-mono font-bold text-amber-300 mb-1 glow-text">
                  {pct}%
                </div>
                <div className="text-xs text-amber-200/60">To MVP</div>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="mt-4 h-1 bg-amber-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 relative"
                style={{ width: `${pct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            
            <div className="mt-2 text-center text-xs text-amber-200/60" style={{ marginBottom: '-6px' }}>
              {pct}% complete • {total - completed} tasks remaining • Click to expand details
            </div>
          </div>
        ) : null}
        {expanded && (
          <div className="mt-6 grid grid-cols-1 gap-3">
            {(() => {
              // Custom split: 22 items in left column, rest in right
              const splitPoint = 22
              
              return items.slice(0, splitPoint).map(i => (
                <label key={i.id} className="flex items-start gap-3 text-base text-amber-200/90 p-2 rounded-lg hover:bg-amber-400/5 transition-colors cursor-pointer">
                  <input type="checkbox" checked={!!i.done} onChange={()=>toggle(i.id)} className="accent-amber-500 mt-1 w-4 h-4" />
                  <span className={i.done ? 'line-through text-amber-200/60' : 'leading-relaxed'}>{i.label}</span>
                </label>
              ))
            })()}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </div>
  )
}

function MVPProgressOverflow() {
  const [items, setItems] = React.useState<{ id: string; label: string; done: boolean }[]>([])
  const [expanded, setExpanded] = React.useState(false)
  
  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mvp_checklist_v2') : null
      if (raw) {
        try { setItems(JSON.parse(raw as string)) } catch { setItems([]) }
      }
    } catch {}
  }, [])

  const toggle = (id: string) => {
    const next = items.map(i => i.id===id ? { ...i, done: !i.done } : i)
    setItems(next)
    try { if (typeof window !== 'undefined') localStorage.setItem('mvp_checklist_v2', JSON.stringify(next)) } catch {}
  }

  // Listen for MVP Progress expand state
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('mvp_checklist_v2') : null
        if (raw) {
          try { setItems(JSON.parse(raw as string)) } catch { setItems([]) }
        }
      } catch {}
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Sync expanded state with main MVP Progress (you'll need to add this)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const mvpExpanded = (window as any).__mvpExpanded
      if (mvpExpanded !== expanded) {
        setExpanded(mvpExpanded || false)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [expanded])

  const secondHalf = (() => {
    // Custom split: 22 items in left column, rest in right
    const splitPoint = 22
    return items.slice(splitPoint)
  })()

  if (!expanded || secondHalf.length === 0) return null

  return (
    <div className="relative rounded-2xl p-6 border border-amber-400/40 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_25px_rgba(245,158,11,0.3)] overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,158,11,0.1)_1px,transparent_1px),linear-gradient(rgba(245,158,11,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
      </div>
      
      {/* Glowing corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60" />

      <div className="relative">
        <div className="font-mono uppercase tracking-wider text-lg text-amber-400 font-bold mb-4">MVP Progress (continued)</div>
        
        <div className="grid grid-cols-1 gap-3">
          {secondHalf.map(i => (
            <label key={i.id} className="flex items-start gap-3 text-base text-amber-200/90 p-2 rounded-lg hover:bg-amber-400/5 transition-colors cursor-pointer">
              <input type="checkbox" checked={!!i.done} onChange={()=>toggle(i.id)} className="accent-amber-500 mt-1 w-4 h-4" />
              <span className={i.done ? 'line-through text-amber-200/60' : 'leading-relaxed'}>{i.label}</span>
            </label>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </div>
  )
}

function MetricCard({ title, value, prefix = '', suffix = '', loading, moneyBackground = false, moneyTrail = false, trend = false, bgGifSrc, gifHeight = 132, className = '' }: { title: string; value: number; prefix?: string; suffix?: string; loading?: boolean; moneyBackground?: boolean; moneyTrail?: boolean; trend?: boolean; bgGifSrc?: string; gifHeight?: number; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.25)] overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.1),transparent_40%)]" style={{ zIndex: 0 }} />
      {bgGifSrc && (
        <img
          src={bgGifSrc}
          alt="bg"
          className="pointer-events-none absolute object-contain opacity-40"
          style={{ left: '0px', bottom: '0px', height: `${gifHeight}px`, zIndex: 1 }}
          onError={(e)=>{
            const img = e.currentTarget as HTMLImageElement
            const step = img.getAttribute('data-step') || '0'
            if (step === '0') { img.src = '/images/pepe%20gif.gif'; img.setAttribute('data-step','1') }
            else if (step === '1') { img.src = '/api/img?url=' + encodeURIComponent('https://example.com/pepe.gif'); img.setAttribute('data-step','2') }
          }}
        />
      )}
      {moneyBackground && (
        <>
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="money-emoji" style={{ top: `${10 + i*12}%`, animationDuration: `${10 + i*2}s`, animationDelay: `${i*0.8}s` }}>💸</div>
          ))}
        </>
      )}
      {trend && (
        <svg className="pointer-events-none absolute inset-0" viewBox="0 0 300 200" preserveAspectRatio="none" style={{ zIndex: 2 }}>
          <polyline className="trend-path" fill="none" stroke="#22c55e" strokeWidth="3" points="0,190 40,160 80,170 120,130 160,140 200,100 240,110 300,40" />
        </svg>
      )}
      <div className="relative">
        <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text mb-2">{title}</div>
        <div className="text-3xl font-extrabold text-emerald-400 relative inline-flex items-center">
          {(() => {
            const formatted = loading ? '—' : `${prefix}${Number(value).toLocaleString('de-DE')}${suffix}`
            return (
              <span className="relative inline-block">
                {formatted}
                {moneyTrail && !loading && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 flex">
                    {Array.from({length: 3}).map((_, i) => (
                      <span key={i} className="money-spark" style={{ animationDelay: `${i*0.3}s`, animationDuration: '3s' }}>💸</span>
                    ))}
                  </span>
                )}
              </span>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

function TargetsRow({ metrics, loading }: { metrics: any; loading: boolean }) {
  const [annualTarget, setAnnualTarget] = useState<number>(300000)
  const [annualTargetEditing, setAnnualTargetEditing] = useState<boolean>(false)
  const [annualDraft, setAnnualDraft] = useState<number>(300000)
  const [clientCalculations, setClientCalculations] = useState<any>(null)

  // Load annual target from localStorage on client side only
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = Number(localStorage.getItem('target_annual') || '300000')
        setAnnualTarget(saved)
        setAnnualDraft(saved)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem('target_annual', String(annualTarget)) } catch {}
  }, [annualTarget])

  // Calculate date-dependent values on client side only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const monthFrac = (now.getDate()) / monthEnd.getDate()
    const monthRevenue = Number(metrics?.totals?.monthlyRevenue || 0)

    const qIndex = Math.floor(now.getMonth() / 3)
    const qStart = new Date(now.getFullYear(), qIndex * 3, 1)
    const qEnd = new Date(now.getFullYear(), qIndex * 3 + 3, 0)
    const qFrac = (now.getTime() - qStart.getTime()) / (qEnd.getTime() - qStart.getTime())
    const monthlySeries: number[] = (metrics?.monthly || []).map((m: any) => Number(m.revenue || 0))
    const qMonths = [qIndex * 3, qIndex * 3 + 1, qIndex * 3 + 2]
    const qRevenue = qMonths
      .filter((m) => m <= now.getMonth())
      .reduce((s, m) => s + (monthlySeries[m] || 0), 0)
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)
    const yearFrac = (now.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())
    const yearRevenue = Number(metrics?.totals?.annualRevenue || 0)
    const monthsRemaining = Math.max(0, 12 - now.getMonth())
    const remainingToAnnualTarget = Math.max(0, annualTarget - yearRevenue)
    const MS_DAY = 86400000
    const startNextYear = new Date(now.getFullYear() + 1, 0, 1)
    const daysRemainingTotal = Math.max(1, Math.ceil((startNextYear.getTime() - now.getTime()) / MS_DAY))
    const monthlyNeededForAnnual = Math.ceil((remainingToAnnualTarget * 30) / daysRemainingTotal)
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysLeftThisMonth = Math.max(0, Math.ceil((endOfThisMonth.getTime() - now.getTime()) / MS_DAY))
    const monthsAfter = Math.max(0, 11 - now.getMonth())
    const quarterMonthsPlanned = 3
    const quarterPlanTotal = monthlyNeededForAnnual * quarterMonthsPlanned
    const quarterLabel = `Q${qIndex + 1}`

    setClientCalculations({
      now, monthFrac, monthRevenue, qIndex, qFrac, qRevenue, yearFrac, yearRevenue,
      monthsRemaining, remainingToAnnualTarget, daysRemainingTotal, monthlyNeededForAnnual,
      daysLeftThisMonth, monthsAfter, quarterMonthsPlanned, quarterPlanTotal, quarterLabel
    })
  }, [metrics, annualTarget])

  // Show loading state until client calculations are ready
  if (!clientCalculations) {
    return (
      <div className="rounded-2xl p-4 md:p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.18)] mb-8">
        <div className="text-white/50 text-center py-8">Loading targets...</div>
      </div>
    )
  }

  const { now, monthFrac, monthRevenue, qIndex, qFrac, qRevenue, yearFrac, yearRevenue,
    monthsRemaining, remainingToAnnualTarget, daysRemainingTotal, monthlyNeededForAnnual,
    daysLeftThisMonth, monthsAfter, quarterMonthsPlanned, quarterPlanTotal, quarterLabel } = clientCalculations

  return (
    <div className="rounded-2xl p-4 md:p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.18)] mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TargetCard
          title={`Sales Target for ${now.toLocaleString('default',{ month:'long' })}`}
          value={monthlyNeededForAnnual}
          achieved={monthRevenue}
          paceFrac={monthFrac}
          hint={`Auto from annual target • ${monthsAfter} mo ${daysLeftThisMonth} days remaining`}
        />
        <TargetCard
          title={`${quarterLabel} Sales Target`}
          value={quarterPlanTotal}
          achieved={qRevenue}
          paceFrac={qFrac}
          hint={`Based on €${monthlyNeededForAnnual.toLocaleString('de-DE')}/mo × ${quarterMonthsPlanned} mo = €${quarterPlanTotal.toLocaleString('de-DE')}`}
        />
        <TargetCard
          title={`Annual Sales Target`}
          value={annualTarget}
          achieved={yearRevenue}
          paceFrac={yearFrac}
          extraNote={`Need €${monthlyNeededForAnnual.toLocaleString('de-DE')}/mo avg for remaining ${monthsAfter} mo and ${daysLeftThisMonth} days`}
        >
          {!annualTargetEditing ? (
            <button
              className="mt-3 inline-flex items-center bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1.5 rounded"
              onClick={()=>{ setAnnualDraft(annualTarget); setAnnualTargetEditing(true) }}
            >
              Change Target
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <input type="number" className="w-32 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm" value={annualDraft} onChange={(e)=>setAnnualDraft(Number(e.target.value||0))} />
              <button
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1.5 rounded"
                onClick={()=>{ setAnnualTarget(annualDraft); setAnnualTargetEditing(false) }}
              >
                Confirm
              </button>
            </div>
          )}
        </TargetCard>
      </div>
    </div>
  )
}

function TargetCard({ title, value, achieved, paceFrac, extraNote, hint, children }: { title: string; value: number; achieved: number; paceFrac: number; extraNote?: string; hint?: string; children?: React.ReactNode }) {
  const progress = Math.min(1, value > 0 ? achieved / value : 0)
  const onPace = achieved >= value * paceFrac
  return (
    <div className="relative rounded-xl p-4 border border-emerald-400/25 bg-gradient-to-br from-[#092017] to-[#08170f]">
      <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text mb-2">{title}</div>
      <div className="text-white/80 text-sm mb-2">Target: €{Number(value).toLocaleString('de-DE')}</div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full" style={{ width: `${progress*100}%`, transition: 'width 900ms cubic-bezier(.2,.8,.2,1)', background: onPace ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-sm md:text-base">
        <div className={onPace ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
          {onPace ? 'On pace' : 'Behind pace'}
        </div>
        <div className="text-emerald-400 font-semibold">€{achieved.toLocaleString('de-DE')} / €{value.toLocaleString('de-DE')}</div>
      </div>
      {extraNote && <div className="mt-1 text-[11px] text-emerald-300/80">{extraNote}</div>}
      {hint && <div className="mt-1 text-sm md:text-base text-white/60">{hint}</div>}
      {children}
    </div>
  )
}

function BarChart({ title, labels, series, color, loading, prefix = '' }: { title: string; labels: string[]; series: number[]; color: string; loading?: boolean; prefix?: string }) {
  const maxVal = Math.max(1, ...(series || [1]))
  const [animate, setAnimate] = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const PLOT_HEIGHT = 200 // px reserved for bars
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150)
    return () => clearTimeout(t)
  }, [labels?.join('|'), series?.join('|')])

  return (
    <div className="rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40 agent-grid" />
      <div className="relative mb-4">
        <div className="text-white/90 font-semibold text-lg">{title}</div>
        {hoverIdx !== null && series?.[hoverIdx] != null && (
          <div className="mt-1 text-sm font-semibold text-amber-300">
            {labels[hoverIdx]}: {prefix}{Number(series[hoverIdx]).toLocaleString('de-DE')}
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-48 flex items-center justify-center text-white/40">Loading…</div>
      ) : (
        <>
          {/* Plot area (bars + right axis) */}
          <div className="relative" style={{ height: `${PLOT_HEIGHT}px` }}>
            <div className="grid grid-cols-12 gap-2 items-end pr-10 h-full">
              {labels.map((label, i) => {
                const height = animate ? (series[i] / maxVal) * PLOT_HEIGHT : 0
                const delay = i * 60
                return (
                  <div key={label} className="flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${height}px`,
                        backgroundImage: `linear-gradient(180deg, ${color}, ${color}aa)`,
                        transition: `height 900ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
                        boxShadow: `0 8px 20px ${color}33`
                      }}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                  </div>
                )
              })}
            </div>
            {/* Right-side Y-axis tick labels (aligned to plot area) */}
            {(() => {
              const tickCount = 4
              const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (i / tickCount) * maxVal)
              return (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10">
                  {ticks.map((v, i) => {
                    const bottom = (v / maxVal) * PLOT_HEIGHT
                    const formatted = `${prefix}${Number(Math.round(v)).toLocaleString('de-DE')}`
                    return (
                      <div key={i} className="absolute right-0 translate-y-1/2 text-[10px] text-white/50 select-none" style={{ bottom: `${bottom}px` }}>
                        {formatted}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
          {/* X-axis month labels below the plot area */}
          <div className="grid grid-cols-12 gap-2 mt-2">
            {labels.map((label) => (
              <div key={label} className="text-[10px] text-white/60 text-center">{label.slice(0,3)}</div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CRMTables({ onChange }: { onChange?: () => void }) {
  const [rows, setRows] = useState<any[]>([])
  const [vips, setVips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ clientName: string; propertyId: string; checkIn: string; checkOut: string }>({ clientName: '', propertyId: '', checkIn: '', checkOut: '' })
  const [showCal, setShowCal] = useState(false)
  // Editing of paid status and receive-next actions have been moved to /admin/bookings
  const [showAllVIPs, setShowAllVIPs] = useState(false)
  const formatShortDate = (iso: string) => {
    try {
      const [yStr,mStr,dStr] = String(iso).split('-')
      const y = Number(yStr), m = Number(mStr), d = Number(dStr)
      if (!y || !m || !d) return iso
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const j = d % 10, k = d % 100
      let suffix = 'th'
      if (k !== 11 && k !== 12 && k !== 13) {
        if (j === 1) suffix = 'st'
        else if (j === 2) suffix = 'nd'
        else if (j === 3) suffix = 'rd'
      }
      const yy = String(y).slice(2)
      return `${months[m-1]} ${d}${suffix}, ${yy}'`
    } catch { return iso }
  }
  const selectedMonthlyPrice = useMemo(()=>{
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any)=> x.id === form.propertyId)
      if (p) return Number(p.price) || 0
    }
    return 0
  }, [form.propertyId])
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/crm', { cache: 'no-store' })
        const data = await res.json()
        setRows(data.rows || [])
        setVips(data.vips || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      {/* Quick Add Booking */}
      <div className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-4">
        <div className="flex items-center justify-between">
          <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text">Add Booking</div>
          {!adding ? (
            <button className="bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold px-3 py-1.5 rounded" onClick={()=>setAdding(true)}>Add</button>
          ) : (
            <button className="text-white/70 text-sm" onClick={()=>setAdding(false)}>Cancel</button>
          )}
        </div>
        {adding && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <input placeholder="Client name" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm" value={form.clientName} onChange={(e)=>setForm({...form, clientName: e.target.value})} />
            <select className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm" value={form.propertyId} onChange={(e)=>setForm({...form, propertyId: e.target.value})}>
              <option value="">Select property</option>
              {Object.entries(cityProperties).flatMap(([c, list])=> list.map((p:any)=> (
                <option key={p.id} value={p.id}>{c} — {p.title}</option>
              )))}
            </select>
            <button type="button" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-left" onClick={()=>setShowCal(v=>!v)}>
              {form.checkIn && form.checkOut ? `${form.checkIn} → ${form.checkOut}` : 'Select dates'}
            </button>
            <button className="bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold px-3 py-1.5 rounded" onClick={async()=>{
              const res = await fetch('/api/admin/crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
              const data = await res.json().catch(()=>null)
              if (res.ok && data?.row) {
                setRows([data.row, ...rows])
                setAdding(false)
                setForm({ clientName: '', propertyId: '', checkIn: '', checkOut: '' })
              }
            }}>Save</button>
          </div>
        )}
        {adding && showCal && (
          <div className="mt-3 bg-black/30 border border-white/10 rounded p-3">
            <AdminCalendar
              availability={{}}
              monthlyPrice={selectedMonthlyPrice}
              onChange={(start: string|null, end: string|null)=>{
                const s = start || ''
                const e = end || ''
                setForm({...form, checkIn: s, checkOut: e})
                // Keep calendar open after selecting checkout per request
              }}
            />
          </div>
        )}
      </div>
      {/* VIP Row */}
      <div>
        <div className="text-white/80 font-semibold mb-3 flex items-center justify-between">
          <span>VIP Customers</span>
          {!loading && vips.length > 3 && (
            <button
              className="text-xs px-2 py-1 rounded border border-emerald-400/30 text-emerald-300 hover:text-emerald-200"
              onClick={() => setShowAllVIPs(v => !v)}
            >
              {showAllVIPs ? 'View less' : 'View more'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(loading ? Array.from({length:4}).map((_,i)=>(
            <div key={i} className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-white/60">Loading…</div>
          )) : (showAllVIPs ? vips.slice(0,10) : vips.slice(0,3)).map((vip) => (
            <div key={vip.clientName} className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold gold-metallic-text">{vip.clientName}</div>
                <div className="text-xs text-emerald-400/80">Since {new Date(vip.dateJoined).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-white/80">Total Spend</div>
              <div className="text-2xl font-bold text-emerald-400">€{Number(vip.total).toLocaleString('de-DE')}</div>
            </div>
          )))}
        </div>
      </div>
      {/* CRM Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          Array.from({length:4}).map((_,i)=>(
            <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-3 text-white/60">Loading…</div>
          ))
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-white/70">No records yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-white font-semibold">{r.overdue ? (<span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">{r.clientName}</span>) : r.clientName}</div>
                <div className="text-xs text-white/50">{r.city}</div>
              </div>
              <div className="text-xs text-white/70 mt-0.5">{r.propertyTitle || r.propertyId}</div>
              {/* Dates */}
              <div className="mt-2 inline-flex flex-col gap-1 px-2.5 py-1.5 rounded border border-sky-400/30 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <span className="text-[11px] text-sky-300 whitespace-nowrap">Check-In: {formatShortDate(r.checkIn)}</span>
                <span className="text-[11px] text-sky-200/80 whitespace-nowrap">Checkout: {formatShortDate(r.checkOut)}</span>
              </div>
              {/* Chips row */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-400/40 bg-amber-500/10 text-amber-300 whitespace-nowrap">
                  <span className="font-bold">€</span>
                  <span className="font-semibold">{Number(r.leaseValue||0).toLocaleString('de-DE')}</span>
                  <span className="uppercase tracking-wider text-[10px] text-amber-200">Lease Total</span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
                  <span className="font-semibold">€{Number(r.receivedAmount||0).toLocaleString('de-DE')}</span>
                  <span className="uppercase tracking-wider text-[10px] text-emerald-200">Received</span>
                </div>
              </div>
              {/* Deposit / Next Due */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {typeof r.depositAmount === 'number' ? (
                    (() => {
                      const isRefunded = r.depositStatus === 'refunded'
                      const isCompleted = r.paid !== false
                      const chipClass = isRefunded
                        ? 'border-sky-400/30 bg-sky-500/10 text-sky-300'
                        : isCompleted
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                      const label = isRefunded ? 'Deposit Refunded' : (isCompleted ? 'Deposit Active' : 'No deposit')
                      return (
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border ${chipClass} whitespace-nowrap`}>
                          <span className="font-semibold">€{Number(r.depositAmount||0).toLocaleString('de-DE')}</span>
                          <span className="uppercase tracking-wider text-[10px] opacity-80">{label}</span>
                        </div>
                      )
                    })()
                  ) : <span className="text-white/40 text-xs">—</span>}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  {r.nextDue ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs whitespace-nowrap bg-amber-500/20 text-amber-300 border border-amber-400/30">{r.nextDue}</span>
                      <span className="text-sm font-semibold text-white whitespace-nowrap">€{Number(r.nextDueAmount||0).toLocaleString('de-DE')}</span>
                    </div>
                  ) : <span className="text-white/40 text-xs">—</span>}
                </div>
              </div>
              {/* Status + actions */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`px-2 py-1 text-xs rounded border ${r.paid !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                  {r.paid !== false ? 'Paid' : 'Unpaid'}
                </span>
                <div className="flex items-center gap-3">
                  {r.leasePdf ? <a className="text-amber-400 text-xs" href={r.leasePdf} target="_blank">Lease</a> : <span className="text-white/40 text-xs">Lease</span>}
                  {r.invoicePdf ? <a className="text-amber-400 text-xs" href={r.invoicePdf} target="_blank">Invoice</a> : <span className="text-white/40 text-xs">Invoice</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CRM Table (desktop) */}
      <div className="hidden md:block">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-white/60">
            <th className="py-2 pr-4">Client</th>
            <th className="py-2 pr-4">City</th>
            <th className="py-2 pr-4">Property</th>
            <th className="py-2 pr-4">Checkin/Checkout</th>
            <th className="py-2 pr-4">Lease Agreement Total</th>
            <th className="py-2 pr-4">Payment received</th>
            <th className="py-2 pr-4">Deposit</th>
            <th className="py-2 pr-4">Next due</th>
            <th className="py-2 pr-4">Paid</th>
            <th className="py-2 pr-4">Lease</th>
            <th className="py-2 pr-4">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="py-6 text-white/40" colSpan={7}>Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="py-6 text-white/60" colSpan={7}>No records yet.</td></tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="py-3 pr-4">{r.overdue ? (<span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">{r.clientName}</span>) : r.clientName}</td>
                <td className="py-3 pr-4">{r.city}</td>
                <td className="py-3 pr-4">{r.propertyTitle || r.propertyId}</td>
                <td className="py-3 pr-4">
                  <div className="inline-flex flex-col gap-1 px-2.5 py-1.5 rounded border border-sky-400/30 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-sky-300 whitespace-nowrap">Check-In: {formatShortDate(r.checkIn)}</span>
                      <span className="text-[11px] text-sky-200/80 whitespace-nowrap">Checkout: {formatShortDate(r.checkOut)}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {typeof r.leaseValue === 'number' ? (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] whitespace-nowrap" aria-label="Lease agreement total">
                      <span className="font-bold">€</span>
                      <span className="font-semibold">{Number(r.leaseValue||0).toLocaleString('de-DE')}</span>
                      <span className="uppercase tracking-wider text-[10px] text-amber-200">Lease Total</span>
                    </div>
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {(() => {
                    const amt = Number(r.receivedAmount || 0)
                    if (!amt) return <span className="text-white/40">—</span>
                    return (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] whitespace-nowrap" aria-label="Payment received">
                        <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
                        <span className="font-semibold">€{amt.toLocaleString('de-DE')}</span>
                        <span className="uppercase tracking-wider text-[10px] text-emerald-200">Received</span>
                      </div>
                    )
                  })()}
                </td>
                <td className="py-3 pr-4">
                  {typeof r.depositAmount === 'number' ? (
                    <div className="flex items-center gap-3">
                      {(() => {
                        const isCompleted = r.paid !== false
                        const isRefunded = r.depositStatus === 'refunded'
                        const chipClass = isRefunded
                          ? 'border-sky-400/30 bg-sky-500/10 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                          : isCompleted
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                            : 'border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        const label = isRefunded ? 'Deposit Refunded' : (isCompleted ? 'Deposit Active' : 'No deposit')
                        return (
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border ${chipClass} whitespace-nowrap`} aria-label="Deposit status">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"/>
                            </svg>
                            <span className="font-semibold">€{Number(r.depositAmount||0).toLocaleString('de-DE')}</span>
                            <span className="uppercase tracking-wider text-[10px] opacity-80">{label}</span>
                          </div>
                        )
                      })()}
                      {/* Refund action removed on CRM dashboard; manage refunds on Bookings page */}
                    </div>
                  ) : <span className="text-white/40">—</span>}
                </td>
                <td className="py-3 pr-4">
                  {r.nextDue ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs whitespace-nowrap bg-amber-500/20 text-amber-300">{r.nextDue}</span>
                      <span className="text-sm font-semibold text-white whitespace-nowrap">€{Number(r.nextDueAmount||0).toLocaleString('de-DE')}</span>
                    </div>
                  ) : <span className="text-white/40">—</span>}
                </td>
                <td className="py-3 pr-4 align-top">
                  <div className="space-y-2">
                    <span className={`px-2 py-1 text-xs rounded border ${r.paid !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                      {r.paid !== false ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {r.leasePdf ? (
                    <a className="text-amber-400 hover:text-amber-300" href={r.leasePdf} target="_blank">Open PDF</a>
                  ) : (
                    <button
                      className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-2 py-1 rounded"
                      onClick={async()=>{
                        try {
                          const res = await fetch('/api/admin/lease', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id }) })
                          const text = await res.text()
                          let data: any = null
                          try { data = JSON.parse(text) } catch {}
                          if (res.ok && data?.url) {
                            const next = [...rows]; next[idx] = { ...r, leasePdf: data.url }; setRows(next)
                          } else {
                            const msg = typeof data === 'object' && data ? (data.message || '') : ''
                            const err = typeof data === 'object' && data ? (data.error || '') : ''
                            alert(`Failed to generate lease. ${msg} ${err}`.trim())
                          }
                        } catch (e: any) {
                          alert('Failed to generate lease. Please try again.')
                        }
                      }}
                    >
                      Generate PDF
                    </button>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {r.invoicePdf ? <a className="text-amber-400 hover:text-amber-300" href={r.invoicePdf} target="_blank">Open PDF</a> : <span className="text-white/40">—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}


