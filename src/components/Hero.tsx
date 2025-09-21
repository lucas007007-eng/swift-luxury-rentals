'use client'

import React from 'react'
import SearchInterface from './SearchInterface'
import TunnelAnimation from './TunnelAnimation'

interface HeroProps {
  onCitySelect?: (city: string) => void
  selectedCity?: string
}

const Hero: React.FC<HeroProps> = ({ onCitySelect, selectedCity = 'Berlin' }) => {

  return (
    <section className="relative bg-black overflow-x-hidden pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 w-full" style={{ minHeight: '35vh' }}>
      {/* Tunnel Animation Background */}
      <div className="absolute inset-0 z-0">
        <TunnelAnimation />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full h-full flex items-center justify-center">
        <div className="space-y-6 sm:space-y-8 md:space-y-10 w-full">
          
          {/* Removed promotional badges and payment rows per request */}

          {/* Search Interface */}
          <div className="max-w-4xl lg:max-w-5xl mx-auto relative px-4 sm:px-0">
            <SearchInterface 
              onSearch={(searchData) => {
                console.log('Search data:', searchData)
                // Handle search functionality here
              }}
            />
          </div>
          {/* City pin list and "View All European Cities" removed per request */}
        </div>
      </div>
    </section>
  )
}

export default Hero
