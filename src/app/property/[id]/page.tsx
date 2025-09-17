'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { 
  HeartIcon, 
  ShareIcon, 
  MapPinIcon, 
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Property } from '@/types'
import { cityProperties } from '@/data/cityProperties'
// dynamic overrides loaded from API so edits reflect immediately
import dynamic from 'next/dynamic'
const PublicCalendar = dynamic(() => import('@/components/PublicCalendar'), { ssr: false })
import { getProxiedImageUrl } from '@/lib/utils'

// Property data - search through all city properties
const getPropertyById = (id: string): Property | null => {
  // Search through all cities for the property
  for (const cityName in cityProperties) {
    const properties = cityProperties[cityName]
    const property = properties.find(p => p.id === id)
    if (property) {
      return property
    }
  }
  return null
}

export default function PropertyPage() {
  const params = useParams()
  const rawId = params.id as string
  const property = getPropertyById(rawId)
  const [override, setOverride] = useState<any>({})
  useEffect(()=>{
    ;(async()=>{
      try {
        const res = await fetch('/api/admin/overrides', { cache: 'no-store' })
        const data = await res.json().catch(()=>({}))
        setOverride((data as any)?.[rawId] || {})
      } catch {}
    })()
  }, [rawId])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen || !property) return
      
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      } else if (e.key === 'ArrowLeft') {
        const newIndex = currentImageIndex === 0 
          ? property.images.length - 1 
          : currentImageIndex - 1
        setCurrentImageIndex(newIndex)
      } else if (e.key === 'ArrowRight') {
        const newIndex = currentImageIndex === property.images.length - 1 
          ? 0 
          : currentImageIndex + 1
        setCurrentImageIndex(newIndex)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, currentImageIndex, property])

  // Note: Do NOT early-return before hooks. We'll handle Not Found just before render.

  // Merge overrides (title/description/price/amenities/house rules)
  if (property) {
    if (override.title) property.title = override.title
    if (override.description) property.description = override.description
    if (typeof override.price === 'number') property.price = override.price
    if (Array.isArray((override as any).amenities)) property.amenities = (override as any).amenities
  }

  // Availability from overrides (if any)
  const availability = (override?.calendar as any) || {}
  const [selectedStart, setSelectedStart] = useState<string | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // Map feature removed; no map properties needed

  // Map feature removed per request

  const nightlyFallback = useMemo(() => {
    const monthly = Number(property?.price || 0)
    return Math.round((monthly / 30) * 100) / 100
  }, [property?.price])

  function dateKeysBetween(start: string, end: string): string[] {
    const res: string[] = []
    const s = new Date(start)
    const e = new Date(end)
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      res.push(d.toISOString().slice(0, 10))
    }
    return res
  }

  const bookingSummary = useMemo(() => {
    if (!selectedStart || !selectedEnd || selectedEnd <= selectedStart) return null
    const keys = dateKeysBetween(selectedStart, selectedEnd)
    let sum = 0
    for (const k of keys) {
      const day = (availability as any)[k]
      const available = day?.available !== false
      if (!available) return { nights: 0, total: 0, unavailable: true }
      const priceNight = day?.priceNight ?? nightlyFallback
      sum += priceNight
    }
    return { nights: keys.length, total: Math.round(sum * 100) / 100, unavailable: false }
  }, [selectedStart, selectedEnd, availability, nightlyFallback])

  // Helper: add months keeping day where possible
  function addMonthsKeepDay(date: Date, add: number): Date {
    const targetMonth = date.getMonth() + add
    const targetYear = date.getFullYear() + Math.floor(targetMonth / 12)
    const monthNormalized = ((targetMonth % 12) + 12) % 12
    const day = date.getDate()
    const lastDay = new Date(targetYear, monthNormalized + 1, 0).getDate()
    const useDay = Math.min(day, lastDay)
    return new Date(targetYear, monthNormalized, useDay)
  }

  // Compute damage deposit to mirror payment page logic
  const damageDepositForSelection = useMemo(() => {
    try {
      if (!selectedStart || !selectedEnd) return 0
      const s = new Date(selectedStart)
      const e = new Date(selectedEnd)
      const totalDays = Math.max(0, Math.round((e.getTime() - s.getTime())/86400000))
      const monthly = Number(property?.price || 0)
      const threeMonthsFromStart = addMonthsKeepDay(s, 3)
      const longerOrEqualThree = e > threeMonthsFromStart || e.getTime() === threeMonthsFromStart.getTime()
      if (totalDays < 15) return 500
      if (totalDays < 30) return 750
      return Math.round(monthly * (longerOrEqualThree ? 1 : 0.5))
    } catch { return 0 }
  }, [selectedStart, selectedEnd, property?.price])

  // bring back new duration selector (expecting a fresh .riv)

  // Categorize amenities (maps backend edits to the correct UI section)
  const amenityGroups = useMemo(() => {
    const groups: { kitchen: string[]; comfort: string[]; technology: string[]; bathroom: string[]; outdoor: string[]; other: string[] } = {
      kitchen: [], comfort: [], technology: [], bathroom: [], outdoor: [], other: []
    }
    const list = property?.amenities || []
    for (const a of list) {
      const s = String(a).toLowerCase()
      if (
        s.includes('kitchen') || s.includes('oven') || s.includes('dishwasher') || s.includes('fridge') || s.includes('refrigerator') || s.includes('stove') || s.includes('microwave')
      ) {
        groups.kitchen.push(a)
      } else if (
        s.includes('wifi') || s.includes('internet') || s.includes('tv') || s.includes('smart') || s.includes('sound')
      ) {
        groups.technology.push(a)
      } else if (
        s.includes('bath') || s.includes('shower') || s.includes('toilet') || s.includes('bathtub')
      ) {
        groups.bathroom.push(a)
      } else if (
        s.includes('balcony') || s.includes('terrace') || s.includes('garden') || s.includes('patio') || s.includes('pool') || s.includes('swimming') || s.includes('outdoor') || s.includes('hot tub') || s.includes('bbq')
      ) {
        groups.outdoor.push(a)
      } else if (
        s.includes('heating') || s.includes('flooring') || s.includes('air') || s.includes('conditioning') || s.includes('ac') || s.includes('elevator') || s.includes('parking') || s.includes('washer') || s.includes('dryer') || s.includes('iron') || s.includes('workspace') || s.includes('king bed') || s.includes('gym') || s.includes('breakfast') || s.includes('ev charger') || s.includes('crib')
      ) {
        groups.comfort.push(a)
      } else {
        groups.other.push(a)
      }
    }
    return groups
  }, [property?.amenities])

  // Safe early return after hooks: render Not Found page and stop
  if (!property) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Header forceBackground={true} />
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Property Not Found</h1>
          <p className="text-gray-400 mb-8">The property you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      
      {/* Image Gallery Section - Top Position like Artin Properties */}
      <section className="pt-20 pb-8 bg-black">
        <div className="max-w-[1800px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" id="image-gallery-container">
          {/* Mobile: Swipe slider */}
          <div className="md:hidden -mx-4">
            <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth space-x-4 px-4 touch-pan-x select-none">
              {property?.images?.map((src, index) => (
                <div
                  key={index}
                  className="snap-start shrink-0 w-full min-w-full h-[60vh] rounded-2xl overflow-hidden bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setIsModalOpen(true)
                  }}
                >
                  <img
                    src={getProxiedImageUrl(src)}
                    alt={`${property.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const fallback = property.images.find(Boolean) || ''
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = getProxiedImageUrl(fallback)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Wide Image Grid */}
          <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-6 h-[600px] xl:h-[700px] 2xl:h-[800px] max-w-full">
            {/* Large Main Image - Top Left (2x2) */}
            <div 
              className="col-span-2 row-span-2 group relative overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(0)
                setIsModalOpen(true)
              }}
            >
              <img
                src={getProxiedImageUrl(property?.images?.[0] || '')}
                alt={`${property.title} - Image 1`}
                className="w-full h-full object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  const fallback = property.images.find(Boolean) || ''
                  if (fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.src = getProxiedImageUrl(fallback)
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
        </div>

            {/* Top Right Images */}
            {[1, 2].map((index) => (
              <div 
                key={index}
                className="col-span-1 row-span-1 group relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index)
                  setIsModalOpen(true)
                }}
              >
                <img
                  src={getProxiedImageUrl(property?.images?.[index] || property?.images?.[0] || '')}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const fallback = property.images.find(Boolean) || ''
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = getProxiedImageUrl(fallback)
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
            ))}

            {/* Middle Right Images */}
            {[3, 4].map((index) => (
              <div 
                key={index}
                className="col-span-1 row-span-1 group relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index)
                  setIsModalOpen(true)
                }}
              >
                <img
                  src={getProxiedImageUrl(property?.images?.[index] || property?.images?.[0] || '')}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const fallback = property.images.find(Boolean) || ''
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = getProxiedImageUrl(fallback)
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
            ))}

            {/* Bottom Row Images */}
            {[5, 6, 7].map((index) => (
              <div 
                key={index}
                className="col-span-1 row-span-1 group relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index)
                  setIsModalOpen(true)
                }}
              >
                <img
                  src={getProxiedImageUrl(property?.images?.[index] || property?.images?.[0] || '')}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const fallback = property.images.find(Boolean) || ''
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = getProxiedImageUrl(fallback)
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
            ))}

            {/* "See All Photos" Button Overlay on Last Image */}
            <div 
              className="col-span-1 row-span-1 group relative overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => setCurrentImageIndex(8)}
            >
              <img
                src={getProxiedImageUrl(property?.images?.[8] || property?.images?.[0] || '')}
                alt={`${property.title} - Image 9`}
                className="w-full h-full object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  const fallback = property.images.find(Boolean) || ''
                  if (fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.src = getProxiedImageUrl(fallback)
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors duration-300" />
              
              {/* "See All Photos" Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
                  </div>
                  <div className="text-white font-bold text-sm">See All Photos</div>
                  <div className="text-white/80 text-xs">+{(property?.images?.length || 0) - 8} more</div>
                </div>
              </div>
            </div>
        </div>

          {/* Property Title Section - Below Images like Artin Properties */}
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column - Property Details */}
              <div className="lg:col-span-8 xl:col-span-8">
                {/* Property Type Tags */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                    {property.type.replace('-', ' ')}
                  </span>
                  <span className="bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                    Swift Luxury Operated
                  </span>
                </div>
                
                {/* Property Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {property.title}
                </h1>
                
                {/* Property Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center bg-gray-900 rounded-xl p-4">
                    <HomeIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{property.bedrooms}</div>
                    <div className="text-gray-400 text-sm">Bedrooms</div>
                  </div>
                  <div className="text-center bg-gray-900 rounded-xl p-4">
                    <ShieldCheckIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{property.bathrooms}</div>
                    <div className="text-gray-400 text-sm">Bathrooms</div>
                  </div>
                  <div className="text-center bg-gray-900 rounded-xl p-4">
                    <UserGroupIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{property.guests}</div>
                    <div className="text-gray-400 text-sm">max. guests</div>
                  </div>
                  <div className="text-center bg-gray-900 rounded-xl p-4">
                    <MapPinIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">250m²</div>
                    <div className="text-gray-400 text-sm">Size</div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center space-x-2 text-gray-400 mb-8">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-lg">{property.location}</span>
              </div>
              
                {/* Lease Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Lease length:</div>
                    <div className="text-white font-semibold">3-12 months</div>
                </div>
                <div>
                    <div className="text-gray-400 text-sm mb-1">Available from:</div>
                    <div className="text-white font-semibold">Immediately</div>
                </div>
              </div>
              
                {/* Overview Section - Moved below lease details */}
                <div className="bg-gray-900 rounded-2xl p-8 mt-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {property.description}
                  </p>
                </div>

                {/* Amenities Section - Directly under Overview */}
                <div className="bg-gray-900 rounded-2xl p-8 mt-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Amenities</h2>
                  
                  {/* Amenities Grid with Icons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Kitchen Amenities */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Kitchen</span>
                </div>

                {/* Inline Map for this Listing - placed after House Rules below */}
                      <div className="space-y-2">
                        {amenityGroups.kitchen.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{amenity}</span>
                </div>
                        ))}
                </div>
              </div>

                    {/* Comfort Amenities */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <HomeIcon className="w-6 h-6 text-amber-400" />
            </div>
                        <span className="text-white font-semibold">Comfort</span>
          </div>
                      <div className="space-y-2">
                        {amenityGroups.comfort.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{amenity}</span>
        </div>
                        ))}
                </div>
              </div>

                    {/* Technology */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Technology</span>
                      </div>
                      <div className="space-y-2">
                        {amenityGroups.technology.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                </div>

                    {/* Bathroom */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Bathroom</span>
                    </div>
                      <div className="space-y-2">
                        {amenityGroups.bathroom.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outdoor */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Outdoor</span>
                    </div>
                      <div className="space-y-2">
                        {amenityGroups.outdoor.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
            </div>

                  {/* Signature Property Badge */}
                  <div className="mt-8 text-center">
                    <span className="bg-amber-500/20 text-amber-400 px-6 py-3 rounded-full text-sm font-bold border border-amber-500/30">
                      ⭐ Signature Property
                    </span>
                  </div>
                </div>

                {/* House Rules Section - Moved to bottom with icons */}
                <div className="bg-gray-900 rounded-2xl p-8 mt-6">
                  <h2 className="text-2xl font-bold text-white mb-6">House Rules</h2>
                  
                  {/* House Rules Grid with Icons - Single row on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Check In/Out Times */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Check In/Out</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">Check In: {override?.houseRulesStructured?.checkIn || '3:00 PM'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">Check Out: {override?.houseRulesStructured?.checkOut || '11:00 AM'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Guest Policies */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <UserGroupIcon className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-white font-semibold">Guests</span>
                      </div>
                      <div className="space-y-2">
                        {(override?.houseRulesStructured?.guests ?? ['Children allowed','Infants allowed','No pets allowed']).map((txt: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2">
                            {(txt.toLowerCase().includes('no ') ? <XMarkIcon className="w-4 h-4 text-red-400 flex-shrink-0" /> : <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />)}
                            <span className="text-gray-300 text-sm">{txt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Rules */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <ShieldCheckIcon className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-white font-semibold">Safety Rules</span>
                      </div>
                      <div className="space-y-2">
                        {(override?.houseRulesStructured?.safety ?? ['No smoking inside','No parties/events']).map((txt: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <XMarkIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{txt}</span>
                          </div>
                        ))}
                      </div>

                

                
              </div>

                    {/* Cancellation Policy */}
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800 overflow-hidden">
                      <div className="flex items-start space-x-3 mb-3 pr-2">
                        <div className="bg-amber-500/20 rounded-lg p-2">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span
                          className="flex-1 min-w-0 text-white font-semibold text-sm sm:text-base leading-tight break-words whitespace-normal"
                          style={{ hyphens: 'auto', WebkitHyphens: 'auto', msHyphens: 'auto', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        >
                          {"Cancella\u00ADtion"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(override?.houseRulesStructured?.cancellation ?? ['Free cancellation for 48hrs','Full refund if cancelled early']).map((txt: string, idx: number) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm leading-snug break-words whitespace-normal">{txt}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                </div>

                {/* Map removed per request */}

              </div>
            </div>

              {/* Right Column - Pricing & Actions */}
              <div className="lg:col-span-4 xl:col-span-4">
                {/* Book Now Calendar Section - Moved Above Pricing */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
                  <h3 className="text-white font-semibold mb-4">Book Now</h3>
                  <p className="text-gray-400 text-sm mb-6">Select your check‑in and check‑out dates below.</p>
                  <div className="mb-6">
                    <PublicCalendar
                      availability={availability as any}
                      monthlyPrice={property.price}
                      onChange={(start, end)=>{ setSelectedStart(start); setSelectedEnd(end) }}
                    />
                  </div>

                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Check In</label>
                      <input
                        readOnly
                        value={selectedStart || ''}
                        placeholder="Select on calendar"
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Check Out</label>
                      <input
                        readOnly
                        value={selectedEnd || ''}
                        placeholder="Select on calendar"
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="bg-black/40 rounded-lg p-4 border border-gray-700 mb-6">
                    {bookingSummary && !bookingSummary.unavailable ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">€{nightlyFallback} × {bookingSummary.nights} nights</span>
                          <span className="text-white">€{bookingSummary.total.toLocaleString('de-DE')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Damage Deposit</span>
                          <span className="text-white">€{Number(damageDepositForSelection||0).toLocaleString('de-DE')}</span>
                        </div>
                        <hr className="border-gray-700" />
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-white text-lg">€{(bookingSummary.total + Number(damageDepositForSelection||0)).toLocaleString('de-DE')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Select valid dates to see prices.</div>
                    )}
                  </div>

                  {/* Reserve Button */}
                  <button
                    disabled={!bookingSummary || bookingSummary.unavailable || !selectedStart || !selectedEnd}
                    onClick={() => {
                      if (!bookingSummary || bookingSummary.unavailable || !selectedStart || !selectedEnd) return
                      setProcessing(true)
                      const qs = new URLSearchParams({
                        id: property.id,
                        title: property.title,
                        img: property.images?.[0] || '',
                        checkin: selectedStart,
                        checkout: selectedEnd,
                        nights: String(bookingSummary.nights),
                        subtotal: String(bookingSummary.total)
                      }).toString()
                      setTimeout(() => {
                        window.location.href = `/request?${qs}`
                      }, 2000)
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors mb-4"
                  >
                    Reserve Now
                  </button>
                  
                  <p className="text-gray-400 text-xs text-center">You won't be charged yet</p>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-24">
                  <div className="text-center mb-6">
                    {property.id === 'berlin-real-5' ? (
                      <>
                        <div className="text-3xl font-bold text-white mb-2">Inquire Now</div>
                        <div className="text-gray-400 text-sm">Price upon request</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-white mb-2">
                          €{property.price.toLocaleString('de-DE')}
                        </div>
                        <div className="text-gray-400 text-lg">/ {property.priceUnit}</div>
                        <div className="text-amber-400 text-sm mt-2">Bills excluded, deposit required</div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Apply to Rent Button with ArtinAI-style border animation */}
                    <button className="relative w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-full transition-all duration-300 transform hover:scale-105 border border-gray-600 overflow-hidden">
                      {/* ArtinAI-style animated border */}
                      <div className="absolute inset-0 rounded-full">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-transparent via-amber-400 to-transparent bg-clip-border animate-spin" style={{
                          background: 'conic-gradient(from 0deg, transparent, rgba(156, 163, 175, 0.5), rgba(245, 158, 11, 1), rgba(156, 163, 175, 0.5), transparent)',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          padding: '2px',
                          animation: 'artinai-border 2s linear infinite'
                        }}></div>
                      </div>
                      
                      {/* Button content */}
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Apply to Rent Monthly</span>
                      </span>
                    </button>
                    <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-colors backdrop-blur-sm">
                      Chat with Landlord
                    </button>
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors backdrop-blur-sm">
                      Book a Viewing
                    </button>
                  </div>

                  {/* Property Features */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-white font-semibold mb-4">Property Features:</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Property Size</span>
                        <span className="text-white">250 m²</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Furnished</span>
                        <span className="text-white">Yes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Registration</span>
                        <span className="text-white">Possible</span>
                      </div>
                    </div>
                  </div>
                </div>

                

                {/* Tenant Protection Section */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mt-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-500/20 rounded-lg p-3 flex-shrink-0">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-6v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">Covered by Tenant Protection</h3>
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        You're guaranteed a stress-free move-in or your money back.
                      </p>
                      <button className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                        How you're protected →
                    </button>
                    </div>
                  </div>
                  
                  {/* Protection Features */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500/20 rounded-full p-1">
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm">Stress-free move-in guarantee</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500/20 rounded-full p-1">
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm">Quick support if issues arise</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500/20 rounded-full p-1">
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm">Easy refund if property doesn't match</span>
                      </div>
                    </div>
                  </div>
                  </div>

                
              </div>

              

            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(false)
            }}
            className="absolute top-6 right-6 z-[10000] bg-amber-500/80 hover:bg-amber-500 text-black p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
          >
            <XMarkIcon className="w-8 h-8 stroke-2" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-6 left-6 z-60 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentImageIndex + 1} / {(property?.images?.length || 0)}
          </div>

          {/* Main Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getProxiedImageUrl(property?.images?.[currentImageIndex] || '')}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="max-w-[90%] max-h-[90%] object-contain rounded-2xl"
              style={{ outline: 'none', border: 'none' }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                const fallback = property?.images?.[0] || ''
                if (fallback && e.currentTarget.src !== fallback) {
                  e.currentTarget.src = getProxiedImageUrl(fallback)
                }
              }}
            />
          </div>

          {/* Navigation Arrows - Matching Homepage Style */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const newIndex = currentImageIndex === 0 
                ? property.images.length - 1 
                : currentImageIndex - 1
              setCurrentImageIndex(newIndex)
            }}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-[10000] bg-black/60 hover:bg-black/80 text-amber-400 p-4 rounded-full transition-all duration-300 border border-amber-400 hover:scale-110"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              const newIndex = currentImageIndex === property.images.length - 1 
                ? 0 
                : currentImageIndex + 1
              setCurrentImageIndex(newIndex)
            }}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-[10000] bg-black/60 hover:bg-black/80 text-amber-400 p-4 rounded-full transition-all duration-300 border border-amber-400 hover:scale-110"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>


          {/* Property Info Overlay */}
          <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl max-w-md">
            <h3 className="font-bold text-lg mb-2">{property.title}</h3>
            <p className="text-gray-300 text-sm">{property.location}</p>
            <p className="text-amber-400 text-sm mt-2">€{(property?.price || 0).toLocaleString('de-DE')}/month</p>
          </div>
        </div>
      )}

      <Footer />

      {/* Processing modal */}
      {processing && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black border border-amber-500/40 rounded-2xl px-8 py-10 text-center shadow-2xl w-[320px]">
            <div className="mx-auto mb-4 w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
            <div className="text-amber-300 font-semibold">Request Processing…</div>
          </div>
        </div>
      )}
    </main>
  )
}
