'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SalesAnalyticsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<any>(null)
  const [crmData, setCrmData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProjectionMonth, setSelectedProjectionMonth] = useState<number>(new Date().getMonth() + 1)

  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long' })
  
  useEffect(() => {
    async function loadData() {
      try {
        // Load analytics, CRM, and bookings data for projections
        const [analyticsRes, crmRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/analytics', { cache: 'no-store' }),
          fetch('/api/admin/crm', { cache: 'no-store' }),
          fetch('/api/admin/bookings', { cache: 'no-store' })
        ])
        
        const analyticsData = await analyticsRes.json()
        const crmData = await crmRes.json()
        const bookingsData = await bookingsRes.json()
        
        setMetrics(analyticsData)
        setCrmData({ ...crmData, bookings: bookingsData.bookings || [] })
        
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate chart data from CRM bookings and payments
  const chartData = React.useMemo(() => {
    if (!crmData?.rows) return {
      revenueSeries: Array(12).fill(0),
      bookingsSeries: Array(12).fill(0),
      commissionSeries: Array(12).fill(0),
      projectedSeries: Array(12).fill(0)
    }

    const currentYear = new Date().getFullYear()
    const revenueSeries = Array(12).fill(0)
    const bookingsSeries = Array(12).fill(0)
    const commissionSeries = Array(12).fill(0)
    const projectedSeries = Array(12).fill(0)

    // Process each booking
    crmData.rows.forEach((booking: any) => {
      const checkInDate = new Date(booking.checkIn)
      
      if (checkInDate.getFullYear() === currentYear) {
        const bookingMonth = checkInDate.getMonth()
        
        // Count bookings by check-in month
        bookingsSeries[bookingMonth] += 1
      }
    })

    // Process confirmed bookings for payment-based revenue
    if (crmData.bookings) {
      crmData.bookings
        .filter((booking: any) => booking.status === 'confirmed')
        .forEach((booking: any) => {
          if (booking.payments && Array.isArray(booking.payments)) {
            booking.payments
              .filter((payment: any) => payment.status === 'received' && payment.receivedAt)
              .forEach((payment: any) => {
                const receivedDate = new Date(payment.receivedAt)
                if (receivedDate.getFullYear() === currentYear) {
                  const month = receivedDate.getMonth()
                  const amount = Number(payment.amountCents || 0) / 100
                  
                  // Add to revenue for the month payment was received
                  revenueSeries[month] += amount
                  
                  // Commission is 20% of the revenue for that month
                  commissionSeries[month] += Math.round(amount * 0.20)
                }
              })
          }
        })
    }

    // Calculate projected revenue from scheduled payments (confirmed bookings only)
    if (crmData.bookings) {
      crmData.bookings
        .filter((booking: any) => booking.status === 'confirmed')
        .forEach((booking: any) => {
          if (booking.payments && Array.isArray(booking.payments)) {
            booking.payments
              .filter((payment: any) => payment.status === 'scheduled' && payment.dueAt)
              .forEach((payment: any) => {
                const dueDate = new Date(payment.dueAt)
                if (dueDate.getFullYear() === currentYear) {
                  const month = dueDate.getMonth()
                  const amount = Number(payment.amountCents || 0) / 100
                  projectedSeries[month] += amount
                }
              })
          }
        })
    }

    return {
      revenueSeries,
      bookingsSeries, 
      commissionSeries,
      projectedSeries
    }
  }, [crmData])

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const { revenueSeries, bookingsSeries, commissionSeries, projectedSeries } = chartData
  const growthSeries = revenueSeries.map((current, idx) => {
    const previous = idx > 0 ? revenueSeries[idx - 1] : 0
    return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0
  })
  
  // Calculate projected revenue for selected month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Ensure selected month is valid (wrap to next year if needed)
  const adjustedMonth = selectedProjectionMonth > 11 ? selectedProjectionMonth - 12 : selectedProjectionMonth
  const projectedYear = selectedProjectionMonth > 11 ? currentYear + 1 : currentYear
  const selectedMonthRevenue = projectedSeries[adjustedMonth] || 0
  const selectedMonthName = new Date(projectedYear, adjustedMonth, 1).toLocaleString('default', { month: 'long' })
  
  const nextMonth = () => {
    setSelectedProjectionMonth(prev => prev >= 11 ? 0 : prev + 1)
  }
  
  const prevMonth = () => {
    setSelectedProjectionMonth(prev => prev <= 0 ? 11 : prev - 1)
  }

  // Calculate upcoming payments within next 30 days
  const upcomingPayments = React.useMemo(() => {
    if (!crmData?.bookings) return 0
    
    const now = new Date()
    const next30Days = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    let total = 0
    
    crmData.bookings
      .filter((booking: any) => booking.status === 'confirmed')
      .forEach((booking: any) => {
        if (booking.payments && Array.isArray(booking.payments)) {
          booking.payments
            .filter((payment: any) => payment.status === 'scheduled' && payment.dueAt)
            .forEach((payment: any) => {
              const dueDate = new Date(payment.dueAt)
              if (dueDate >= now && dueDate <= next30Days) {
                total += Number(payment.amountCents || 0) / 100
              }
            })
        }
      })
    
    return total
  }, [crmData])

  // Calculate top cities based on actual payments marked as paid
  const topCities = React.useMemo(() => {
    if (!crmData?.bookings) return []
    
    const cityRevenue: Record<string, number> = {}
    const currentYear = new Date().getFullYear()
    
    crmData.bookings
      .filter((booking: any) => booking.status === 'confirmed')
      .forEach((booking: any) => {
        if (booking.payments && Array.isArray(booking.payments)) {
          booking.payments
            .filter((payment: any) => payment.status === 'received' && payment.receivedAt)
            .forEach((payment: any) => {
              const receivedDate = new Date(payment.receivedAt)
              if (receivedDate.getFullYear() === currentYear) {
                const city = booking.city || 'Unknown'
                const amount = Number(payment.amountCents || 0) / 100
                cityRevenue[city] = (cityRevenue[city] || 0) + amount
              }
            })
        }
      })
    
    return Object.entries(cityRevenue)
      .map(([city, total]) => ({ city, total }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }, [crmData])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="pt-28 pb-20">
        <div className="max-w-[1800px] mx-auto px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sales Analytics</h1>
              <p className="text-white/70">Revenue targets, metrics, and performance tracking.</p>
            </div>
            <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
          </div>

          {/* Targets Row: Monthly / Quarterly / Annual */}
          <TargetsRow metrics={metrics} loading={loading} />

          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 items-stretch">
            <MetricCard title={`${currentMonthLabel} Revenue`} value={metrics?.totals?.monthlyRevenue ?? 0} prefix="€" loading={loading} trend bgGifSrc="/images/pepe.gif" gifHeight={180} className="min-h-[280px]" />
            <MetricCard title="Annual Revenue" value={metrics?.totals?.annualRevenue ?? 0} prefix="€" loading={loading} trend className="min-h-[280px]" />
            <div className="relative rounded-2xl p-6 border border-purple-400/30 bg-gradient-to-br from-[#1a0b1a] to-[#120d12] shadow-[0_0_20px_rgba(139,92,246,0.25)] overflow-hidden min-h-[280px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.1),transparent_40%)]" style={{ zIndex: 0 }} />
              <div className="relative z-10">
                <div className="font-mono uppercase tracking-wider text-sm md:text-base text-purple-400 mb-2">Projected Revenue</div>
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    ←
                  </button>
                  <div className="text-lg font-semibold text-white">{selectedMonthName} {projectedYear}</div>
                  <button 
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    →
                  </button>
                </div>
                {loading ? (
                  <div className="h-12 flex items-center text-white/40">Loading…</div>
                ) : (
                  <div className="text-3xl md:text-4xl font-extrabold text-white">
                    €{selectedMonthRevenue.toLocaleString('de-DE')}
                  </div>
                )}
                <div className="text-purple-400 text-sm mt-2">From scheduled payments</div>
              </div>
            </div>
          </div>

          {/* Upcoming / Overdue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 items-stretch">
            <MetricCard title="Upcoming Payments within the Next 30 days" value={upcomingPayments} prefix="€" loading={loading} />
            <MetricCard title="Overdue" value={metrics?.totals?.overdueReceivables ?? 0} prefix="€" loading={loading} />
          </div>

          {/* Commission and Deposits */}
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <BarChart title="Revenue by Month" labels={monthLabels} series={revenueSeries} color="#f59e0b" loading={loading} prefix="€" />
            <BarChart title="Projected Revenue by Month" labels={monthLabels} series={projectedSeries} color="#8b5cf6" loading={loading} prefix="€" />
            <BarChart title="Bookings by Month" labels={monthLabels} series={bookingsSeries} color="#22c55e" loading={loading} />
            <BarChart title="Commission by Month" labels={monthLabels} series={commissionSeries} color="#3b82f6" loading={loading} prefix="€" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

// Exact copy of TargetsRow component from admin
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
          title="Annual Sales Target"
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

// Exact copy of TargetCard component from admin
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
      <div className={`text-sm font-semibold mt-2 ${onPace ? 'text-emerald-400' : 'text-orange-400'}`}>
        {onPace ? 'On pace' : 'Behind pace'}
      </div>
      <div className="text-white text-lg font-bold">€{Number(achieved).toLocaleString('de-DE')} / €{Number(value).toLocaleString('de-DE')}</div>
      {hint && <div className="text-white/60 text-xs mt-2">{hint}</div>}
      {extraNote && <div className="text-white/60 text-xs mt-1">{extraNote}</div>}
      {children}
    </div>
  )
}

// Exact copy of MetricCard component from admin
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
        {trend && !loading && (
          <div className="text-emerald-400 text-sm mt-2">↗ Trending up</div>
        )}
      </div>
    </div>
  )
}

// Exact copy of BarChart component from admin
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
                  <div key={label} className="relative flex flex-col items-center">
                    <div
                      className="w-full rounded-t transition-all ease-out"
                      style={{
                        height: `${height}px`,
                        backgroundColor: color,
                        transitionDelay: `${delay}ms`,
                        transitionDuration: '800ms',
                        opacity: hoverIdx === i ? 0.9 : 0.7
                      }}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                  </div>
                )
              })}
            </div>
            {/* Right axis */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-white/50 py-1">
              <span>{prefix}{maxVal.toLocaleString('de-DE')}</span>
              <span>{prefix}{Math.round(maxVal * 0.5).toLocaleString('de-DE')}</span>
              <span>0</span>
            </div>
          </div>
          {/* Bottom labels */}
          <div className="grid grid-cols-12 gap-2 mt-3 pr-10">
            {labels.map((label, i) => (
              <div key={label} className="text-center text-xs text-white/60 transform -rotate-45 origin-center">
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
