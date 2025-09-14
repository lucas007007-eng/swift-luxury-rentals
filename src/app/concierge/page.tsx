'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SearchInterface from '@/components/SearchInterface'

export default function ConciergeResults() {
  const params = useSearchParams()
  const destination = params.get('destination') || 'Your City'
  const service = params.get('service') || 'Concierge Service'

  const city = destination.split(',')[0]

  const isDriver = service.toLowerCase().includes('driver') || service.toLowerCase().includes('chauffeur')
  const serviceDisplay = isDriver ? 'Personal Chauffeur' : service
  const driverImgsBase = [
    // Chauffeur cues: gloves on wheel, door open, premium sedan
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511914265871-bfb3eb3b3a6e?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542367597-8849ebf09548?q=80&w=1600&auto=format&fit=crop'
  ]
  const defaultImgs = [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop'
  ]
  // Cache-bust so old images are not reused by the browser
  const bust = Date.now()
  const imgs = isDriver ? driverImgsBase.map(u => `${u}&cb=${bust}`) : defaultImgs.map(u => `${u}&cb=${bust}`)
  const tiles = imgs.map((img, idx) => ({ id: `svc-${idx+1}`, name: `${serviceDisplay} ${String.fromCharCode(65+idx)}`, rate: `${45 + idx*10}€/hr`, img }))

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      <section className="pt-28 md:pt-32 lg:pt-36 pb-12 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* Search on top similar to city page */}
          <div className="max-w-4xl lg:max-w-5xl mx-auto mb-8">
            <SearchInterface
              className=""
              initialMode="concierge"
              initialDestination={destination}
              initialCheckIn={params.get('checkin') || ''}
              initialCheckOut={params.get('checkout') || ''}
              initialAdults={Number(params.get('adults')||'1')}
              initialChildren={Number(params.get('children')||'0')}
              initialService={service}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{isDriver ? `${city} Personal Chauffeur for Hire` : `${city} Concierge`}</h1>
          <p className="text-amber-300/90">{serviceDisplay} options in {destination}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {tiles.map(t => (
              <div key={t.id} className="group rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-amber-400/50 transition-all duration-300">
                <div className="relative aspect-[4/3]" style={{backgroundImage:`url('${t.img}')`, backgroundSize:'cover', backgroundPosition: isDriver ? 'center 60%' : 'center'}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {isDriver && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-amber-300 border border-amber-400/30">Chauffeur</div>
                  )}
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{t.name}</div>
                    <div className="text-white/60 text-sm">Rated • Verified</div>
                  </div>
                  <div className="text-amber-400 font-bold">{t.rate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}


