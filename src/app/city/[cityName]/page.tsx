'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import SearchInterface from '@/components/SearchInterface'
import CityFilterModal, { CityFilterState } from '@/components/CityFilterModal'
import PropertyMap from '@/components/PropertyMap'
import WeatherWidget from '@/components/WeatherWidget'
import { cityProperties, cityInfo } from '@/data/cityProperties'

export default function CityPage() {
  const params = useParams()
  const cityName = params.cityName as string
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [searchMode, setSearchMode] = useState<'homes' | 'concierge'>('homes')
  const [overrides, setOverrides] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [filterState, setFilterState] = useState<CityFilterState>({ amenities: [] })
  const [weatherBgClass, setWeatherBgClass] = useState<string>('weather-bg-clear')
  const [debugWeather, setDebugWeather] = useState<any>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const rainContainerRef = useRef<HTMLDivElement | null>(null)
  const searchParams = useSearchParams()
  const checkIn = searchParams.get('checkin') || ''
  const checkOut = searchParams.get('checkout') || ''
  const destinationParam = searchParams.get('destination') || ''
  
  // Get properties for the selected city
  const properties = cityProperties[cityName] || []
  const countryMap: Record<string, string> = {
    Berlin: 'Germany',
    Paris: 'France',
    Amsterdam: 'Netherlands',
    Vienna: 'Austria',
    Barcelona: 'Spain',
    London: 'United Kingdom',
    Rome: 'Italy',
    Prague: 'Czech Republic',
    Copenhagen: 'Denmark',
    Zurich: 'Switzerland'
  }
  const initialDestination = destinationParam || `${cityName}, ${countryMap[cityName] || ''}`
  useEffect(() => {
    // Load admin overrides to get latest availability calendars
    fetch('/api/admin/overrides', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then(setOverrides)
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    // Start from availability filter
    const base = properties.filter(p => {
      if (!checkIn || !checkOut) return true
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      const cal = overrides[p.id]?.calendar || (p as any).calendar
      if (!cal) return true
      let d = new Date(start)
      while (d < end) {
        const k = d.toISOString().slice(0,10)
        const day = cal[k]
        if (day && day.available === false) return false
        d.setDate(d.getDate()+1)
      }
      return true
    })

    const roomsOk = base.filter(p => {
      // Price range filter
      if (filterState.priceRange) {
        const price = overrides[p.id]?.price || p.price || 0
        if (price < filterState.priceRange[0] || price > filterState.priceRange[1]) return false
      }
      
      if (filterState.bedrooms && (p.bedrooms || 0) < filterState.bedrooms) return false
      if (filterState.bathrooms && (p.bathrooms || 0) < filterState.bathrooms) return false
      return true
    })

    // Amenity keyword matching (case-insensitive with synonyms)
    const getVariants = (term: string): string[] => {
      const t = term.toLowerCase()
      const variants = new Set<string>([t])
      const add = (v: string) => variants.add(v.toLowerCase())
      switch (t) {
        case 'wifi':
          ;['wi-fi','wireless','internet'].forEach(add); break
        case 'air conditioning':
          ;['ac','a/c','aircon','air-conditioner'].forEach(add); break
        case 'hot tub':
          ;['hottub','jacuzzi','whirlpool','spa'].forEach(add); break
        case 'bbq grill':
          ;['bbq','barbecue','grill'].forEach(add); break
        case 'ev charger':
          ;['electric vehicle charger','ev-charger','charging station','car charger'].forEach(add); break
        case 'smoke alarm':
          ;['smoke detector'].forEach(add); break
        case 'carbon monoxide alarm':
          ;['co alarm','carbon monoxide detector','co detector'].forEach(add); break
        case 'king bed':
          ;['king-bed','king sized bed','king size bed','king'].forEach(add); break
        case 'tv':
          ;['television','smart tv'].forEach(add); break
        case 'washer':
          ;['washing machine','laundry'].forEach(add); break
        case 'dryer':
          ;['tumble dryer','laundry dryer'].forEach(add); break
        default: break
      }
      return Array.from(variants)
    }

    const selected = (filterState.amenities || [])
    const final = selected.length === 0 ? roomsOk : roomsOk.filter(p => {
      const mergedAmenities = (overrides[p.id]?.amenities || p.amenities || []) as string[]
      const amenitiesLower = mergedAmenities.map(x=>String(x).toLowerCase())
      // every selected amenity keyword must match at least one amenity string
      return selected.every(sel => {
        const variants = getVariants(sel)
        return amenitiesLower.some(am => variants.some(v => am.includes(v)))
      })
    })
    return final
  }, [properties, checkIn, checkOut, overrides, filterState])
  const currentCityInfo = cityInfo[cityName as keyof typeof cityInfo]

  return (
    <main className="min-h-screen">
      <Header forceBackground={true} />
      
      {/* Hero Section with Search */}
      <section ref={heroRef} className="relative pt-24 md:pt-28 lg:pt-32 pb-10 overflow-hidden min-h-[420px]">
        {/* Exact CodePen scene embedded full-bleed in hero */}
        <div className="absolute inset-0 z-10">
          <iframe
            title="Weather Animation"
            src="https://codepen.io/web-dev123/embed/MvaXwq?default-tab=result"
            className="w-full h-full"
            frameBorder="0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>

      {/* Set background class based on Google Weather */}
      <WeatherBackgroundSetter cityName={cityName} onClass={setWeatherBgClass} onDebug={setDebugWeather} />

      {/* Filter Modal */}
      {searchMode === 'homes' && (
        <CityFilterModal
          open={showFilters}
          onClose={()=>setShowFilters(false)}
          properties={properties}
          onApply={(s)=>{ setFilterState(s); setShowFilters(false) }}
          overrides={overrides}
        />
      )}

      {/* Properties Grid & Map */}
      <section className="py-12 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {filtered.length > 0 ? (
            <>
              {/* Properties Grid: 3 per row on large screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filtered.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => setSelectedPropertyId(property.id)}
                  >
                    <PropertyCard
                      property={property}
                      index={index}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Map below the grid: same width as 3 tiles, same height as one row */}
              <div className="mt-8">
                <PropertyMap 
                  properties={filtered}
                  selectedProperty={selectedPropertyId}
                  onPropertySelect={setSelectedPropertyId}
                  heightClassName="h-[28rem] md:h-[30rem] lg:h-[32rem]"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-white mb-2">Coming Soon to {cityName}</h3>
              <p className="text-gray-400 mb-6">We&apos;re expanding to {cityName}! Luxury properties will be available soon.</p>
              <button
                onClick={() => window.history.back()}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Back to All Cities
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function WeatherBackgroundSetter({ cityName, onClass, onDebug }: { cityName: string, onClass: (c: string)=>void, onDebug: (d: any)=>void }) {
  useEffect(() => {
    let cancelled = false
    let splashTimers: any[] = []
    const load = async () => {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const c: string = String(data?.condition || '').toLowerCase()
        const base = 'weather-bg'
        let cls = `${base}-clear`
        if (c.includes('thunder') || c.includes('storm') || c.includes('lightning')) cls = `${base}-thunder`
        else if (c.includes('rain') || c.includes('drizzle')) cls = `${base}-rain`
        else if (c.includes('snow')) cls = `${base}-snow`
        else if (c.includes('cloud')) cls = `${base}-cloudy`
        else if (c.includes('clear') || c.includes('sunny')) cls = `${base}-sunny`
        if (!cancelled) {
          onClass(cls)
          onDebug(data)
        }

        // JS rain like the CodePen
        const container = document.getElementById('rain-container')
        if (container) {
          container.innerHTML = ''
          splashTimers.forEach(t => clearTimeout(t))
          splashTimers = []
          if (cls.endsWith('-rain') || cls.endsWith('-thunder')) {
            const dropCount = 100
            for (let i = 0; i < dropCount; i++) {
              const d = document.createElement('div')
              d.className = 'raindrop'
              const left = Math.random() * 100
              const delay = Math.random() * 2
              const duration = 0.9 + Math.random() * 0.9
              const scale = 0.8 + Math.random() * 0.6
              d.style.left = `${left}%`
              d.style.animationDelay = `${delay}s`
              d.style.animationDuration = `${duration}s`
              d.style.transform = `translateY(-120px) translateX(0) scale(${scale})`
              container.appendChild(d)
              const splashTime = (duration + delay) * 1000
              const timer = setTimeout(() => {
                const s = document.createElement('div')
                s.className = 'splash'
                s.style.left = `calc(${left}% + 25px)`
                s.style.bottom = '2px'
                s.style.opacity = '0.9'
                container.appendChild(s)
                setTimeout(() => s.remove(), 600)
              }, splashTime)
              splashTimers.push(timer)
            }
          }
        }
      } catch (err) {
        if (!cancelled) onDebug({ error: String(err) })
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id); splashTimers.forEach(t => clearTimeout(t)) }
  }, [cityName, onClass, onDebug])
  return null
}
