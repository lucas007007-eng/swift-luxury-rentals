"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cityProperties } from '@/data/cityProperties'

function getCityStats() {
  return Object.entries(cityProperties).map(([city, props]) => {
    const priced = props.filter(p => typeof p.price === 'number' && !p.priceHidden)
    const count = props.length
    const avg = priced.length > 0 ? Math.round(priced.reduce((s, p) => s + (p.price || 0), 0) / priced.length) : 0
    return { city, count, avg }
  })
}

export default function PropertiesPage() {
  const router = useRouter()
  const cities = getCityStats()
  const cityIcons: Record<string, string> = {
    Berlin: '🇩🇪',
    Paris: '🇫🇷',
    Amsterdam: '🇳🇱',
    Vienna: '🇦🇹',
    Barcelona: '🇪🇸',
    London: '🇬🇧',
    Rome: '🇮🇹',
    Prague: '🇨🇿',
    Copenhagen: '🇩🇰',
    Zurich: '🇨🇭'
  }

  // City images per city - Beautiful iconic skylines and landmarks (optimized for performance)
  const cityImages: Record<string, string> = {
    Berlin: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Paris: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Vienna: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    London: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Prague: 'https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Copenhagen: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Zurich: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75'
  }

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      <section className="pt-32 md:pt-36 lg:pt-40 pb-12 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Explore Our Cities</h1>
            <p className="text-amber-300/90 text-lg">Select a city to view its luxury properties</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map(({ city, count, avg }) => (
              <div key={city} className="group relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 hover:border-amber-400/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                   onClick={() => router.push(`/city/${city}`)}>
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="w-full h-full bg-gray-800 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url('${cityImages[city] || 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=1200&q=80'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                  {/* City Icon Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-white/10 shadow-md">
                    <span className="text-xl">{cityIcons[city] || '🏙️'}</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{city}</h3>
                      <p className="text-gray-400 text-sm">{count} {count === 1 ? 'Property' : 'Properties'}</p>
                    </div>
                    {count > 0 ? (
                      <span className="text-sm font-semibold px-4 py-2 rounded-full text-green-400 bg-green-500/20 border border-green-500/30">
                        Avg €{avg.toLocaleString('de-DE')}/month
                      </span>
                    ) : (
                      <span className="text-sm font-semibold px-4 py-2 rounded-full text-amber-400 bg-amber-500/20 border border-amber-500/30">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <button className="text-amber-400 hover:text-amber-300 font-semibold transition-all duration-300 group-hover:translate-x-1 transform flex items-center space-x-2">
                      <span>Explore {city}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
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





