'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, CalendarDaysIcon, UserGroupIcon, MapPinIcon, HomeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import MiniDateRange from './MiniDateRange'

interface SearchInterfaceProps {
  onSearch?: (searchData: SearchData) => void
  className?: string
  initialDestination?: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
  initialAdults?: number
  initialChildren?: number
  initialInfants?: number
  initialPets?: number
  initialMode?: 'homes' | 'concierge'
  initialService?: string
}

interface SearchData {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, className = '', initialDestination, initialCheckIn, initialCheckOut, initialGuests, initialAdults, initialChildren, initialInfants, initialPets, initialMode, initialService }) => {
  const router = useRouter()
  const [mode, setMode] = useState<'homes' | 'concierge'>('homes')
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  // Guests breakdown (adults + children = guests summary)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)
  const [showDestinations, setShowDestinations] = useState(false)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [guestDropdownPosition, setGuestDropdownPosition] = useState({ top: 0, left: 0 })
  const [dateDropdownPosition, setDateDropdownPosition] = useState({ top: 0, left: 0 })
  const [serviceDropdownPosition, setServiceDropdownPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [service, setService] = useState('')
  const [bubble, setBubble] = useState<{left:number; top:number; width:number; height:number; visible:boolean}>({left:0,top:0,width:0,height:0,visible:false})

  const wrapperRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<HTMLDivElement>(null)
  const checkInRef = useRef<HTMLInputElement>(null)
  const checkOutRef = useRef<HTMLInputElement>(null)
  const checkInAnchorRef = useRef<HTMLDivElement>(null)
  const checkOutAnchorRef = useRef<HTMLDivElement>(null)
  const dateDropdownRef = useRef<HTMLDivElement>(null)

  // European cities with descriptions
  const destinations = [
    { 
      city: 'Berlin, Germany', 
      description: 'Capital with rich history and vibrant culture',
      icon: '🇩🇪'
    },
    { 
      city: 'Paris, France', 
      description: 'City of Light and romance',
      icon: '🇫🇷'
    },
    { 
      city: 'Amsterdam, Netherlands', 
      description: 'Canals, museums, and cycling culture',
      icon: '🇳🇱'
    },
    { 
      city: 'Vienna, Austria', 
      description: 'Imperial architecture and classical music',
      icon: '🇦🇹'
    },
    { 
      city: 'Barcelona, Spain', 
      description: 'Mediterranean beaches and Gaudí architecture',
      icon: '🇪🇸'
    },
    { 
      city: 'London, United Kingdom', 
      description: 'Historic landmarks and modern attractions',
      icon: '🇬🇧'
    },
    { 
      city: 'Rome, Italy', 
      description: 'Ancient history and incredible cuisine',
      icon: '🇮🇹'
    },
    { 
      city: 'Prague, Czech Republic', 
      description: 'Medieval charm and stunning architecture',
      icon: '🇨🇿'
    },
    { 
      city: 'Copenhagen, Denmark', 
      description: 'Scandinavian design and cozy atmosphere',
      icon: '🇩🇰'
    },
    { 
      city: 'Zurich, Switzerland', 
      description: 'Alpine beauty and financial hub',
      icon: '🇨🇭'
    }
  ]

  const services = [
    { key: 'chauffeur', label: 'Chauffeur', icon: '🎩' },
    { key: 'chef', label: 'Chef', icon: '👨‍🍳' },
    { key: 'nanny', label: 'Nanny', icon: '🧸' },
    { key: 'security', label: 'Security Guard', icon: '🛡️' }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize state from provided initial values (e.g., from city page query params)
  useEffect(() => {
    if (initialMode) setMode(initialMode)
    if (initialDestination && !destination) setDestination(initialDestination)
    if (initialCheckIn && !checkIn) setCheckIn(initialCheckIn)
    if (initialCheckOut && !checkOut) setCheckOut(initialCheckOut)
    if (initialService) setService(initialService)
    // Prefer breakdown; fallback to total guests
    if (typeof initialAdults === 'number') setAdults(Math.max(1, initialAdults))
    if (typeof initialChildren === 'number') setChildren(Math.max(0, initialChildren))
    if (typeof initialInfants === 'number') setInfants(Math.max(0, initialInfants))
    if (typeof initialPets === 'number') setPets(Math.max(0, initialPets))
    if (typeof initialGuests === 'number' && initialAdults === undefined && initialChildren === undefined) {
      const total = Math.max(1, initialGuests)
      setAdults(Math.max(1, total))
    }
  }, [initialDestination, initialCheckIn, initialCheckOut, initialGuests, initialAdults, initialChildren, initialInfants, initialPets])

  // Helpers to change counts safely
  const totalGuests = adults + children
  const increment = (key: 'adults' | 'children' | 'infants' | 'pets') => {
    if (key === 'adults') {
      if (totalGuests >= 16) return
      setAdults((v) => v + 1)
      return
    }
    if (key === 'children') {
      if (totalGuests >= 16) return
      setChildren((v) => v + 1)
      return
    }
    if (key === 'infants') {
      setInfants((v) => v + 1)
      return
    }
    if (key === 'pets') {
      setPets((v) => v + 1)
    }
  }

  const decrement = (key: 'adults' | 'children' | 'infants' | 'pets') => {
    if (key === 'adults') {
      setAdults((v) => Math.max(1, v - 1))
      return
    }
    if (key === 'children') {
      setChildren((v) => Math.max(0, v - 1))
      return
    }
    if (key === 'infants') {
      setInfants((v) => Math.max(0, v - 1))
      return
    }
    if (key === 'pets') {
      setPets((v) => Math.max(0, v - 1))
    }
  }

  // Calculate positions for portals
  const calculatePositions = () => {
    if (destinationRef.current) {
      const rect = destinationRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
    if (guestRef.current) {
      const rect = guestRef.current.getBoundingClientRect()
      setGuestDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 320
      })
    }
    if (serviceRef.current) {
      const rect = serviceRef.current.getBoundingClientRect()
      setServiceDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 320
      })
    }
    if (checkInAnchorRef.current) {
      const rect = checkInAnchorRef.current.getBoundingClientRect()
      setDateDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
    // bubble animation removed
  }

  const getAnchorForField = (field: string | null): HTMLElement | null => {
    if (field === 'destination') return destinationRef.current
    if (field === 'checkin') return checkInAnchorRef.current
    if (field === 'checkout') return checkOutAnchorRef.current
    if (field === 'guests') return guestRef.current
    return null
  }

  const updateBubble = () => {
    const anchor = getAnchorForField(focusedField)
    const wrapper = wrapperRef.current
    if (!anchor || !wrapper) { setBubble(b=>({ ...b, visible:false })); return }
    const a = anchor.getBoundingClientRect()
    const w = wrapper.getBoundingClientRect()
    setBubble({ left: a.left - w.left + 4, top: a.top - w.top + 4, width: a.width - 8, height: a.height - 8, visible: true })
  }

  const focusField = (field: 'destination' | 'checkin' | 'checkout' | 'guests') => {
    setFocusedField(field)
    // Ensure layout is ready before measuring. Do two RAFs to avoid first-click race.
    requestAnimationFrame(() => {
      calculatePositions();
      // bubble removed
      requestAnimationFrame(() => {/* no-op */})
    })
  }

  // bubble animation removed
  useEffect(() => { const onResize = () => calculatePositions(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize) }, [])

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (destinationRef.current && !destinationRef.current.contains(target)) {
        setShowDestinations(false)
      }
      if (guestRef.current && !guestRef.current.contains(target)) {
        setShowGuestSelector(false)
      }
      if (serviceRef.current && !serviceRef.current.contains(target)) {
        setShowServiceSelector(false)
      }
      // Close date range when clicking outside of its dropdown and anchor
      if (
        (focusedField === 'checkin' || focusedField === 'checkout') &&
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(target) &&
        (!checkInAnchorRef.current || !checkInAnchorRef.current.contains(target))
      ) {
        setFocusedField(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [focusedField])

  const handleSearch = () => {
    const searchData: SearchData = {
      destination,
      checkIn,
      checkOut,
      guests: adults + children
    }
    
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (checkIn) params.set('checkin', checkIn)
    if (checkOut) params.set('checkout', checkOut)
    params.set('guests', (adults + children).toString())
    params.set('adults', adults.toString())
    if (children > 0) params.set('children', children.toString())
    if (infants > 0) params.set('infants', infants.toString())
    if (pets > 0) params.set('pets', pets.toString())
    if (mode === 'concierge' && service) params.set('service', service)
    // Prefer city route if destination chosen
    const cityMatch = destination ? destination.split(',')[0].trim() : ''
    if (mode === 'concierge') {
      router.push(`/concierge?${params.toString()}`)
    } else if (cityMatch) {
      router.push(`/city/${encodeURIComponent(cityMatch)}?${params.toString()}`)
    } else {
      router.push(`/properties?${params.toString()}`)
    }
    onSearch?.(searchData)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <>
      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-6 mb-5">
        <button onClick={()=>setMode('homes')} className="group">
          <div className={`flex items-center gap-3 rounded-full px-5 py-3 shadow-md backdrop-blur ring-1 transition-colors ${
            mode==='homes' ? 'bg-white/90 text-gray-900 ring-black/10' : 'bg-white/60 text-gray-700 ring-black/10 hover:bg-white/80'
          }`}>
            <div className={`grid place-items-center rounded-full w-8 h-8 ${mode==='homes' ? 'bg-gray-900 text-white' : 'bg-gray-800/80 text-white'}`}>
              <HomeIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide">Homes</span>
          </div>
        </button>
        <button onClick={()=>setMode('concierge')} className="group">
          <div className={`flex items-center gap-3 rounded-full px-5 py-3 shadow-md backdrop-blur ring-1 transition-colors ${
            mode==='concierge' ? 'bg-white/90 text-gray-900 ring-black/10' : 'bg-white/60 text-gray-700 ring-black/10 hover:bg-white/80'
          }`}>
            <div className={`grid place-items-center rounded-full w-8 h-8 ${mode==='concierge' ? 'bg-gray-900 text-white' : 'bg-gray-800/80 text-white'}`}>
              <SparklesIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide">Concierge</span>
          </div>
        </button>
      </div>

      <div ref={wrapperRef} className={`bg-white shadow-2xl border border-gray-200 relative ${className} rounded-2xl sm:rounded-full`}>
        {/* Focus bubble removed per request */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:divide-x sm:divide-gray-300">
          
          {/* Destination Selector */}
          <div className="relative flex-1" ref={destinationRef}>
            <button
              onClick={() => {
                const newShow = !showDestinations
                setShowDestinations(newShow)
                focusField('destination')
              }}
              className={`w-full px-6 py-5 sm:py-4 text-left rounded-full sm:rounded-l-full sm:rounded-r-none transition-colors ${
                focusedField === 'destination'
                  ? 'bg-black text-white ring-1 ring-white/10'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPinIcon className={`w-5 h-5 ${focusedField === 'destination' ? 'text-amber-400' : 'text-gray-400'}`} />
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${focusedField === 'destination' ? 'text-white' : 'text-gray-900'}`}>
                    Where
                  </div>
                  <div className={`text-sm ${focusedField === 'destination' ? 'text-white/80' : 'text-gray-600'}`}>
                    {destination || 'Search destinations'}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Check-in Date */}
          <div className="flex-1 border-t sm:border-t-0 border-gray-200" ref={checkInAnchorRef}>
            <div
              className={`px-6 py-5 sm:py-4 transition-colors cursor-pointer rounded-none ${
                focusedField === 'checkin'
                  ? 'bg-black text-white ring-1 ring-white/10'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => {
                if (focusedField === 'checkin') {
                  setFocusedField(null)
                } else {
                  focusField('checkin')
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className={`w-5 h-5 ${focusedField === 'checkin' ? 'text-amber-400' : 'text-gray-400'}`} />
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${focusedField === 'checkin' ? 'text-white' : 'text-gray-900'}`}>
                    Check in
                  </div>
                  {!checkIn ? (
                    <div className={`text-sm ${focusedField === 'checkin' ? 'text-white/80' : 'text-gray-500'}`}>Add dates</div>
                  ) : (
                    <div className={`text-sm ${focusedField === 'checkin' ? 'text-white' : 'text-gray-600'}`}>{formatDate(checkIn)}</div>
                  )}
                  <input ref={checkInRef} type="hidden" value={checkIn} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Check-out Date */}
          <div className="flex-1 border-t sm:border-t-0 border-gray-200" ref={checkOutAnchorRef}>
            <div
              className={`px-6 py-5 sm:py-4 transition-colors cursor-pointer rounded-none ${
                focusedField === 'checkout'
                  ? 'bg-black text-white ring-1 ring-white/10'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => {
                if (focusedField === 'checkout') {
                  setFocusedField(null)
                } else {
                  focusField('checkout')
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className={`w-5 h-5 ${focusedField === 'checkout' ? 'text-amber-400' : 'text-gray-400'}`} />
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${focusedField === 'checkout' ? 'text-white' : 'text-gray-900'}`}>
                    Check out
                  </div>
                  {!checkOut ? (
                    <div className={`text-sm ${focusedField === 'checkout' ? 'text-white/80' : 'text-gray-500'}`}>Add dates</div>
                  ) : (
                    <div className={`text-sm ${focusedField === 'checkout' ? 'text-white' : 'text-gray-600'}`}>{formatDate(checkOut)}</div>
                  )}
                  <input ref={checkOutRef} type="hidden" value={checkOut} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Guests or Service Selector based on mode */}
          {mode === 'homes' ? (
            <div className="relative flex-1 border-t sm:border-t-0 border-gray-200" ref={guestRef}>
              <button
                onClick={() => {
                  const newShow = !showGuestSelector
                  setShowGuestSelector(newShow)
                  focusField('guests')
                }}
                className={`w-full px-6 py-5 sm:py-4 text-left transition-colors ${
                  focusedField === 'guests'
                    ? 'bg-black text-white ring-1 ring-white/10'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className={`w-5 h-5 ${focusedField === 'guests' ? 'text-amber-400' : 'text-gray-400'}`} />
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${focusedField === 'guests' ? 'text-white' : 'text-gray-900'}`}>
                      Who
                    </div>
                    <div className={`text-sm ${focusedField === 'guests' ? 'text-white/80' : 'text-gray-600'}`}>
                      {(() => {
                        const total = adults + children
                        const parts = [`${total} guest${total !== 1 ? 's' : ''}`]
                        if (infants > 0) parts.push(`${infants} infant${infants !== 1 ? 's' : ''}`)
                        if (pets > 0) parts.push(`${pets} pet${pets !== 1 ? 's' : ''}`)
                        return parts.join(', ')
                      })()}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="relative flex-1 border-t sm:border-t-0 border-gray-200" ref={serviceRef}>
              <button
                onClick={() => {
                  const newShow = !showServiceSelector
                  setShowServiceSelector(newShow)
                  focusField('guests')
                }}
                className={`w-full px-6 py-5 sm:py-4 text-left transition-colors ${
                  focusedField === 'guests'
                    ? 'bg-black text-white ring-1 ring-white/10'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${focusedField === 'guests' ? 'text-amber-400' : 'text-gray-400'}`}>🛎️</span>
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${focusedField === 'guests' ? 'text-white' : 'text-gray-900'}`}>
                      Service
                    </div>
                    <div className={`text-sm ${focusedField === 'guests' ? 'text-white/80' : 'text-gray-600'}`}>{service || 'Choose service'}</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Search Button */}
          <div className="px-2 py-2 sm:px-2 sm:py-2 border-t sm:border-t-0 border-gray-200">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-xl sm:rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="sm:hidden font-semibold">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portal Dropdowns - Rendered at body level */}
      {mounted && showDestinations && createPortal(
        <div 
          className="absolute w-full sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] mx-4 sm:mx-0"
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: window.innerWidth < 640 ? '16px' : `${dropdownPosition.left}px`,
            right: window.innerWidth < 640 ? '16px' : 'auto',
            position: 'absolute',
            maxWidth: window.innerWidth < 640 ? 'calc(100vw - 32px)' : '320px'
          }}
        >
          <div className="p-4" onMouseDown={(e)=>e.stopPropagation()} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular destinations</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {destinations.map((dest) => (
                <button
                  key={dest.city}
                  onClick={() => {
                    setDestination(dest.city)
                    setShowDestinations(false)
                    focusField('checkin')
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="text-2xl">{dest.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{dest.city}</div>
                    <div className="text-xs text-gray-500">{dest.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {mounted && showGuestSelector && createPortal(
        <div 
          className="absolute w-full sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] mx-4 sm:mx-0"
          style={{
            top: `${guestDropdownPosition.top + 8}px`,
            left: window.innerWidth < 640 ? '16px' : `${guestDropdownPosition.left}px`,
            right: window.innerWidth < 640 ? '16px' : 'auto',
            position: 'absolute',
            maxWidth: window.innerWidth < 640 ? 'calc(100vw - 32px)' : '320px'
          }}
        >
          <div className="p-6 space-y-6" onMouseDown={(e)=>e.stopPropagation()} onClick={(e)=>e.stopPropagation()}>
            {[
              { key: 'adults', label: 'Adults', sub: 'Ages 13 or above', value: adults, min: 1 },
              { key: 'children', label: 'Children', sub: 'Ages 2 – 12', value: children, min: 0 },
              { key: 'infants', label: 'Infants', sub: 'Under 2', value: infants, min: 0 },
              { key: 'pets', label: 'Pets', sub: '', value: pets, min: 0 },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{row.label}</div>
                  <div className="text-sm text-gray-500">{row.sub}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => decrement(row.key as any)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-50 disabled:hover:border-gray-300"
                    disabled={row.key === 'adults' ? row.value <= row.min : row.value <= row.min}
                  >
                    <span className="text-gray-600">−</span>
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{row.value}</span>
                  <button
                    onClick={() => increment(row.key as any)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-50 disabled:hover:border-gray-300"
                    disabled={(row.key === 'adults' || row.key === 'children') && (adults + children) >= 16}
                  >
                    <span className="text-gray-600">+</span>
                  </button>
                </div>
              </div>
            ))}
            {/* Optional helper/footer row can go here */}
          </div>
        </div>,
        document.body
      )}

      {mounted && showServiceSelector && createPortal(
        <div 
          className="absolute w-full sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] mx-4 sm:mx-0"
          style={{
            top: `${serviceDropdownPosition.top + 8}px`,
            left: window.innerWidth < 640 ? '16px' : `${serviceDropdownPosition.left}px`,
            right: window.innerWidth < 640 ? '16px' : 'auto',
            position: 'absolute',
            maxWidth: window.innerWidth < 640 ? 'calc(100vw - 32px)' : '320px'
          }}
        >
          <div className="p-6 space-y-2" onMouseDown={(e)=>e.stopPropagation()} onClick={(e)=>e.stopPropagation()}>
            <div className="text-sm font-semibold text-gray-900 mb-2">Select a service</div>
            {services.map(s=> (
              <button key={s.key} onClick={()=>{ setService(s.label); setShowServiceSelector(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm text-gray-800">{s.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {mounted && (focusedField === 'checkin' || focusedField === 'checkout') && createPortal(
        <div 
          className="absolute z-[9999] mx-4 sm:mx-0"
          style={{
            top: `${dateDropdownPosition.top + 8}px`,
            left: window.innerWidth < 640 ? '16px' : `${dateDropdownPosition.left}px`,
            right: window.innerWidth < 640 ? '16px' : 'auto',
            position: 'absolute',
            maxWidth: window.innerWidth < 640 ? 'calc(100vw - 32px)' : '700px'
          }}
          onClick={(e) => {
            // prevent outside-click handler from firing when clicking inside
            e.stopPropagation()
          }}
        >
          <div ref={dateDropdownRef}>
          <MiniDateRange
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            onPreview={(s, e) => {
              if (s !== null) {
                setCheckIn(s)
              }
              if (e !== null) {
                setCheckOut(e)
              } else if (s !== null) {
                // Prompt user to pick checkout by moving highlight
                setFocusedField('checkout')
              }
            }}
            onApply={(s, e) => {
              setCheckIn(s)
              setCheckOut(e)
              // After selecting checkout, advance to WHO and open the dropdown
              setShowGuestSelector(true)
              setFocusedField('guests')
              setTimeout(() => {
                calculatePositions()
              }, 0)
            }}
            onClose={() => setFocusedField(null)}
          />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default SearchInterface