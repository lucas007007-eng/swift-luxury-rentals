'use client'

import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'short-term' | 'month-to-month' | 'long-term'>('short-term')
  const [placeholderText, setPlaceholderText] = useState('')
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showAllCities, setShowAllCities] = useState(false)

  // European luxury rental search examples
  const searchExamples = [
    "luxury penthouse in Berlin Mitte",
    "executive apartment in Paris",
    "premium loft in Amsterdam",
    "designer apartment in Vienna", 
    "luxury suite in Barcelona",
    "executive flat in London",
    "premium apartment in Rome",
    "luxury studio in Prague",
    "designer loft in Copenhagen",
    "executive penthouse in Zurich"
  ]

  const tabs = [
    { id: 'short-term', label: '1 Month', description: 'Perfect for extended business trips' },
    { id: 'month-to-month', label: '1-6 Months', description: 'Our specialty - mid-term luxury stays' },
    { id: 'long-term', label: '6+ Months', description: 'Long-term luxury living' },
  ] as const

  // European cities organized by country
  const europeanCities = [
    { country: '🇩🇪 Germany', cities: ['Berlin', 'Munich'] },
    { country: '🇫🇷 France', cities: ['Paris', 'Lyon'] },
    { country: '🇳🇱 Netherlands', cities: ['Amsterdam', 'Rotterdam'] },
    { country: '🇦🇹 Austria', cities: ['Vienna', 'Salzburg'] },
    { country: '🇪🇸 Spain', cities: ['Barcelona', 'Madrid'] },
    { country: '🇬🇧 UK', cities: ['London', 'Edinburgh'] },
    { country: '🇮🇹 Italy', cities: ['Rome', 'Milan'] },
    { country: '🇨🇿 Czech Rep.', cities: ['Prague'] },
    { country: '🇩🇰 Denmark', cities: ['Copenhagen'] },
    { country: '🇨🇭 Switzerland', cities: ['Zurich'] }
  ]

  // Show only first 6 cities initially
  const primaryCities = ['Berlin', 'Paris', 'Amsterdam', 'Vienna', 'Barcelona', 'London']

  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const typeText = () => {
      const currentText = searchExamples[currentTextIndex]
      
      if (isTyping) {
        // Typing phase
        if (placeholderText.length < currentText.length) {
          timeout = setTimeout(() => {
            setPlaceholderText(currentText.slice(0, placeholderText.length + 1))
          }, 100) // Typing speed
        } else {
          // Pause at end of text
          timeout = setTimeout(() => {
            setIsTyping(false)
          }, 2000) // Pause duration
        }
      } else {
        // Erasing phase
        if (placeholderText.length > 0) {
          timeout = setTimeout(() => {
            setPlaceholderText(placeholderText.slice(0, -1))
          }, 50) // Erasing speed
        } else {
          // Move to next text
          setCurrentTextIndex((prev) => (prev + 1) % searchExamples.length)
          setIsTyping(true)
        }
      }
    }

    timeout = setTimeout(typeText, 100)

    return () => clearTimeout(timeout)
  }, [placeholderText, currentTextIndex, isTyping, searchExamples])

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-16 md:pt-20 lg:pt-24">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1587564979-6d4b7d0cb2b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-4 pb-8 md:pb-16">
        <div className="space-y-8 md:space-y-10">
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black luxury-title-static drop-shadow-lg">
              Luxury European Rentals
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white font-semibold max-w-4xl mx-auto drop-shadow-md">
              Premium luxury apartments across Europe with crypto & credit card payments. Specializing in mid-term rentals from 1-6 months.
            </p>
          </div>
          
          {/* Luxury Crypto Payment Highlight */}
          <div className="relative max-w-5xl mx-auto group">
            {/* Animated background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 animate-pulse transition-all duration-1000"></div>
            
            {/* Main card */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl px-6 py-4 shadow-2xl">
              {/* Premium badge */}
              <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-400 to-gold-500 text-black px-5 py-1.5 rounded-full text-xs font-black tracking-wider shadow-lg">
                  EXCLUSIVE
                </div>
              </div>
              
              <div className="text-center pt-2">
                {/* Main heading */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-3 md:mb-4 tracking-tight">
                  <span className="bg-gradient-to-r from-amber-300 to-gold-400 bg-clip-text text-transparent">
                    Payment Methods of the Future
                  </span>
                </h3>
                
                {/* Payment methods with animations */}
                <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
                  {/* Credit Card */}
                  <div className="group/payment flex items-center space-x-1.5 sm:space-x-2 hover:scale-110 transition-transform duration-300 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 sm:w-4 h-3 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-xs sm:text-sm">Credit Card</span>
                  </div>
                  
                  {/* Bitcoin */}
                  <div className="group/payment flex items-center space-x-1.5 sm:space-x-2 hover:scale-110 transition-transform duration-300 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">₿</span>
                    </div>
                    <span className="text-white font-semibold text-xs sm:text-sm">Bitcoin</span>
                  </div>
                  
                  {/* Ethereum */}
                  <div className="group/payment flex items-center space-x-1.5 sm:space-x-2 hover:scale-110 transition-transform duration-300 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">Ξ</span>
                    </div>
                    <span className="text-white font-semibold text-xs sm:text-sm">Ethereum</span>
                  </div>
                  
                  {/* USDT */}
                  <div className="group/payment flex items-center space-x-1.5 sm:space-x-2 hover:scale-110 transition-transform duration-300 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">₮</span>
                    </div>
                    <span className="text-white font-semibold text-xs sm:text-sm">USDT</span>
                  </div>
                </div>
                
                {/* Luxury description */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
                  <p className="text-white/90 text-sm sm:text-base font-medium text-center leading-relaxed">
                    <span className="text-amber-300 font-semibold">Luxury apartments with seamless crypto & card payments.</span>
                    <br />
                    <span className="text-white/85">Perfect for 1-6 month stays across Europe's finest cities.</span>
                    <br />
                    <span className="text-white/70 text-xs sm:text-sm">EU regulated • Instant conversion • Direct landlord payment</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-lg text-gray-900 placeholder-gray-500 border-none outline-none bg-transparent"
                  />
                  {!searchQuery && (
                    <div className="absolute inset-0 flex items-center pointer-events-none px-0">
                      <span className="text-lg text-gray-500">
                        Try typing, "<span className="inline-block">{placeholderText}</span>
                        <span className="inline-block w-0.5 h-5 bg-gray-500 ml-1 typing-cursor" />
                        "
                      </span>
                    </div>
                  )}
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors duration-200">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

            {/* European Cities */}
            <div className="max-w-6xl mx-auto">
              {!showAllCities ? (
                // Primary cities view
                <div className="space-y-6">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {primaryCities.map((city) => (
                      <button
                        key={city}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-300 text-xs sm:text-sm border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
                      >
                        📍 {city}
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllCities(true)}
                      className="px-4 sm:px-6 py-1.5 sm:py-2 bg-amber-500/20 text-amber-200 font-semibold rounded-full hover:bg-amber-500/30 hover:scale-105 transition-all duration-300 text-xs sm:text-sm border border-amber-400/30 hover:border-amber-400/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    >
                      View All European Cities →
                    </button>
                  </div>
                </div>
              ) : (
                // All cities organized by country
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {europeanCities.map((countryGroup) => (
                      <div key={countryGroup.country} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <h4 className="text-white font-bold text-sm mb-3 text-center">{countryGroup.country}</h4>
                        <div className="flex flex-wrap justify-center gap-2">
                          {countryGroup.cities.map((city) => (
              <button
                              key={city}
                              className="px-4 py-2 bg-white/20 text-white font-medium rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-300 text-xs border border-white/30 hover:border-white/50 backdrop-blur-sm"
              >
                              {city}
              </button>
            ))}
          </div>
        </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllCities(false)}
                      className="px-8 py-3 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-300 text-sm border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    >
                      ← Show Less
                    </button>
                  </div>
                </div>
              )}
      </div>
        </div>
      </div>

    </section>
  )
}

export default Hero
