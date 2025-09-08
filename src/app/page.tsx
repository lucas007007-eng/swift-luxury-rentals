'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import PropertyCard from '@/components/PropertyCard'
import About from '@/components/About'
import Locations from '@/components/Locations'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import { Property } from '@/types'
import { cityProperties, cityInfo } from '@/data/cityProperties'


export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Berlin')
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(cityProperties.Berlin)

  // Update displayed properties when city changes
  useEffect(() => {
    const properties = cityProperties[selectedCity] || []
    setDisplayedProperties(properties)
  }, [selectedCity])

  // Function to handle city selection
  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
  }

  const currentCityInfo = cityInfo[selectedCity as keyof typeof cityInfo]

  return (
    <main className="min-h-screen">
      <Header />
      <Hero onCitySelect={handleCitySelect} selectedCity={selectedCity} />
      
      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {currentCityInfo?.title || 'Premium Luxury Rentals'}
            </h2>
            <p className="text-xl font-semibold text-gray-700 max-w-3xl mx-auto">
              {currentCityInfo?.description || 'Discover our handpicked selection of luxury rental properties.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
            {displayedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
              />
            ))}
          </div>

          {/* No Properties Message */}
          {displayedProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon to {selectedCity}</h3>
              <p className="text-gray-600">We&apos;re expanding to {selectedCity}! Luxury properties will be available soon.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <button 
              onClick={() => router.push(`/city/${selectedCity}`)}
              className="btn-primary"
            >
              View All {selectedCity} Properties ({currentCityInfo?.count || 0})
            </button>
          </div>
        </div>
      </section>

      {/* Crypto Payment Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Revolutionary Crypto Rent Payments
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              The first platform in Berlin to accept cryptocurrency for rent payments. 
              We handle all the complexity - you just pay and move in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Crypto Payment */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-green-100">
              <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">₿</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pay with Crypto</h3>
              <div className="flex justify-center space-x-4 mb-4">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">BTC</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">ETH</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">USDT</span>
              </div>
              <p className="text-gray-600">
                Use Bitcoin, Ethereum, USDT, or traditional credit card payments
              </p>
            </div>

            {/* EU Compliance */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-blue-100">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🏦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">EU Compliant</h3>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <span className="text-blue-800 font-semibold">Fully Regulated</span>
              </div>
              <p className="text-gray-600">
                All transactions comply with European banking regulations and anti-money laundering laws
              </p>
            </div>

            {/* Seamless Conversion */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-purple-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Conversion</h3>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <span className="text-purple-800 font-semibold">Auto Bank Wire</span>
              </div>
              <p className="text-gray-600">
                We automatically convert crypto to fiat and wire transfer to landlords
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">1</span>
                  </div>
                  <p className="font-semibold">Choose Property</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">2</span>
                  </div>
                  <p className="font-semibold">Pay with Crypto/Card</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">3</span>
                  </div>
                  <p className="font-semibold">We Convert & Wire</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">4</span>
                  </div>
                  <p className="font-semibold">Move In!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <About />
      <Locations />
      <ContactForm />
      <Footer />
    </main>
  )
}
