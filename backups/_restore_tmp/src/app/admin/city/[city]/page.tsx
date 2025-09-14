'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cityProperties } from '@/data/cityProperties'

export default function AdminCityPage() {
  const router = useRouter()
  const params = useParams()
  const city = decodeURIComponent(params.city as string)
  const listings = cityProperties[city] || []
  const [bookings, setBookings] = useState<any[]>([])
  useEffect(() => {
    ;(async()=>{
      try{
        const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
        const data = await res.json()
        // We don't have raw bookings here, so compute by property from monthly? Better fetch crm which has rows
        const crmRes = await fetch('/api/admin/crm', { cache: 'no-store' })
        const crm = await crmRes.json()
        setBookings(crm.rows || [])
      }catch{}
    })()
  }, [])
  const byProperty = useMemo(()=>{
    const map: Record<string, { revenue: number; commission: number }> = {}
    for (const b of bookings) {
      if (!b || !b.propertyId) continue
      const rev = Number(b.total || 0)
      if (!map[b.propertyId]) map[b.propertyId] = { revenue: 0, commission: 0 }
      map[b.propertyId].revenue += isNaN(rev) ? 0 : rev
    }
    return map
  }, [bookings])

  // Derive a global commission rate matching the dashboard: totalCommission / totalRevenue
  const commissionRate = useMemo(()=>{
    let revSum = 0
    let comSum = 0
    for (const b of bookings) {
      revSum += Number(b?.total || 0)
      comSum += Number(b?.commission || 0)
    }
    const rate = revSum > 0 ? comSum / revSum : 0.1
    return Math.max(0, Math.min(1, rate))
  }, [bookings])
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <button onClick={()=>router.push('/admin')} className="text-amber-400 mb-6">← Back</button>
        <h1 className="text-3xl font-bold mb-6">{city} Listings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="h-40 bg-cover bg-center" style={{backgroundImage:`url('${listing.images?.[0]}')`}} />
              <div className="p-4 space-y-2">
                <div className="font-semibold">{listing.title}</div>
                <div className="text-sm text-white/70">{listing.location}</div>
                <div className="text-xs text-white/60 mt-1">
                  {(() => {
                    const rev = byProperty[listing.id]?.revenue || 0
                    const com = Math.round(rev * commissionRate)
                    return (
                      <>
                        Revenue: <span className="text-emerald-400 font-semibold">€{rev.toLocaleString('de-DE')}</span>
                        <span className="mx-2">•</span>
                        Commission (@{Math.round(commissionRate*100)}%): <span className="text-amber-400 font-semibold">€{com.toLocaleString('de-DE')}</span>
                      </>
                    )
                  })()}
                </div>
                <button onClick={()=>router.push(`/admin/property/${listing.id}`)} className="mt-2 text-sm bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1.5 rounded">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}


