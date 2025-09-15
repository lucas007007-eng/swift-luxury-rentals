'use client'

import React from 'react'
import SearchInterface from './SearchInterface'

interface HeroProps {
  onCitySelect?: (city: string) => void
  selectedCity?: string
}

const Hero: React.FC<HeroProps> = ({ onCitySelect, selectedCity = 'Berlin' }) => {

  return (
    <section className="relative bg-black overflow-x-hidden pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-40 lg:pb-20 w-full">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="none"
          loading="lazy"
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.2) saturate(1.3) brightness(1.4)',
            imageRendering: 'auto'
          }}
          poster="https://images.unsplash.com/photo-1587564979-6d4b7d0cb2b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=60"
        >
          <source src="/videos/swift luxury home.mp4" type="video/mp4" />
          <source src="/videos/swift luxury home.webm" type="video/webm" />
          {/* Fallback image if video doesn't load */}
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1587564979-6d4b7d0cb2b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=60')`
            }}
          />
        </video>
      </div>
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <div className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
          
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
