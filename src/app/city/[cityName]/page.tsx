'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import SearchInterface from '@/components/SearchInterface'
import PropertyMap from '@/components/PropertyMap'
import { cityProperties, cityInfo } from '@/data/cityProperties'

export default function CityPage() {
  const params = useParams()
  const cityName = params.cityName as string
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, any>>({})
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
    fetch('/api/admin/overrides')
      .then(r => r.ok ? r.json() : {})
      .then(setOverrides)
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!checkIn || !checkOut) return properties
    const start = new Date(checkIn)
    const end = new Date(checkOut) // treat checkout as exclusive
    const withinRange = (cal: any) => {
      if (!cal) return true
      let d = new Date(start)
      while (d < end) {
        const k = d.toISOString().slice(0,10)
        const day = cal[k]
        if (day && day.available === false) return false
        d.setDate(d.getDate()+1)
      }
      return true
    }
    return properties.filter(p => withinRange(overrides[p.id]?.calendar || (p as any).calendar))
  }, [properties, checkIn, checkOut, overrides])
  const currentCityInfo = cityInfo[cityName as keyof typeof cityInfo]

  return (
    <main className="min-h-screen">
      <Header forceBackground={true} />
      
      {/* Hero Section with Search */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <SearchInterface 
              initialDestination={initialDestination}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={Number(searchParams.get('guests') || '1')}
              initialAdults={Number(searchParams.get('adults') || '1')}
              initialChildren={Number(searchParams.get('children') || '0')}
              initialInfants={Number(searchParams.get('infants') || '0')}
              initialPets={Number(searchParams.get('pets') || '0')}
              showFilters={true}
            />
          </motion.div>
        </div>
      </section>

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
