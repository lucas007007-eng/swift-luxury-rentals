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

  useEffect(() => {
    if (propertyId) loadPropertyFinancials()
  }, [propertyId])

  const loadPropertyFinancials = async () => {
    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}`)
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
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Total Monthly</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${((data?.recurringMonthly || 0) + (data?.currentMonthExpenses || 0)).toLocaleString()}`}
            </div>
            <div className="text-xs text-red-300 mt-1">This month</div>
          </div>
          <div className="luxury-feature-card p-4 border border-purple-400/30">
            <div className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">Net Profit</div>
            <div className="text-xl font-bold text-white">
              {loading ? '—' : `€${((data?.monthlyRevenue || 0) - ((data?.recurringMonthly || 0) + (data?.currentMonthExpenses || 0))).toLocaleString()}`}
            </div>
            <div className="text-xs text-purple-300 mt-1">Monthly</div>
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
