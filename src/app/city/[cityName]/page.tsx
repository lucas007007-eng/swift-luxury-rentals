'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import SearchInterface from '@/components/SearchInterface'
import { cityProperties, cityInfo } from '@/data/cityProperties'

export default function CityPage() {
  const params = useParams()
  const cityName = params.cityName as string
  
  // Get properties for the selected city
  const properties = cityProperties[cityName] || []
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
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {currentCityInfo?.title || `${cityName} Luxury Rentals`}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
              {currentCityInfo?.description || `Discover luxury rental properties in ${cityName}.`}
            </p>
            <div className="text-lg text-gray-500">
              {properties.length} luxury properties available
            </div>
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

      {/* Properties Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <PropertyCard
                    property={property}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon to {cityName}</h3>
              <p className="text-gray-600 mb-6">We&apos;re expanding to {cityName}! Luxury properties will be available soon.</p>
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
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
