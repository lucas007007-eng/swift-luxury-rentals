'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function EmailAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
    
    // Set up real-time updates via SSE
    const eventSource = new EventSource('/api/admin/analytics/email/events')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'update') {
          console.log('📡 Real-time update received:', data)
          // Reload analytics when webhook events are received
          loadAnalytics()
        }
      } catch (e) {
        console.log('SSE parse error:', e)
      }
    }
    
    eventSource.onerror = (error) => {
      console.log('SSE connection error:', error)
    }
    
    return () => {
      eventSource.close()
    }
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      console.log('Fetching email analytics...')
      const res = await fetch('/api/admin/analytics/email', { cache: 'no-store' })
      console.log('Response status:', res.status)
      if (res.ok) {
        const result = await res.json()
        console.log('Analytics data received:', result)
        setData(result)
      } else {
        const errorText = await res.text()
        console.error('Analytics API error:', res.status, errorText)
        setData({ error: `API Error ${res.status}: ${errorText}` })
      }
    } catch (e) {
      console.error('Analytics fetch error:', e)
      setData({ error: `Network error: ${e}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <button onClick={()=>router.push('/admin')} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300">← Return</button>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Analytics</div>
            <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Email Analytics</h1>
            <p className="text-zinc-300 text-sm md:text-base">Deliverability, Opens, Clicks & Performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadAnalytics} 
              className="inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300"
            >
              🔄 Refresh
            </button>
            <div className="text-2xl">📊</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Key metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Emails Sent" value={data?.totals?.totalSent || 0} color="cyan" loading={loading} />
          <MetricCard title="Delivery Rate" value={data?.rates?.deliveryRate || 0} suffix="%" color="emerald" loading={loading} />
          <MetricCard title="Open Rate" value={data?.rates?.openRate || 0} suffix="%" color="amber" loading={loading} />
          <MetricCard title="Click Rate" value={data?.rates?.clickRate || 0} suffix="%" color="purple" loading={loading} />
        </div>

        {/* Main Chart - Animated like Resend */}
        <div className="luxury-feature-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Email Activity Timeline</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-zinc-300">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-zinc-300">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span className="text-zinc-300">Opened</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-zinc-400">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stackId="1"
                    stroke="#06B6D4" 
                    fill="#06B6D4" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="delivered" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                    animationDuration={1500}
                    animationDelay={200}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opened" 
                    stackId="3"
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                    animationDuration={1500}
                    animationDelay={400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Secondary metrics row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance by Category</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-zinc-400">Loading...</div>
              ) : (
                (data?.byCategory || []).map((cat: any) => (
                  <div key={cat.category || 'none'} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="text-sm text-white capitalize">{cat.category || 'Uncategorized'}</div>
                    <div className="text-emerald-300 font-semibold">{cat._count.id} emails</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Deliverability Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Delivered</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${data?.rates?.deliveryRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-emerald-300 font-semibold text-sm w-12 text-right">{data?.rates?.deliveryRate || 0}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Opened</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-amber-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${data?.rates?.openRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-amber-300 font-semibold text-sm w-12 text-right">{data?.rates?.openRate || 0}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Clicked</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${data?.rates?.clickRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-purple-300 font-semibold text-sm w-12 text-right">{data?.rates?.clickRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template performance */}
          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Template Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-zinc-300 text-sm">Template</th>
                    <th className="text-right py-3 text-zinc-300 text-sm">Sent</th>
                    <th className="text-right py-3 text-zinc-300 text-sm">Avg Open Time</th>
                    <th className="text-right py-3 text-zinc-300 text-sm">Avg Click Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="py-6 text-zinc-400 text-center">Loading...</td></tr>
                  ) : (
                    (data?.byTemplate || []).map((tpl: any) => (
                      <tr key={tpl.templateId} className="border-b border-white/5">
                        <td className="py-3 text-white">{tpl.templateId}</td>
                        <td className="py-3 text-right text-emerald-300">{tpl._count.id}</td>
                        <td className="py-3 text-right text-amber-300">—</td>
                        <td className="py-3 text-right text-purple-300">—</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Debug info - always show */}
            <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-xs text-zinc-400 mb-2">Debug Info:</div>
              {loading ? (
                <div className="text-xs text-yellow-300">Loading analytics...</div>
              ) : data ? (
                <>
                  <div className="text-xs text-white">Total emails ever: {data.debug?.totalEverSent || 0}</div>
                  <div className="text-xs text-white">Recent emails: {JSON.stringify(data.debug?.recentEmails || [], null, 2)}</div>
                  <div className="text-xs text-white">Filtering since: {data.debug?.last30Days || 'unknown'}</div>
                  {data.error && <div className="text-xs text-red-300">Error: {data.error}</div>}
                  <details className="mt-2">
                    <summary className="text-xs text-cyan-300 cursor-pointer">Full API Response</summary>
                    <pre className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                  </details>
                </>
              ) : (
                <div className="text-xs text-red-300">No data received from API</div>
              )}
            </div>
          </div>
      </div>
    </main>
  )
}

function MetricCard({ title, value, suffix = '', color, loading }: { title: string; value: number; suffix?: string; color: string; loading: boolean }) {
  const [animatedValue, setAnimatedValue] = React.useState(0)
  
  React.useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value, loading])
  
  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-400/30 text-cyan-300',
    emerald: 'border-emerald-400/30 text-emerald-300',
    amber: 'border-amber-400/30 text-amber-300',
    purple: 'border-purple-400/30 text-purple-300'
  }
  
  return (
    <div className={`luxury-feature-card p-6 border ${colorMap[color] || 'border-white/30'} relative overflow-hidden`}>
      <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">{title}</div>
      <div className="text-3xl font-bold text-white">
        {loading ? (
          <div className="animate-pulse">—</div>
        ) : (
          <CountUp value={animatedValue} suffix={suffix} />
        )}
      </div>
      {/* Subtle animated background */}
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${
        color === 'cyan' ? 'from-cyan-400' : 
        color === 'emerald' ? 'from-emerald-400' : 
        color === 'amber' ? 'from-amber-400' : 'from-purple-400'
      } to-transparent`}></div>
    </div>
  )
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [current, setCurrent] = React.useState(0)
  
  React.useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    const stepDuration = duration / steps
    
    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrent(Math.min(value, Math.round(increment * step)))
      if (step >= steps) clearInterval(timer)
    }, stepDuration)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{current.toLocaleString()}{suffix}</span>
}
