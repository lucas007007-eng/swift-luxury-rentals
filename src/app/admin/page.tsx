'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cityProperties } from '@/data/cityProperties'
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
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-10">
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
        {/* Accomplishments (full width for better readability) */}
        <div className="mb-6">
          <MvpAccomplishments />
        </div>
        
        {/* MVP Progress and Timer */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div key="mvp-progress" className="flex"><MVPProgress /></div>
          <div key="simple-timer" className="flex"><SimpleTimer /></div>
        </div>
        {/* Booking Radar CTA */}
        <div
          className="relative mb-10 rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_22px_rgba(16,185,129,0.22)] cursor-pointer overflow-hidden group"
          onClick={() => router.push('/admin/bookings')}
          role="link"
          aria-label="Click to manage bookings"
        >
          <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text">Operations</div>
              <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">Click here to manage bookings</div>
              <div className="text-white/70 mt-1 text-sm">View, confirm, or cancel reservations in real-time.</div>
              <div className="inline-flex items-center mt-4 px-3 py-1.5 rounded bg-emerald-500 text-black font-semibold text-sm group-hover:bg-emerald-400 transition-colors">Open Bookings →</div>
            </div>
            <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#062018] border border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.25)] overflow-hidden">
                <div className="absolute inset-0 radar-sweep" />
                {/* pings */}
                <div className="absolute left-1/3 top-1/4 w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="absolute left-2/3 top-2/3 w-2 h-2 bg-emerald-400 rounded-full radar-ping" />
                <div className="absolute left-1/4 top-2/3 w-2 h-2 bg-emerald-400/80 rounded-full" />
                {/* grid rings */}
                <div className="absolute inset-2 rounded-full border border-emerald-400/10" />
                <div className="absolute inset-6 rounded-full border border-emerald-400/10" />
                <div className="absolute inset-10 rounded-full border border-emerald-400/10" />
              </div>
            </div>
          </div>
          <style jsx>{`
            @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .radar-sweep {
              background: conic-gradient(from 0deg, rgba(16,185,129,0.0), rgba(16,185,129,0.15) 8deg, rgba(16,185,129,0.6) 18deg, rgba(16,185,129,0.0) 60deg);
              animation: spinSlow 6s linear infinite;
            }
            @keyframes ping { 0% { transform: scale(0.3); opacity: 0.9; } 80%, 100% { transform: scale(1.6); opacity: 0; } }
            .radar-ping { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); animation: ping 2.8s cubic-bezier(0,0,0.2,1) infinite; }
          `}</style>
        </div>
        {/* CRM Dashboard at top */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/90 font-semibold text-lg">CRM Dashboard</div>
          </div>
          <CRMTables onChange={reloadAnalytics} />
        </div>

        {/* Targets Row: Monthly / Quarterly / Annual */}
        <TargetsRow metrics={metrics} loading={loading} />

        {/* City tiles removed – radar map is now the sole navigation to city pages */}

        {/* Analytics row: Month, Annual, Live Listings map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 items-stretch">
          <MetricCard title={`${currentMonthLabel} Revenue`} value={metrics?.totals?.monthlyRevenue ?? 0} prefix="€" loading={loading} trend bgGifSrc="/images/pepe.gif" gifHeight={180} className="min-h-[280px]" />
          <MetricCard title="Annual Revenue" value={metrics?.totals?.annualRevenue ?? 0} prefix="€" loading={loading} trend className="min-h-[280px]" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.5)] h-[280px] bg-[#07140F]">
            <div className="absolute top-3 left-4 z-10">
              <div className="font-mono uppercase tracking-wider text-sm md:text-base gold-metallic-text">Live Listing</div>
            </div>
            <SpyEuropeMap onPinClick={(city) => router.push(`/admin/city/${encodeURIComponent(city)}`)} />
          </div>
        </div>
        {/* Upcoming / Overdue / Most Profitable Cities in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-stretch">
          <MetricCard title="Upcoming Payments within the Next 30 days" value={metrics?.totals?.upcomingReceivables ?? 0} prefix="€" loading={loading} />
          <MetricCard title="Overdue" value={metrics?.totals?.overdueReceivables ?? 0} prefix="€" loading={loading} />
          {/* Most Profitable Cities */}
          <div className="relative rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text mb-3">Most Profitable Cities</div>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-white/40 text-sm">Loading…</div>
            ) : topCities.length === 0 ? (
              <div className="text-white/60 text-sm">No sales yet.</div>
            ) : (
              <div className="space-y-2">
                {topCities.map((c)=> (
                  <div key={c.city} className="flex items-center justify-between">
                    <span className="text-white/90 text-base md:text-lg">{c.city}</span>
                    <span className="text-emerald-400 font-semibold text-lg md:text-xl">€{Number(c.total).toLocaleString('de-DE')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <MetricCard title={`${currentMonthLabel} Commissions`} value={metrics?.totals?.monthlyCommission ?? 0} prefix="€" loading={loading} />
          <MetricCard title="Annual Commission" value={metrics?.totals?.annualCommission ?? 0} prefix="€" loading={loading} />
          <MetricCard title="Conversion Rate" value={metrics?.totals?.conversionRate ?? 0} suffix="%" loading={loading} />
          {/* Deposits Held */}
          <div className="relative rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text mb-1">Deposits Held</div>
            <div className="text-3xl font-extrabold text-emerald-400">
              €{(typeof window !== 'undefined' ? ((window as any).__depositsHeld||0) : 0).toLocaleString('de-DE')}
            </div>
            <div className="text-white/60 text-sm mt-1">Sum of active deposits (excludes refunded)</div>
          </div>
        </div>

        {/* (Removed separate Most Profitable Cities grid; now included above beside Overdue) */}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <BarChart title="Revenue by Month" labels={monthLabels} series={revenueSeries} color="#f59e0b" loading={loading} prefix="€" />
          <BarChart title="Bookings by Month" labels={monthLabels} series={bookingsSeries} color="#22c55e" loading={loading} />
          <BarChart title="Commission by Month" labels={monthLabels} series={commissionSeries} color="#3b82f6" loading={loading} prefix="€" />
          <BarChart title="Growth by Month" labels={monthLabels} series={growthSeries} color="#eab308" loading={loading} />
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
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mvp_checklist') : null
      const versionKey = 'mvp_checklist_version'
      const currentVersion = '2025-09-14-weekplan-v2'
      const savedVersion = typeof window !== 'undefined' ? localStorage.getItem(versionKey) : null
      // Seed from new 4-week MVP guide
      const seed = [
        // Week 1 — Database foundation and migration
        { id: 'w1-db-prisma', label: 'PostgreSQL + Prisma (Docker, client, .env, scripts)', done: false },
        { id: 'w1-conn-pool', label: 'Connection pooling ready (pgBouncer later)', done: false },
        { id: 'w1-data-model', label: 'Data model: users, properties, images, calendars, bookings, payments, admin_overrides, amenities, cities', done: false },
        { id: 'w1-seed-import', label: 'Seed from JSON (properties, images, calendars, users)', done: false },
        { id: 'w1-backfill', label: 'Backfill slugs, normalized currencies, VAT country mapping', done: false },
        { id: 'w1-api-refactor', label: 'API read/write routes use DB (compatibility types)', done: false },
        { id: 'w1-dev-dx', label: 'One-command boot (Docker + migrate + seed) + docs', done: false },

        // Week 2 — Payments, pricing, reservation holds
        { id: 'w2-stripe', label: 'Stripe PaymentIntents + webhooks + metadata', done: false },
        { id: 'w2-coinbase', label: 'Coinbase Commerce charges + webhooks', done: false },
        { id: 'w2-escrow', label: 'Escrow flow: hold TTL, approve/capture, decline/auto-refund', done: false },
        { id: 'w2-pricing', label: 'Pricing/fees engine (nightly/monthly, pro‑ration, deposit/move-in, VAT)', done: false },
        { id: 'w2-source-of-truth', label: 'Single source of truth for pricing across app', done: false },
        { id: 'w2-concurrency', label: 'Availability concurrency (SELECT FOR UPDATE, expiresAt, idempotent webhooks)', done: false },

        // Week 3 — KYC, owners, storage, comms
        { id: 'w3-kyc', label: 'KYC/ID (Stripe Identity/Persona) + store status', done: false },
        { id: 'w3-owners', label: 'Owner intake form + minimal owner dashboard', done: false },
        { id: 'w3-storage', label: 'S3 storage with signed PUT/GET; migrate uploads', done: false },
        { id: 'w3-emails', label: 'Emails with Postmark/SES: templates for key events', done: false },

        // Week 4 — Hardening, tests, deploy
        { id: 'w4-observability', label: 'Observability/security: Sentry, PostHog, rate limits, cache headers, RBAC', done: false },
        { id: 'w4-tests', label: 'Testing: API (pricing/holds), webhook signatures, Playwright E2E', done: false },
        { id: 'w4-compliance', label: 'Compliance + SEO: Cookie Settings, sitemap/robots, legal, backups schedule', done: false },
        { id: 'w4-deploy', label: 'Staging/production: Vercel + managed Postgres, webhooks, launch checklist', done: false },
      ]
      const shouldReplace = !raw || savedVersion !== currentVersion
      if (shouldReplace) {
        setItems(seed)
        if (typeof window !== 'undefined') {
          localStorage.setItem('mvp_checklist', JSON.stringify(seed))
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
    try { if (typeof window !== 'undefined') localStorage.setItem('mvp_checklist', JSON.stringify(next)) } catch {}
  }
  return (
    <div className="rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)] flex-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded(v => !v)
        }}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text">MVP Progress</div>
            <div className="text-white/80 text-sm">{completed} of {total} tasks completed</div>
          </div>
          <svg className={`w-5 h-5 text-white/70 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden mt-3">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%`, transition: 'width 600ms cubic-bezier(.2,.8,.2,1)' }} />
        </div>
        <div className="text-emerald-400 font-bold mt-2">{pct}% to MVP</div>
      </button>
      {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map(i => (
            <label key={i.id} className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={!!i.done} onChange={()=>toggle(i.id)} className="accent-emerald-500" />
              <span className={i.done ? 'line-through text-white/50' : ''}>{i.label}</span>
            </label>
          ))}
        </div>
      )}
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


