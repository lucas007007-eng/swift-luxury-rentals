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
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long' })
  
  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Revenue & Core Metrics' },
    { id: 'property', label: 'Property KPIs', icon: '🏠', description: 'Occupancy & Performance' },
    { id: 'financial', label: 'Financial', icon: '💰', description: 'NOI & Expense Analysis' },
    { id: 'sales', label: 'Sales Funnel', icon: '📈', description: 'Conversion & Marketing' },
    { id: 'luxury', label: 'VIP & Luxury', icon: '👑', description: 'Premium Segments' }
  ]
  
  useEffect(() => {
    async function loadData() {
      try {
        // Load analytics, CRM, and bookings data for projections
        const timestamp = Date.now()
        const [analyticsRes, crmRes, bookingsRes] = await Promise.all([
          fetch(`/api/admin/analytics?_t=${timestamp}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }),
          fetch(`/api/admin/crm?_t=${timestamp}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }),
          fetch(`/api/admin/bookings?_t=${timestamp}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } })
        ])
        
        const analyticsData = await analyticsRes.json()
        const crmData = await crmRes.json()
        const bookingsData = await bookingsRes.json()
        
        setMetrics(analyticsData)
        setCrmData({ ...crmData, bookings: bookingsData.bookings || [] })
        
        console.log('📊 Sales Analytics Data Loaded:')
        console.log('- Analytics data:', analyticsData)
        console.log('- CRM data:', crmData)
        console.log('- Bookings data:', bookingsData.bookings?.length || 0, 'bookings')
        
        // Debug projected revenue calculation
        if (bookingsData.bookings) {
          const confirmedBookings = bookingsData.bookings.filter((b: any) => b.status === 'confirmed')
          const scheduledPayments = confirmedBookings.flatMap((b: any) => 
            (b.payments || []).filter((p: any) => p.status === 'scheduled' && p.dueAt)
          )
          console.log('- Confirmed bookings:', confirmedBookings.length)
          console.log('- Scheduled payments for projection:', scheduledPayments.length)
          scheduledPayments.forEach((p: any) => {
            console.log(`  Payment: €${(p.amountCents || 0) / 100} due ${new Date(p.dueAt).toLocaleDateString()}`)
          })
        }
        
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    
    // Smart auto-refresh: check for updates every 5 seconds, only refresh if data changed
    let lastKnownUpdate = 0
    const interval = setInterval(async () => {
      if (typeof window !== 'undefined' && !document.hidden) {
        try {
          // Check if sales analytics data has been updated
          const updateRes = await fetch('/api/admin/finance/last-update', { cache: 'no-store' })
          const updateData = await updateRes.json()
          const serverLastUpdate = updateData.lastUpdate || 0
          
          if (serverLastUpdate > lastKnownUpdate) {
            console.log('🔄 Sales data updated on server, refreshing analytics...')
            lastKnownUpdate = serverLastUpdate
            loadData()
          }
        } catch (e) {
          console.error('Failed to check for sales analytics updates:', e)
        }
      }
    }, 5000) // Check every 5 seconds for balanced performance
    
    return () => clearInterval(interval)
  }, [])

  // Calculate chart data and metrics from booking data
  const chartData = React.useMemo(() => {
    if (!crmData?.bookings) return {
      revenueSeries: Array(12).fill(0),
      bookingsSeries: Array(12).fill(0),
      commissionSeries: Array(12).fill(0),
      projectedSeries: Array(12).fill(0),
      depositsHeld: 0,
      monthlyRevenue: 0,
      annualRevenue: 0
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const revenueSeries = Array(12).fill(0)
    const bookingsSeries = Array(12).fill(0)
    const commissionSeries = Array(12).fill(0)
    const projectedSeries = Array(12).fill(0)
    
    // Calculate real-time metrics from booking data
    let depositsHeld = 0
    let monthlyRevenue = 0
    let annualRevenue = 0

    // Process each booking
    crmData.rows.forEach((booking: any) => {
      const checkInDate = new Date(booking.checkIn)
      
      if (checkInDate.getFullYear() === currentYear) {
        const bookingMonth = checkInDate.getMonth()
        
        // Count bookings by check-in month
        bookingsSeries[bookingMonth] += 1
      }
    })

    // Process confirmed bookings for payment-based revenue and deposits
    if (crmData.bookings) {
      crmData.bookings
        .filter((booking: any) => booking.status === 'confirmed')
        .forEach((booking: any) => {
          if (booking.payments && Array.isArray(booking.payments)) {
            booking.payments.forEach((payment: any) => {
              const amount = Number(payment.amountCents || 0) / 100
              
              // Calculate deposits held (deposit payments that are received but not refunded)
              if (payment.purpose === 'deposit' && payment.status === 'received') {
                depositsHeld += amount
              }
              
              // Calculate revenue from received payments
              if (payment.status === 'received' && payment.receivedAt) {
                const receivedDate = new Date(payment.receivedAt)
                
                // Add to annual revenue
                annualRevenue += amount
                
                // Add to monthly revenue if it's current month
                if (receivedDate.getMonth() === currentMonth && receivedDate.getFullYear() === currentYear) {
                  monthlyRevenue += amount
                }
                
                // Add to revenue series by month
                if (receivedDate.getFullYear() === currentYear) {
                  const month = receivedDate.getMonth()
                  revenueSeries[month] += amount
                  
                  // Commission is 20% of the revenue for that month
                  commissionSeries[month] += Math.round(amount * 0.20)
                }
              }
            })
          }
        })
    }

    // Calculate projected revenue from scheduled payments (confirmed bookings only)
    // Include current year and next year for comprehensive projections
    if (crmData.bookings) {
      crmData.bookings
        .filter((booking: any) => booking.status === 'confirmed')
        .forEach((booking: any) => {
          if (booking.payments && Array.isArray(booking.payments)) {
            booking.payments
              .filter((payment: any) => payment.status === 'scheduled' && payment.dueAt)
              .forEach((payment: any) => {
                const dueDate = new Date(payment.dueAt)
                const paymentYear = dueDate.getFullYear()
                const amount = Number(payment.amountCents || 0) / 100
                
                // Include payments from current year and next year
                if (paymentYear === currentYear) {
                  const month = dueDate.getMonth()
                  projectedSeries[month] += amount
                } else if (paymentYear === currentYear + 1) {
                  // For next year payments, add to December (or create a separate next year tracking)
                  // For now, let's show them in the current year's December as "Next Year Revenue"
                  const month = dueDate.getMonth()
                  if (month < 12) {
                    projectedSeries[month] += amount
                  }
                }
                
                console.log(`📅 Scheduled payment: €${amount} due ${dueDate.toLocaleDateString()} (Year: ${paymentYear})`)
              })
          }
        })
    }

    return {
      revenueSeries,
      bookingsSeries, 
      commissionSeries,
      projectedSeries,
      depositsHeld,
      monthlyRevenue,
      annualRevenue
    }
  }, [crmData])

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const { revenueSeries, bookingsSeries, commissionSeries, projectedSeries, depositsHeld, monthlyRevenue, annualRevenue } = chartData
  const growthSeries = revenueSeries.map((current, idx) => {
    const previous = idx > 0 ? revenueSeries[idx - 1] : 0
    return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0
  })
  
  // Calculate projected revenue for selected month (including multi-year)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Calculate projected revenue for any future month (including next year)
  const calculateProjectedRevenueForMonth = (targetMonth: number, targetYear: number) => {
    if (!crmData?.bookings) return 0
    
    let monthRevenue = 0
    crmData.bookings
      .filter((booking: any) => booking.status === 'confirmed')
      .forEach((booking: any) => {
        if (booking.payments && Array.isArray(booking.payments)) {
          booking.payments
            .filter((payment: any) => payment.status === 'scheduled' && payment.dueAt)
            .forEach((payment: any) => {
              const dueDate = new Date(payment.dueAt)
              if (dueDate.getFullYear() === targetYear && dueDate.getMonth() === targetMonth) {
                const amount = Number(payment.amountCents || 0) / 100
                monthRevenue += amount
              }
            })
        }
      })
    
    return monthRevenue
  }
  
  // Calculate year and month for multi-year navigation
  const yearsAhead = Math.floor(selectedProjectionMonth / 12)
  const adjustedMonth = selectedProjectionMonth % 12
  const projectedYear = currentYear + yearsAhead
  const selectedMonthRevenue = calculateProjectedRevenueForMonth(adjustedMonth, projectedYear)
  const selectedMonthName = new Date(projectedYear, adjustedMonth, 1).toLocaleString('default', { month: 'long' })
  
  const nextMonth = () => {
    setSelectedProjectionMonth(prev => prev + 1) // Allow unlimited forward navigation
  }
  
  const prevMonth = () => {
    const currentMonth = new Date().getMonth()
    setSelectedProjectionMonth(prev => Math.max(currentMonth, prev - 1)) // Don't go before current month
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
      
      <div className="flex pt-20">
        {/* Luxury Spy-Tech Sidebar Navigation */}
        <div className={`fixed lg:relative z-50 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="w-80 h-full luxury-feature-card border-r-2 border-zinc-600/50 p-6 overflow-y-auto">
            {/* Sidebar Header */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2 heading-sora">Analytics Command</h2>
              <p className="text-zinc-300 text-sm">Elite Property Intelligence</p>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === tab.id 
                      ? 'bg-[linear-gradient(145deg,#1a1a1a_0%,#2a2a2a_50%,#1a1a1a_100%)] border border-zinc-400/40 shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]' 
                      : 'bg-zinc-900/20 border border-zinc-700/30 hover:border-zinc-600/50 hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tab.icon}</span>
                    <div>
                      <div className={`font-semibold font-sora ${activeTab === tab.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs ${activeTab === tab.id ? 'text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
            
            {/* Back to Admin Link */}
            <div className="mt-8 pt-6 border-t border-zinc-700/50">
              <Link 
                href="/admin" 
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-24 left-4 z-60 px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-600/50 text-white"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0 p-6">
          <div className="max-w-[1400px] mx-auto">
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 heading-sora">
                {tabs.find(t => t.id === activeTab)?.label || 'Sales Analytics'}
              </h1>
              <p className="text-zinc-300">
                {tabs.find(t => t.id === activeTab)?.description || 'Revenue targets, metrics, and performance tracking.'}
              </p>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Targets Row: Monthly / Quarterly / Annual */}
                <TargetsRow metrics={metrics} loading={loading} />

                {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 items-stretch">
            <MetricCard title={`${currentMonthLabel} Revenue`} value={monthlyRevenue} prefix="€" loading={loading} trend className="min-h-[280px]" />
            <MetricCard title="Annual Revenue" value={annualRevenue} prefix="€" loading={loading} trend className="min-h-[280px]" />
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
                {!loading && (
                  <div className="text-purple-300 text-xs mt-1">
                    Debug: {selectedMonthName} {projectedYear} - €{selectedMonthRevenue} 
                    (Total scheduled: €{projectedSeries.reduce((sum, val) => sum + val, 0).toLocaleString()})
                  </div>
                )}
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
            {/* Deposits Held - Ultra-Premium Style */}
            <div className="relative rounded-2xl p-6 overflow-hidden group" 
                 style={{
                   background: `
                     linear-gradient(145deg, rgba(5,5,5,0.98) 0%, rgba(20,20,20,0.99) 30%, rgba(15,15,15,0.98) 70%, rgba(8,8,8,0.97) 100%),
                     radial-gradient(circle at 30% 20%, rgba(16,185,129,0.08) 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, rgba(192,192,192,0.05) 0%, transparent 40%)
                   `,
                   border: '1px solid rgba(192,192,192,0.4)',
                   backdropFilter: 'blur(25px) saturate(200%) contrast(120%)',
                   boxShadow: `
                     0 30px 80px rgba(0,0,0,0.95),
                     0 15px 40px rgba(0,0,0,0.8),
                     inset 0 2px 0 rgba(255,255,255,0.2),
                     inset 0 -1px 0 rgba(255,255,255,0.1),
                     inset 1px 0 0 rgba(255,255,255,0.1),
                     inset -1px 0 0 rgba(255,255,255,0.1),
                     0 0 60px rgba(16,185,129,0.12)
                   `,
                   transform: 'perspective(1000px) rotateX(2deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              
              {/* Holographic grid overlay */}
              <div className="absolute inset-0 opacity-10 z-0" 
                   style={{
                     backgroundImage: `
                       linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px),
                       linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px)
                     `,
                     backgroundSize: '20px 20px',
                     animation: 'grid-pulse 4s ease-in-out infinite alternate'
                   }} />
              
              {/* Corner accent lights */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400/60 opacity-80" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400/60 opacity-80" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400/60 opacity-80" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400/60 opacity-80" />
              
              <div className="relative z-10">
                <div className="font-mono uppercase tracking-wider text-base md:text-lg text-zinc-300 mb-2 font-sora">Deposits Held</div>
                <div className="text-3xl font-extrabold text-emerald-400"
                     style={{
                       textShadow: '0 0 10px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.2)',
                       animation: 'spy-metric-glow 2s ease-in-out infinite alternate'
                     }}>
                  €{depositsHeld.toLocaleString('de-DE')}
                </div>
                <div className="text-zinc-300 text-sm mt-1">Sum of active deposits (excludes refunded)</div>
              </div>
              
              {/* Enhanced 3D hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/8 opacity-0 group-hover:opacity-100 transition-all duration-500"
                   style={{
                     boxShadow: 'inset 0 0 60px rgba(16,185,129,0.15), 0 0 80px rgba(16,185,129,0.2)'
                   }} />
              
              {/* 3D hover transform */}
              <style jsx>{`
                .group:hover {
                  transform: perspective(1000px) rotateX(1deg) translateY(-4px) scale(1.02) !important;
                  box-shadow: 
                    0 40px 100px rgba(0,0,0,0.98),
                    0 20px 60px rgba(0,0,0,0.85),
                    inset 0 3px 0 rgba(255,255,255,0.25),
                    inset 0 -2px 0 rgba(255,255,255,0.15),
                    inset 2px 0 0 rgba(255,255,255,0.12),
                    inset -2px 0 0 rgba(255,255,255,0.12),
                    0 0 80px rgba(16,185,129,0.18) !important;
                }
              `}</style>
            </div>
          </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <BarChart title="Revenue by Month" labels={monthLabels} series={revenueSeries} color="#f59e0b" loading={loading} prefix="€" />
                  <BarChart title="Projected Revenue by Month" labels={monthLabels} series={projectedSeries} color="#8b5cf6" loading={loading} prefix="€" />
                  <BarChart title="Bookings by Month" labels={monthLabels} series={bookingsSeries} color="#22c55e" loading={loading} />
                  <BarChart title="Commission by Month" labels={monthLabels} series={commissionSeries} color="#3b82f6" loading={loading} prefix="€" />
                </div>
              </>
            )}
            
            {/* Other tab content sections - placeholder for now */}
            {activeTab === 'property' && (
              <>
                {/* Property Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <MetricCard 
                    title="Occupancy Rate" 
                    value={95.2} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Portfolio Utilization" 
                    value={92} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Avg Lease Duration" 
                    value={8.5} 
                    suffix=" months" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Days to Lease" 
                    value={12} 
                    suffix=" days" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                </div>

                {/* Property Performance Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Occupancy Breakdown */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Occupancy Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Berlin Properties</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{width: '96%'}}></div>
                          </div>
                          <span className="text-white font-semibold">96%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Paris Properties</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{width: '94%'}}></div>
                          </div>
                          <span className="text-white font-semibold">94%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Amsterdam Properties</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{width: '88%'}}></div>
                          </div>
                          <span className="text-white font-semibold">88%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lease Performance */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Lease Performance</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">4.2%</div>
                        <div className="text-zinc-300 text-sm">Turnover Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">97%</div>
                        <div className="text-zinc-300 text-sm">Renewal Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">15</div>
                        <div className="text-zinc-300 text-sm">Avg Days Vacant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">18</div>
                        <div className="text-zinc-300 text-sm">Properties</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <BarChart 
                    title="Occupancy by City" 
                    labels={['Berlin', 'Paris', 'Amsterdam', 'Vienna', 'Barcelona']} 
                    series={[96, 94, 88, 91, 89]} 
                    color="#10b981" 
                    loading={loading} 
                  />
                  <BarChart 
                    title="Average Lease Duration by Month" 
                    labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} 
                    series={[8.2, 8.8, 9.1, 8.5, 8.7, 8.9, 8.4, 8.6, 8.5]} 
                    color="#3b82f6" 
                    loading={loading} 
                  />
                </div>
              </>
            )}
            
            {activeTab === 'financial' && (
              <>
                {/* Financial Intelligence Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <MetricCard 
                    title="Net Operating Income" 
                    value={24500} 
                    prefix="€" 
                    suffix="/mo" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Operating Expense Ratio" 
                    value={18} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Average Revenue Per Unit" 
                    value={3200} 
                    prefix="€" 
                    suffix="/mo" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Tenant Acquisition Cost" 
                    value={340} 
                    prefix="€" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                </div>

                {/* Financial Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Revenue vs Expenses */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Revenue vs Expenses</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Gross Revenue</span>
                        <span className="text-emerald-400 font-semibold">€29,800/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Operating Expenses</span>
                        <span className="text-orange-400 font-semibold">€5,300/mo</span>
                      </div>
                      <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                        <span className="text-white font-semibold">Net Operating Income</span>
                        <span className="text-emerald-400 font-bold text-lg">€24,500/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Cost Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Maintenance & Repairs</span>
                        <span className="text-white">€1,200/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Marketing & Advertising</span>
                        <span className="text-white">€800/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Property Management</span>
                        <span className="text-white">€2,100/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Insurance & Legal</span>
                        <span className="text-white">€1,200/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'sales' && (
              <>
                {/* Sales Funnel Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <MetricCard 
                    title="Lead-to-Lease Rate" 
                    value={32} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Website Conversion" 
                    value={4.2} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Avg Response Time" 
                    value={2.1} 
                    suffix=" hours" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Active Leads" 
                    value={127} 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                </div>

                {/* Sales Funnel Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Conversion Funnel */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Conversion Funnel</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Website Visitors</span>
                        <span className="text-white font-semibold">12,450</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Property Inquiries</span>
                        <span className="text-blue-400 font-semibold">523 (4.2%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Viewing Requests</span>
                        <span className="text-amber-400 font-semibold">287 (54.9%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Applications</span>
                        <span className="text-purple-400 font-semibold">189 (65.9%)</span>
                      </div>
                      <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                        <span className="text-white font-semibold">Signed Leases</span>
                        <span className="text-emerald-400 font-bold text-lg">167 (32%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Lead Sources */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Lead Sources</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Direct Website</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-white font-semibold">45%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Google Ads</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width: '28%'}}></div>
                          </div>
                          <span className="text-white font-semibold">28%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Social Media</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{width: '15%'}}></div>
                          </div>
                          <span className="text-white font-semibold">15%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Referrals</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{width: '12%'}}></div>
                          </div>
                          <span className="text-white font-semibold">12%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <BarChart 
                    title="Leads by Month" 
                    labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} 
                    series={[89, 124, 156, 143, 178, 165, 134, 187, 127]} 
                    color="#3b82f6" 
                    loading={loading} 
                  />
                  <BarChart 
                    title="Conversion Rate by Month" 
                    labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} 
                    series={[28, 31, 35, 32, 38, 34, 29, 36, 32]} 
                    color="#8b5cf6" 
                    loading={loading} 
                  />
                </div>
              </>
            )}
            
            {activeTab === 'luxury' && (
              <>
                {/* VIP & Luxury Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <MetricCard 
                    title="VIP Client Revenue" 
                    value={78000} 
                    prefix="€" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Corporate Bookings" 
                    value={35} 
                    suffix="%" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Premium Properties" 
                    value={12} 
                    suffix="/18 total" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                  <MetricCard 
                    title="Crypto Payments" 
                    value={12000} 
                    prefix="€" 
                    loading={loading} 
                    className="min-h-[200px]" 
                  />
                </div>

                {/* VIP & Luxury Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* VIP Client Breakdown */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">VIP Client Segments</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Corporate Executives</span>
                        <span className="text-emerald-400 font-semibold">€45,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Diplomats & Embassy</span>
                        <span className="text-blue-400 font-semibold">€18,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Tech Entrepreneurs</span>
                        <span className="text-purple-400 font-semibold">€14,500</span>
                      </div>
                      <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                        <span className="text-white font-semibold">Total VIP Revenue</span>
                        <span className="text-emerald-400 font-bold text-lg">€78,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Features Usage */}
                  <div className="luxury-feature-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 heading-sora">Premium Services</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Concierge Services</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{width: '67%'}}></div>
                          </div>
                          <span className="text-white font-semibold">67%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Crypto Payment Option</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{width: '23%'}}></div>
                          </div>
                          <span className="text-white font-semibold">23%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Private Jet Transfers</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{width: '15%'}}></div>
                          </div>
                          <span className="text-white font-semibold">15%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Multi-City Packages</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width: '31%'}}></div>
                          </div>
                          <span className="text-white font-semibold">31%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luxury Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <BarChart 
                    title="VIP Revenue by Month" 
                    labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} 
                    series={[6800, 7200, 8900, 7500, 9100, 8600, 7800, 8400, 7800]} 
                    color="#fbbf24" 
                    loading={loading} 
                    prefix="€" 
                  />
                  <BarChart 
                    title="Corporate vs Individual Split" 
                    labels={['Corporate', 'High Net Worth', 'Diplomats', 'Tech Exec', 'Other VIP']} 
                    series={[35, 28, 18, 12, 7]} 
                    color="#8b5cf6" 
                    loading={loading} 
                  />
                </div>
              </>
            )}
            
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
    <div className="rounded-2xl p-4 md:p-6 mb-8 relative overflow-hidden"
         style={{
           background: `
             linear-gradient(145deg, rgba(5,5,5,0.96) 0%, rgba(18,18,18,0.98) 30%, rgba(12,12,12,0.97) 70%, rgba(6,6,6,0.95) 100%),
             radial-gradient(circle at 20% 30%, rgba(192,192,192,0.04) 0%, transparent 60%),
             radial-gradient(circle at 80% 70%, rgba(192,192,192,0.03) 0%, transparent 50%)
           `,
           border: '2px solid rgba(192,192,192,0.45)',
           backdropFilter: 'blur(30px) saturate(180%) contrast(130%)',
           boxShadow: `
             0 35px 90px rgba(0,0,0,0.98),
             0 20px 50px rgba(0,0,0,0.85),
             inset 0 3px 0 rgba(255,255,255,0.25),
             inset 0 -2px 0 rgba(255,255,255,0.15),
             inset 2px 0 0 rgba(255,255,255,0.12),
             inset -2px 0 0 rgba(255,255,255,0.12),
             0 0 80px rgba(192,192,192,0.15)
           `,
           transform: 'perspective(1200px) rotateX(1deg)',
           transformStyle: 'preserve-3d'
         }}>
      
      {/* Spy-tech corner accent lights */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-zinc-300/70 opacity-90" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-zinc-300/70 opacity-90" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-zinc-300/70 opacity-90" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-zinc-300/70 opacity-90" />
      
      <div className="relative z-10">
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
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
              onClick={()=>{ setAnnualDraft(annualTarget); setAnnualTargetEditing(true) }}
            >
              Change Target
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <input 
                type="number" 
                className="w-32 bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-emerald-400/50 focus:outline-none transition-all" 
                value={annualDraft} 
                onChange={(e)=>setAnnualDraft(Number(e.target.value||0))} 
              />
              <button
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
                onClick={()=>{ setAnnualTarget(annualDraft); setAnnualTargetEditing(false) }}
              >
                Confirm
              </button>
            </div>
          )}
        </TargetCard>
        </div>
      </div>
    </div>
  )
}

// Ultra-Premium Spy-Tech TargetCard
function TargetCard({ title, value, achieved, paceFrac, extraNote, hint, children }: { title: string; value: number; achieved: number; paceFrac: number; extraNote?: string; hint?: string; children?: React.ReactNode }) {
  const progress = Math.min(1, value > 0 ? achieved / value : 0)
  const onPace = achieved >= value * paceFrac
  return (
    <div className="relative rounded-2xl p-6 overflow-hidden group" 
         style={{
           background: `
             linear-gradient(155deg, rgba(5,5,5,0.98) 0%, rgba(20,20,20,0.99) 30%, rgba(15,15,15,0.98) 70%, rgba(8,8,8,0.97) 100%),
             radial-gradient(circle at 35% 15%, rgba(16,185,129,0.08) 0%, transparent 45%),
             radial-gradient(circle at 65% 85%, rgba(192,192,192,0.05) 0%, transparent 40%)
           `,
           border: '1px solid rgba(192,192,192,0.4)',
           backdropFilter: 'blur(25px) saturate(200%) contrast(120%)',
           boxShadow: `
             0 30px 80px rgba(0,0,0,0.95),
             0 15px 40px rgba(0,0,0,0.8),
             inset 0 2px 0 rgba(255,255,255,0.2),
             inset 0 -1px 0 rgba(255,255,255,0.1),
             inset 1px 0 0 rgba(255,255,255,0.1),
             inset -1px 0 0 rgba(255,255,255,0.1),
             0 0 60px ${onPace ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)'}
           `,
           transform: 'perspective(1000px) rotateX(2deg)',
           transformStyle: 'preserve-3d'
         }}>
      
      {/* Corner accent lights - color based on pace */}
      <div className={`absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 opacity-80 ${onPace ? 'border-emerald-400/70' : 'border-orange-400/70'}`} />
      <div className={`absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 opacity-80 ${onPace ? 'border-emerald-400/70' : 'border-orange-400/70'}`} />
      <div className={`absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 opacity-80 ${onPace ? 'border-emerald-400/70' : 'border-orange-400/70'}`} />
      <div className={`absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 opacity-80 ${onPace ? 'border-emerald-400/70' : 'border-orange-400/70'}`} />
      
      <div className="relative z-10">
        <div className="font-mono uppercase tracking-wider text-lg text-white mb-3 font-sora">{title}</div>
        <div className="text-zinc-400 text-sm mb-3">Target: €{Number(value).toLocaleString('de-DE')}</div>
        
        {/* Premium progress bar with 3D effects */}
        <div className="h-4 rounded-full bg-black/40 border border-zinc-700/50 overflow-hidden mb-3"
             style={{
               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.1)'
             }}>
          <div className="h-full transition-all duration-1000 ease-out" 
               style={{ 
                 width: `${progress*100}%`,
                 background: onPace 
                   ? 'linear-gradient(90deg, #10b981 0%, #22c55e 50%, #10b981 100%)' 
                   : 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, #f59e0b 100%)',
                 boxShadow: onPace 
                   ? '0 0 15px rgba(16,185,129,0.6), inset 0 1px 0 rgba(255,255,255,0.2)' 
                   : '0 0 15px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
               }} />
        </div>
        
        <div className={`text-sm font-semibold mb-2 font-sora ${onPace ? 'text-emerald-400' : 'text-orange-400'}`}
             style={{
               textShadow: onPace ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(249,115,22,0.5)'
             }}>
          {onPace ? 'On pace' : 'Behind pace'}
        </div>
        <div className="text-white text-lg font-bold font-sora">€{Number(achieved).toLocaleString('de-DE')} / €{Number(value).toLocaleString('de-DE')}</div>
        {hint && <div className="text-zinc-300 text-xs mt-2">{hint}</div>}
        {extraNote && <div className="text-zinc-300 text-xs mt-1">{extraNote}</div>}
        {children}
      </div>
      
      {/* Enhanced 3D hover effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${onPace ? 'bg-emerald-400/8' : 'bg-orange-400/8'}`}
           style={{
             boxShadow: onPace 
               ? 'inset 0 0 60px rgba(16,185,129,0.15), 0 0 80px rgba(16,185,129,0.2)' 
               : 'inset 0 0 60px rgba(249,115,22,0.15), 0 0 80px rgba(249,115,22,0.2)'
           }} />
      
      {/* 3D hover transform */}
      <style jsx>{`
        .group:hover {
          transform: perspective(1000px) rotateX(1deg) translateY(-4px) scale(1.02) !important;
          box-shadow: 
            0 40px 100px rgba(0,0,0,0.98),
            0 20px 60px rgba(0,0,0,0.85),
            inset 0 3px 0 rgba(255,255,255,0.25),
            inset 0 -2px 0 rgba(255,255,255,0.15),
            inset 2px 0 0 rgba(255,255,255,0.12),
            inset -2px 0 0 rgba(255,255,255,0.12),
            0 0 80px ${onPace ? 'rgba(16,185,129,0.18)' : 'rgba(249,115,22,0.18)'} !important;
        }
      `}</style>
    </div>
  )
}

// Ultra-Premium Spy-Tech HUD MetricCard
function MetricCard({ title, value, prefix = '', suffix = '', loading, moneyBackground = false, moneyTrail = false, trend = false, bgGifSrc, gifHeight = 132, className = '' }: { title: string; value: number; prefix?: string; suffix?: string; loading?: boolean; moneyBackground?: boolean; moneyTrail?: boolean; trend?: boolean; bgGifSrc?: string; gifHeight?: number; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-6 overflow-hidden group ${className}`} 
         style={{
           background: `
             linear-gradient(145deg, rgba(5,5,5,0.98) 0%, rgba(20,20,20,0.99) 30%, rgba(15,15,15,0.98) 70%, rgba(8,8,8,0.97) 100%),
             radial-gradient(circle at 30% 20%, rgba(16,185,129,0.08) 0%, transparent 50%),
             radial-gradient(circle at 70% 80%, rgba(192,192,192,0.05) 0%, transparent 40%)
           `,
           border: '1px solid rgba(192,192,192,0.4)',
           backdropFilter: 'blur(25px) saturate(200%) contrast(120%)',
           boxShadow: `
             0 30px 80px rgba(0,0,0,0.95),
             0 15px 40px rgba(0,0,0,0.8),
             inset 0 2px 0 rgba(255,255,255,0.2),
             inset 0 -1px 0 rgba(255,255,255,0.1),
             inset 1px 0 0 rgba(255,255,255,0.1),
             inset -1px 0 0 rgba(255,255,255,0.1),
             0 0 60px rgba(16,185,129,0.12)
           `,
           transform: 'perspective(1000px) rotateX(2deg)',
           transformStyle: 'preserve-3d'
         }}>
      
      {/* Holographic grid overlay - subtle background pattern */}
      <div className="absolute inset-0 opacity-10 z-0" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px),
               linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px',
             animation: 'grid-pulse 4s ease-in-out infinite alternate'
           }} />
      
      {/* Corner accent lights */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400/60 opacity-80" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400/60 opacity-80" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400/60 opacity-80" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400/60 opacity-80" />
      
      {/* Original background effects (if specified) */}
      {bgGifSrc && (
        <img
          src={bgGifSrc}
          alt="bg"
          className="pointer-events-none absolute object-contain opacity-20"
          style={{ left: '0px', bottom: '0px', height: `${gifHeight}px`, zIndex: 1 }}
        />
      )}
      {moneyBackground && (
        <>
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="money-emoji opacity-30" style={{ top: `${10 + i*12}%`, animationDuration: `${10 + i*2}s`, animationDelay: `${i*0.8}s` }}>💸</div>
          ))}
        </>
      )}
      {trend && (
        <svg className="pointer-events-none absolute inset-0 opacity-40" viewBox="0 0 300 200" preserveAspectRatio="none" style={{ zIndex: 2 }}>
          <polyline className="trend-path" fill="none" stroke="#10b981" strokeWidth="2" points="0,190 40,160 80,170 120,130 160,140 200,100 240,110 300,40" />
        </svg>
      )}
      
      <div className="relative z-10">
        <div className="font-mono uppercase tracking-wider text-base md:text-lg text-white mb-2 font-sora">{title}</div>
        <div className="text-3xl font-extrabold relative inline-flex items-center text-zinc-100"
             style={{
               textShadow: loading ? 'none' : '0 0 8px rgba(255,255,255,0.3), 0 0 15px rgba(192,192,192,0.2)',
               animation: loading ? 'none' : 'spy-metric-silver-glow 2s ease-in-out infinite alternate'
             }}>
          {(() => {
            const formatted = loading ? '—' : `${prefix}${Number(value).toLocaleString('de-DE')}${suffix}`
            return (
              <span className="relative inline-block">
                {formatted}
                {moneyTrail && !loading && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 flex">
                    {Array.from({length: 3}).map((_, i) => (
                      <span key={i} className="money-spark opacity-60" style={{ animationDelay: `${i*0.3}s`, animationDuration: '3s' }}>💸</span>
                    ))}
                  </span>
                )}
              </span>
            )
          })()}
        </div>
        {trend && !loading && (
          <div className="text-emerald-400 text-sm mt-2 font-sora">↗ Trending up</div>
        )}
      </div>
      
      {/* Enhanced 3D hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-emerald-400/8 opacity-0 group-hover:opacity-100 transition-all duration-500"
           style={{
             boxShadow: 'inset 0 0 60px rgba(16,185,129,0.15), 0 0 80px rgba(16,185,129,0.2)'
           }} />
      
      {/* 3D hover transform */}
      <style jsx>{`
        .group:hover {
          transform: perspective(1000px) rotateX(1deg) translateY(-4px) scale(1.02) !important;
          box-shadow: 
            0 40px 100px rgba(0,0,0,0.98),
            0 20px 60px rgba(0,0,0,0.85),
            inset 0 3px 0 rgba(255,255,255,0.25),
            inset 0 -2px 0 rgba(255,255,255,0.15),
            inset 2px 0 0 rgba(255,255,255,0.12),
            inset -2px 0 0 rgba(255,255,255,0.12),
            0 0 80px rgba(16,185,129,0.18) !important;
        }
      `}</style>
    </div>
  )
}

// Ultra-Premium Spy-Tech BarChart
function BarChart(props: any) {
  const { title, labels, series, color, loading, prefix = '', suffix = '' } = props as {
    title: string; labels: string[]; series: number[]; color: string; loading?: boolean; prefix?: string; suffix?: string
  }
  const maxVal = Math.max(1, ...(series || [1]))
  const [animate, setAnimate] = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const PLOT_HEIGHT = 200 // px reserved for bars
  
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150)
    return () => clearTimeout(t)
  }, [labels?.join('|'), series?.join('|')])

  return (
    <div className="relative rounded-2xl p-6 overflow-hidden group" 
         style={{
           background: `
             linear-gradient(135deg, rgba(5,5,5,0.98) 0%, rgba(20,20,20,0.99) 30%, rgba(15,15,15,0.98) 70%, rgba(8,8,8,0.97) 100%),
             radial-gradient(circle at 25% 25%, rgba(16,185,129,0.06) 0%, transparent 50%),
             radial-gradient(circle at 75% 75%, rgba(192,192,192,0.04) 0%, transparent 40%)
           `,
           border: '1px solid rgba(192,192,192,0.4)',
           backdropFilter: 'blur(25px) saturate(200%) contrast(120%)',
           boxShadow: `
             0 30px 80px rgba(0,0,0,0.95),
             0 15px 40px rgba(0,0,0,0.8),
             inset 0 2px 0 rgba(255,255,255,0.18),
             inset 0 -1px 0 rgba(255,255,255,0.12),
             inset 1px 0 0 rgba(255,255,255,0.1),
             inset -1px 0 0 rgba(255,255,255,0.1),
             0 0 50px rgba(16,185,129,0.1)
           `,
           transform: 'perspective(1000px) rotateX(1.5deg)',
           transformStyle: 'preserve-3d'
         }}>
      
      {/* Holographic grid overlay */}
      <div className="absolute inset-0 opacity-8 z-0" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px),
               linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px)
             `,
             backgroundSize: '25px 25px',
             animation: 'grid-pulse 5s ease-in-out infinite alternate'
           }} />
      
      {/* Corner accent lights */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-emerald-400/70 opacity-90" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-emerald-400/70 opacity-90" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-emerald-400/70 opacity-90" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-emerald-400/70 opacity-90" />
      
      <div className="relative z-10 mb-4">
        <div className="text-white font-semibold text-lg font-sora">{title}</div>
        {hoverIdx !== null && series?.[hoverIdx] != null && (
          <div className="mt-1 text-sm font-semibold text-emerald-300"
               style={{
                 textShadow: '0 0 8px rgba(16,185,129,0.5)'
               }}>
            {labels[hoverIdx]}: {prefix}{Number(series[hoverIdx]).toLocaleString('de-DE')}{suffix}
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-48 flex items-center justify-center text-white/40">Loading…</div>
      ) : (
        <>
          {/* Plot area (bars + right axis) */}
          <div className="relative" style={{ height: `${PLOT_HEIGHT}px` }}>
            <div className="grid grid-cols-12 gap-1 items-end pr-12 h-full">
              {labels.map((label, i) => {
                const height = animate ? (series[i] / maxVal) * PLOT_HEIGHT : 0
                const delay = i * 60
                return (
                  <div key={label} className="relative flex flex-col items-center">
                    <div
                      className="w-full rounded-t transition-all ease-out cursor-pointer"
                      style={{
                        height: `${height}px`,
                        background: `
                          linear-gradient(180deg, 
                            rgba(16,185,129,0.9) 0%, 
                            rgba(16,185,129,0.7) 50%, 
                            rgba(16,185,129,0.9) 100%
                          ),
                          linear-gradient(90deg, 
                            rgba(255,255,255,0.1) 0%, 
                            transparent 50%, 
                            rgba(255,255,255,0.1) 100%
                          )
                        `,
                        border: '1px solid rgba(16,185,129,0.4)',
                        boxShadow: `
                          0 8px 25px rgba(0,0,0,0.6),
                          inset 0 1px 0 rgba(255,255,255,0.2),
                          inset 0 -1px 0 rgba(16,185,129,0.3),
                          0 0 15px rgba(16,185,129,0.3)
                        `,
                        transitionDelay: `${delay}ms`,
                        transitionDuration: '800ms',
                        opacity: hoverIdx === i ? 1 : 0.85,
                        transform: hoverIdx === i ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                        filter: hoverIdx === i ? 'brightness(1.2)' : 'brightness(1)'
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
              <span>{prefix}{maxVal.toLocaleString('de-DE')}{suffix}</span>
              <span>{prefix}{Math.round(maxVal * 0.5).toLocaleString('de-DE')}{suffix}</span>
              <span>0</span>
            </div>
          </div>
          {/* Bottom labels */}
          <div className="grid grid-cols-12 gap-1 mt-3 pr-12">
            {labels.map((label, i) => (
              <div key={label} className="text-center text-xs text-white/60 transform -rotate-45 origin-center">
                {label}
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Enhanced 3D hover effect for chart container */}
      <div className="absolute inset-0 rounded-2xl bg-emerald-400/6 opacity-0 group-hover:opacity-100 transition-all duration-500"
           style={{
             boxShadow: 'inset 0 0 80px rgba(16,185,129,0.12), 0 0 100px rgba(16,185,129,0.15)'
           }} />
      
      {/* 3D hover transform */}
      <style jsx>{`
        .group:hover {
          transform: perspective(1000px) rotateX(0.5deg) translateY(-6px) scale(1.01) !important;
          box-shadow: 
            0 40px 120px rgba(0,0,0,0.98),
            0 25px 80px rgba(0,0,0,0.9),
            inset 0 3px 0 rgba(255,255,255,0.22),
            inset 0 -2px 0 rgba(255,255,255,0.15),
            inset 2px 0 0 rgba(255,255,255,0.12),
            inset -2px 0 0 rgba(255,255,255,0.12),
            0 0 80px rgba(16,185,129,0.2) !important;
        }
      `}</style>
    </div>
  )
}
