'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FunnelIcon, MapIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import SearchInterface from '@/components/SearchInterface'
import { Property } from '@/types'

// Extended sample property data
const allProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Loft in Mitte with City Views',
    description: 'Beautiful modern loft in the heart of Berlin with stunning city views and premium amenities.',
    price: 150,
    priceUnit: 'night',
    location: 'Mitte, Berlin',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Air Conditioning'],
    type: 'short-term',
    available: true,
    featured: true,
    discount: 15
  },
  {
    id: '2',
    title: 'Cozy Studio in Prenzlauer Berg',
    description: 'Charming studio apartment in trendy Prenzlauer Berg, perfect for digital nomads.',
    price: 1200,
    priceUnit: 'month',
    location: 'Prenzlauer Berg, Berlin',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'Desk', 'Balcony'],
    type: 'month-to-month',
    available: true
  },
  {
    id: '3',
    title: 'Family Apartment in Charlottenburg',
    description: 'Spacious family apartment near parks and excellent schools in elegant Charlottenburg.',
    price: 2400,
    priceUnit: 'month',
    location: 'Charlottenburg, Berlin',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Parking', 'Garden'],
    type: 'long-term',
    available: false,
    nextAvailable: new Date('2024-03-15')
  },
  {
    id: '4',
    title: 'Modern Apartment in Kreuzberg',
    description: 'Hip modern apartment in the cultural heart of Berlin with great nightlife access.',
    price: 120,
    priceUnit: 'night',
    location: 'Kreuzberg, Berlin',
    bedrooms: 1,
    bathrooms: 1,
    guests: 3,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Near Metro'],
    type: 'short-term',
    available: true,
    featured: true
  },
  {
    id: '5',
    title: 'Penthouse Suite in Tiergarten',
    description: 'Exclusive penthouse with panoramic city views and luxury amenities.',
    price: 300,
    priceUnit: 'night',
    location: 'Tiergarten, Berlin',
    bedrooms: 3,
    bathrooms: 3,
    guests: 6,
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Balcony', 'Gym', 'Concierge'],
    type: 'short-term',
    available: true,
    featured: true
  },
  {
    id: '6',
    title: 'Artist Loft in Friedrichshain',
    description: 'Creative space in vibrant Friedrichshain, perfect for artists and creatives.',
    price: 1400,
    priceUnit: 'month',
    location: 'Friedrichshain, Berlin',
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['WiFi', 'Kitchen', 'High Ceilings', 'Natural Light'],
    type: 'month-to-month',
    available: true
  }
]

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [filteredProperties, setFilteredProperties] = useState(allProperties)
  const [activeFilter, setActiveFilter] = useState<'all' | 'short-term' | 'month-to-month' | 'long-term'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchResults, setSearchResults] = useState<Property[]>(allProperties)

  // Handle search parameters from URL
  useEffect(() => {
    const destination = searchParams.get('destination')
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const guests = searchParams.get('guests')

    let filtered = allProperties

    // Filter by destination (city)
    if (destination) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(destination.toLowerCase()) ||
        destination.toLowerCase().includes(property.location.toLowerCase())
      )
    }

    // Filter by guest capacity
    if (guests) {
      const guestCount = parseInt(guests)
      filtered = filtered.filter(property => property.guests >= guestCount)
    }

    // TODO: Add date availability filtering when we have availability data
    // For now, we'll just filter available properties
    filtered = filtered.filter(property => property.available)

    setSearchResults(filtered)
    setFilteredProperties(filtered)
  }, [searchParams])

  const filterProperties = (type: typeof activeFilter) => {
    setActiveFilter(type)
    if (type === 'all') {
      setFilteredProperties(searchResults)
    } else {
      setFilteredProperties(searchResults.filter(property => property.type === type))
    }
  }

  const filters = [
    { key: 'all', label: 'All Rentals', count: searchResults.length },
    { key: 'short-term', label: 'Short Term', count: searchResults.filter(p => p.type === 'short-term').length },
    { key: 'month-to-month', label: 'Month to Month', count: searchResults.filter(p => p.type === 'month-to-month').length },
    { key: 'long-term', label: 'Long Term', count: searchResults.filter(p => p.type === 'long-term').length },
  ] as const

  const quickFilters = [
    'Available Today',
    'Budget Friendly',
    'Last Minute Deals',
    'New Listings',
    'Pet Friendly',
    'Unfurnished',
    'Work Ready'
  ]

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
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect Rental
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
              Discover premium rental properties across Berlin's most desirable neighborhoods.
            </p>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <SearchInterface />
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Filters */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => filterProperties(filter.key)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeFilter === filter.key
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FunnelIcon className="w-5 h-5" />
                <span>More Filters</span>
              </button>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ViewColumnsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Found
              </h2>
              {searchParams.get('destination') && (
                <p className="text-gray-600 mt-1">
                  Showing results for "{searchParams.get('destination')}"
                  {searchParams.get('guests') && ` • ${searchParams.get('guests')} guests`}
                  {searchParams.get('checkin') && searchParams.get('checkout') && 
                    ` • ${new Date(searchParams.get('checkin')!).toLocaleDateString()} - ${new Date(searchParams.get('checkout')!).toLocaleDateString()}`
                  }
                </p>
              )}
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
              <option>Most Popular</option>
            </select>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters for better matches!</p>
              <button
                onClick={() => filterProperties('all')}
                className="btn-primary"
              >
                Show All Properties
              </button>
            </div>
          )}

          {/* Load More Button */}
          {filteredProperties.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn-secondary">
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}





