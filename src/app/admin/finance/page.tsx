'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FinancePage() {
  const router = useRouter()
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolioData()
    
    // Smart auto-refresh: check for updates every 3 seconds, only refresh if data changed
    let lastKnownUpdate = 0
    const interval = setInterval(async () => {
      if (typeof window !== 'undefined' && !document.hidden) {
        try {
          const updateRes = await fetch('/api/admin/finance/last-update', { cache: 'no-store' })
          const updateData = await updateRes.json()
          const serverLastUpdate = updateData.lastUpdate || 0
          
          if (serverLastUpdate > lastKnownUpdate) {
            console.log('🔄 Finance data updated on server, refreshing portfolio...')
            lastKnownUpdate = serverLastUpdate
            loadPortfolioData()
          }
        } catch (e) {
          console.error('Failed to check for finance updates:', e)
        }
      }
    }, 1000) // Check every 1 second for immediate updates
    
    return () => clearInterval(interval)
  }, [])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      console.log('📊 Loading portfolio data...')
      const [portfolioRes, propertiesRes] = await Promise.all([
        fetch('/api/admin/finance/portfolio', { cache: 'no-store' }),
        fetch('/api/admin/finance/properties', { cache: 'no-store' })
      ])
      
      console.log('Portfolio response:', portfolioRes.status)
      console.log('Properties response:', propertiesRes.status)
      
      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json()
        console.log('Portfolio data:', portfolioData)
        setPortfolioData(portfolioData)
      }
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        console.log('Properties data:', propertiesData)
        setProperties(propertiesData)
      }
    } catch (e) {
      console.error('Failed to load finance data:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
          >
            ← Return
          </Link>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Finance</div>
            <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Finance Command</h1>
            <p className="text-zinc-300 text-sm md:text-base">Elite Property Portfolio Management</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadPortfolioData}
              className="inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300"
            >
              🔄 Refresh
            </button>
            <div className="text-2xl">💎</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="luxury-feature-card p-6">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Total Investment</div>
            <div className="text-3xl font-bold text-white">
              {loading ? '—' : `€${(portfolioData?.totalInvestment || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="luxury-feature-card p-6">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Monthly Revenue</div>
            <div className="text-3xl font-bold text-white">
              {loading ? '—' : `€${(portfolioData?.monthlyRevenue || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="luxury-feature-card p-6">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Monthly Expenses</div>
            <div className="text-3xl font-bold text-white">
              {loading ? '—' : `€${(portfolioData?.monthlyExpenses || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="luxury-feature-card p-6">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Net Profit</div>
            <div className="text-3xl font-bold text-white">
              {loading ? '—' : `€${(portfolioData?.netProfit || 0).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="luxury-feature-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Property Portfolio</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/finance/sync', { method: 'POST' })
                    const result = await res.json()
                    if (res.ok) {
                      alert(`✅ ${result.message}`)
                      loadPortfolioData() // Refresh data
                    } else {
                      alert('❌ Sync failed')
                    }
                  } catch (e) {
                    alert('❌ Sync failed')
                  }
                }}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
              >
                🔄 Sync Properties
              </button>
              <button className="inline-flex items-center px-4 py-2 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300">
                Add Property
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array.from({length: 6}).map((_, i) => (
                <div key={i} className="border border-white/10 rounded-xl p-6 bg-white/5 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-20 bg-gray-700 rounded"></div>
                </div>
              ))
            ) : (
              properties.map(property => (
                <Link
                  key={property.id}
                  href={`/admin/properties/${property.id}/accounting`}
                  className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-cyan-400/30 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {property.title}
                    </h3>
                    <div className="text-xs px-2 py-1 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                      Active
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-xs">Investment</span>
                      <span className="text-white font-semibold text-sm">€{(property.totalInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-xs">Monthly Revenue</span>
                      <span className="text-white font-semibold text-sm">€{(property.monthlyRevenue || 0).toLocaleString()}</span>
                    </div>
                    
                    {/* Expense Group */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-center mb-2">
                        <span className="text-xs text-zinc-300">Fixed + Monthly Expenses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 text-xs">Fixed Expenses</span>
                        <span className="text-white font-semibold text-sm">€{(property.fixedExpenses || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 text-xs">Recurring Monthly</span>
                        <span className="text-white font-semibold text-sm">€{(property.recurringMonthly || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-300 text-xs">Total Expenses {new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                        <span className="text-white font-bold text-sm">€{((property.fixedExpenses || 0) + (property.recurringMonthly || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Profit Group */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 text-xs">Investor Fee ({((property.investorFeeRate || 0.75) * 100).toFixed(0)}%)</span>
                        <span className="text-white font-semibold text-sm">
                          €{Math.round(((property.monthlyRevenue || 0) - ((property.fixedExpenses || 0) + (property.recurringMonthly || 0))) * (property.investorFeeRate || 0.75)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-300 text-xs">Your Net Profit</span>
                        <span className={`font-bold text-sm ${(() => {
                          const grossProfit = (property.monthlyRevenue || 0) - ((property.fixedExpenses || 0) + (property.recurringMonthly || 0))
                          const investorFee = grossProfit * (property.investorFeeRate || 0.75)
                          const netProfit = grossProfit - investorFee
                          return netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        })()}`}>
                          €{(() => {
                            const grossProfit = (property.monthlyRevenue || 0) - ((property.fixedExpenses || 0) + (property.recurringMonthly || 0))
                            const investorFee = grossProfit * (property.investorFeeRate || 0.75)
                            const netProfit = grossProfit - investorFee
                            return Math.round(netProfit).toLocaleString()
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs">ROI</span>
                      <span className="text-cyan-300 font-semibold">{(property.roi || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {/* Debug section */}
          <div className="mt-6 p-4 rounded-lg bg-black/40 border border-white/10">
            <div className="text-xs text-zinc-400 mb-2">Debug Info:</div>
            <div className="text-xs text-white">Loading: {loading ? 'true' : 'false'}</div>
            <div className="text-xs text-white">Portfolio data: {JSON.stringify(portfolioData, null, 2)}</div>
            <div className="text-xs text-white">Properties count: {properties.length}</div>
            <div className="text-xs text-white">Properties: {JSON.stringify(properties.slice(0, 2), null, 2)}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

