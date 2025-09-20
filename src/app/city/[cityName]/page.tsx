'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
      <section className="relative pt-32 md:pt-36 lg:pt-40 pb-12 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        {/* Weather Animation Background */}
        <div className={`absolute inset-0 pointer-events-none opacity-40 ${weatherBgClass}`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Weather Widget */}
          <div className="absolute top-32 right-4 md:right-8 z-10">
            <WeatherWidget city={cityName} className="w-48" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-black font-serif tracking-tight leading-tight mb-6">
              {currentCityInfo?.title || `${cityName} Luxury Rentals`}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
              {currentCityInfo?.description || `Discover luxury rental properties in ${cityName}.`}
            </p>
            <div className="text-lg text-gray-500">
              {filtered.length} luxury properties available
            </div>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1">
                <SearchInterface 
                  initialDestination={initialDestination}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  initialGuests={Number(searchParams.get('guests') || '1')}
                  initialAdults={Number(searchParams.get('adults') || '1')}
                  initialChildren={Number(searchParams.get('children') || '0')}
                  initialInfants={Number(searchParams.get('infants') || '0')}
                  initialPets={Number(searchParams.get('pets') || '0')}
                  onModeChange={(m)=>setSearchMode(m)}
                />
              </div>
              {searchMode === 'homes' && (
                <div className="flex justify-center md:justify-start">
                  <button 
                    onClick={()=>setShowFilters(true)} 
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md hover:shadow-lg transition-all w-full md:w-auto justify-center md:justify-start md:h-[52px] md:mb-2"
                  >
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 6h18M7 12h10m-7 6h4"/>
                    </svg>
                    <span>Filters</span>
                    <span className="ml-1 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {filtered.length}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Set background class based on Google Weather */}
      <WeatherBackgroundSetter cityName={cityName} onClass={setWeatherBgClass} />

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

function WeatherBackgroundSetter({ cityName, onClass }: { cityName: string, onClass: (c: string)=>void }) {
  useEffect(() => {
    let cancelled = false
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
        if (!cancelled) onClass(cls)
      } catch {}
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [cityName, onClass])
  return null
}
