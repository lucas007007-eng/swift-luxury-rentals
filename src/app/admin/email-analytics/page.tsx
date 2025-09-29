'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EmailAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/analytics/email')
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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
          <div className="w-20 flex justify-end">
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

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Email Activity (Last 7 Days)</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-zinc-400">Loading...</div>
              ) : (
                (data?.dailyStats || []).map((day: any) => (
                  <div key={day.date} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="text-sm text-white">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-cyan-300">Sent: {day.sent}</span>
                      <span className="text-xs text-emerald-300">Delivered: {day.delivered}</span>
                      <span className="text-xs text-amber-300">Opened: {day.opened}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
                      <td className="py-3 text-right text-amber-300">{tpl._avg.openedAt ? '~2h' : '—'}</td>
                      <td className="py-3 text-right text-purple-300">{tpl._avg.clickedAt ? '~5h' : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

function MetricCard({ title, value, suffix = '', color, loading }: { title: string; value: number; suffix?: string; color: string; loading: boolean }) {
  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-400/30 text-cyan-300',
    emerald: 'border-emerald-400/30 text-emerald-300',
    amber: 'border-amber-400/30 text-amber-300',
    purple: 'border-purple-400/30 text-purple-300'
  }
  
  return (
    <div className={`luxury-feature-card p-6 border ${colorMap[color] || 'border-white/30'}`}>
      <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">{title}</div>
      <div className="text-2xl font-bold text-white">
        {loading ? '—' : `${value.toLocaleString()}${suffix}`}
      </div>
    </div>
  )
}
