'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, CalendarDaysIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface SearchInterfaceProps {
  onSearch?: (searchData: SearchData) => void
  className?: string
}

interface SearchData {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, className = '' }) => {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [showDestinations, setShowDestinations] = useState(false)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [guestDropdownPosition, setGuestDropdownPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  const destinationRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)
  const checkInRef = useRef<HTMLInputElement>(null)
  const checkOutRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    setMounted(true)
  }, [])

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
  }

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const searchData: SearchData = {
      destination,
      checkIn,
      checkOut,
      guests
    }
    
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (checkIn) params.set('checkin', checkIn)
    if (checkOut) params.set('checkout', checkOut)
    params.set('guests', guests.toString())
    
    router.push(`/properties?${params.toString()}`)
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
      <div className={`bg-white shadow-2xl border border-gray-200 relative ${className} rounded-2xl sm:rounded-full`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:divide-x sm:divide-gray-300">
          
          {/* Destination Selector */}
          <div className="relative flex-1" ref={destinationRef}>
            <button
              onClick={() => {
                const newShow = !showDestinations
                setShowDestinations(newShow)
                setFocusedField('destination')
                if (newShow) {
                  setTimeout(calculatePositions, 0)
                }
              }}
              className={`w-full px-6 py-5 sm:py-4 text-left rounded-t-2xl sm:rounded-t-none sm:rounded-l-full hover:bg-gray-50 transition-colors ${
                focusedField === 'destination' ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Where
                  </div>
                  <div className="text-sm text-gray-600">
                    {destination || 'Search destinations'}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Check-in Date */}
          <div className="flex-1 border-t sm:border-t-0 border-gray-200">
            <div
              className={`px-6 py-5 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                focusedField === 'checkin' ? 'bg-gray-50' : ''
              }`}
              onClick={() => {
                setFocusedField('checkin')
                checkInRef.current?.focus()
                checkInRef.current?.showPicker?.()
              }}
            >
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Check in
                  </div>
                  {!checkIn ? (
                    <div className="text-sm text-gray-500">Add dates</div>
                  ) : (
                    <div className="text-sm text-gray-600">{formatDate(checkIn)}</div>
                  )}
                  <input
                    ref={checkInRef}
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={getTodayDate()}
                    className="absolute opacity-0 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Check-out Date */}
          <div className="flex-1 border-t sm:border-t-0 border-gray-200">
            <div
              className={`px-6 py-5 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                focusedField === 'checkout' ? 'bg-gray-50' : ''
              }`}
              onClick={() => {
                setFocusedField('checkout')
                checkOutRef.current?.focus()
                checkOutRef.current?.showPicker?.()
              }}
            >
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Check out
                  </div>
                  {!checkOut ? (
                    <div className="text-sm text-gray-500">Add dates</div>
                  ) : (
                    <div className="text-sm text-gray-600">{formatDate(checkOut)}</div>
                  )}
                  <input
                    ref={checkOutRef}
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || getTomorrowDate()}
                    className="absolute opacity-0 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guests Selector */}
          <div className="relative flex-1 border-t sm:border-t-0 border-gray-200" ref={guestRef}>
            <button
              onClick={() => {
                const newShow = !showGuestSelector
                setShowGuestSelector(newShow)
                setFocusedField('guests')
                if (newShow) {
                  setTimeout(calculatePositions, 0)
                }
              }}
              className={`w-full px-6 py-5 sm:py-4 text-left hover:bg-gray-50 transition-colors ${
                focusedField === 'guests' ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Who
                  </div>
                  <div className="text-sm text-gray-600">
                    {guests} guest{guests !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          </div>

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
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular destinations</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {destinations.map((dest) => (
                <button
                  key={dest.city}
                  onClick={() => {
                    setDestination(dest.city)
                    setShowDestinations(false)
                    setFocusedField(null)
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
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Guests</div>
                <div className="text-sm text-gray-500">Ages 13 or above</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-50 disabled:hover:border-gray-300"
                  disabled={guests <= 1}
                >
                  <span className="text-gray-600">−</span>
                </button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(16, guests + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-50 disabled:hover:border-gray-300"
                  disabled={guests >= 16}
                >
                  <span className="text-gray-600">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default SearchInterface