'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function PropertyAccountingPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.propertyId as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (propertyId) loadPropertyFinancials()
  }, [propertyId, selectedMonth, selectedYear])

  const loadPropertyFinancials = async () => {
    try {
      const params = new URLSearchParams()
      params.set('month', selectedMonth.toString())
      params.set('year', selectedYear.toString())
      const res = await fetch(`/api/admin/finance/properties/${propertyId}?${params.toString()}`)
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error('Failed to load property financials:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!propertyId) return <div>Property not found</div>

  const COLORS = ['#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/finance"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
          >
            ← Back to Finance
          </Link>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Property Finance</div>
            <h1 className="text-2xl md:text-3xl font-bold heading-sora text-white">{data?.property?.title || 'Property'}</h1>
            <p className="text-zinc-300 text-sm">Complete Financial Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Bond-style Month Selector */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <button 
                onClick={() => {
                  const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
                  const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
                  setSelectedMonth(newMonth)
                  setSelectedYear(newYear)
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded hover:bg-amber-500/10"
              >
                ←
              </button>
              <div className="text-white font-semibold text-sm min-w-[120px] text-center">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button 
                onClick={() => {
                  const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1
                  const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear
                  setSelectedMonth(newMonth)
                  setSelectedYear(newYear)
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded hover:bg-amber-500/10"
              >
                →
              </button>
            </div>
            {/* Investor Fee Editor */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <span className="text-cyan-300 text-xs">Investor Fee:</span>
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={((data?.investorFeeRate || 0.75) * 100).toFixed(0)}
                onChange={async (e) => {
                  const newRate = parseFloat(e.target.value) / 100
                  try {
                    const res = await fetch(`/api/admin/finance/properties/${propertyId}/investor-fee`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ investorFeeRate: newRate })
                    })
                    if (res.ok) loadPropertyFinancials()
                  } catch (err) {
                    console.error('Failed to update investor fee:', err)
                  }
                }}
                className="w-16 bg-black/40 text-white text-xs text-center border border-cyan-400/30 rounded px-2 py-1 focus:outline-none"
              />
              <span className="text-cyan-300 text-xs">%</span>
            </div>
            <button className="inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300">
              📊 Reports
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="luxury-feature-card p-4 border border-cyan-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Total Investment</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${(data?.totalInvestment || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="luxury-feature-card p-4 border border-emerald-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Monthly Revenue</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${(data?.monthlyRevenue || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="luxury-feature-card p-4 border border-orange-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Fixed Expenses</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${(data?.fixedExpenses || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-orange-300 mt-1">One-time costs</div>
          </div>
          <div className="luxury-feature-card p-4 border border-amber-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Recurring Monthly</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${(data?.recurringMonthly || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-amber-300 mt-1">Per month</div>
          </div>
          <div className="luxury-feature-card p-4 border border-red-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Total Expenses {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' })}</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${((data?.fixedExpenses || 0) + (data?.recurringMonthly || 0)).toLocaleString()}`}
            </div>
            <div className="text-xs text-red-300 mt-1">Fixed + Monthly</div>
          </div>
          <div className="luxury-feature-card p-4 border border-orange-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Investor Fee</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${Math.round(((data?.monthlyRevenue || 0) - ((data?.fixedExpenses || 0) + (data?.recurringMonthly || 0))) * (data?.investorFeeRate || 0.75)).toLocaleString()}`}
            </div>
            <div className="text-xs text-orange-300 mt-1">{((data?.investorFeeRate || 0.75) * 100).toFixed(0)}% of profit</div>
          </div>
          <div className="luxury-feature-card p-4 border border-purple-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Net Profit (After Fee)</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : (() => {
                const grossProfit = (data?.monthlyRevenue || 0) - ((data?.fixedExpenses || 0) + (data?.recurringMonthly || 0))
                const investorFee = grossProfit * (data?.investorFeeRate || 0.75)
                const netProfit = grossProfit - investorFee
                return `€${Math.round(netProfit).toLocaleString()}`
              })()}
            </div>
            <div className="text-xs text-purple-300 mt-1">Your share</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Expenses</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full text-zinc-400">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="expenses" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Investment Breakdown</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full text-zinc-400">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.investmentBreakdown || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {(data?.investmentBreakdown || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href={`/admin/properties/${propertyId}/accounting/expenses`}
            className="luxury-feature-card p-6 hover:border-amber-400/30 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">Expenses</h3>
              <p className="text-zinc-400 text-sm mt-2">Track & categorize costs</p>
            </div>
          </Link>

          <Link
            href={`/admin/properties/${propertyId}/accounting/revenue`}
            className="luxury-feature-card p-6 hover:border-emerald-400/30 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">Revenue</h3>
              <p className="text-zinc-400 text-sm mt-2">Income & invoicing</p>
            </div>
          </Link>

          <Link
            href={`/admin/properties/${propertyId}/accounting/investments`}
            className="luxury-feature-card p-6 hover:border-cyan-400/30 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">🏗️</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">Investments</h3>
              <p className="text-zinc-400 text-sm mt-2">Capital expenditures</p>
            </div>
          </Link>

          <Link
            href={`/admin/properties/${propertyId}/accounting/reports`}
            className="luxury-feature-card p-6 hover:border-purple-400/30 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Reports</h3>
              <p className="text-zinc-400 text-sm mt-2">Financial statements</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
