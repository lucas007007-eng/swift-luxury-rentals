'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cityProperties } from '@/data/cityProperties'

const Locations = () => {
  const router = useRouter()

  // Calculate average rent for each city
  const getCityStats = () => {
    return Object.entries(cityProperties).map(([city, props]) => {
      const priced = props.filter(p => typeof p.price === 'number' && !p.priceHidden)
      const count = props.length
      const avg = priced.length > 0 ? Math.round(priced.reduce((s, p) => s + (p.price || 0), 0) / priced.length) : 0
      return { city, count, avg }
    })
  }

  const cityStats = getCityStats()
  const getAvgRent = (cityName: string) => {
    const stat = cityStats.find(s => s.city === cityName)
    return stat?.avg || 0
  }

  useEffect(() => {
    // Initialize vanilla-tilt for 3D effects
    const initTilt = async () => {
      try {
        const VanillaTilt = (await import('vanilla-tilt')).default
        const tiltElements = Array.from(document.querySelectorAll('[data-tilt]')) as HTMLElement[]
        if (tiltElements.length > 0) {
          VanillaTilt.init(tiltElements, {
            max: 10,
            speed: 500,
            perspective: 1800,
            glare: true,
            'max-glare': 0.1,
            scale: 1.03,
            reset: true
          })
        }
      } catch (error) {
        console.error('Failed to initialize tilt:', error)
      }
    }
    
    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initTilt, 100)
    return () => clearTimeout(timer)
  }, [])
  
  const europeanCities = [
    {
      name: 'Berlin',
      country: 'Germany',
      description: 'Europe\'s cultural capital with luxury apartments in Mitte, Charlottenburg, and Prenzlauer Berg. Premium properties from €6,500/month.',
      image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.Berlin?.length || 0} Properties`,
      flag: '🇩🇪'
    },
    {
      name: 'Paris',
      country: 'France',
      description: 'The City of Light offering luxury rentals in Champs-Élysées, Saint-Germain, and Le Marais. Elegant Haussmannian apartments.',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.Paris?.length || 0} Properties`,
      flag: '🇫🇷'
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      description: 'Canal houses and modern lofts in Jordaan, Museum Quarter, and historic city center. Unique Dutch luxury living.',
      image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.Amsterdam?.length || 0} Properties`,
      flag: '🇳🇱'
    },
    {
      name: 'Vienna',
      country: 'Austria',
      description: 'Imperial elegance in Innere Stadt and Ringstrasse. Luxury apartments with historic charm and modern amenities.',
      image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.Vienna?.length || 0} Properties`,
      flag: '🇦🇹'
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      description: 'Modernist architecture in Eixample and Gothic Quarter charm. Luxury rentals with Mediterranean lifestyle.',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.Barcelona?.length || 0} Properties`,
      flag: '🇪🇸'
    },
    {
      name: 'London',
      country: 'United Kingdom',
      description: 'Prestigious properties in Mayfair, Kensington, and Covent Garden. Classic luxury in the heart of the financial capital.',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      properties: `${cityProperties.London?.length || 0} Properties`,
      flag: '🇬🇧'
    }
  ]

  return (
    <section className="py-20 bg-black">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">
            Our European Destinations
          </h2>
          <p className="text-xl text-white max-w-4xl mx-auto">
            Discover luxury rental properties across Europe's most prestigious cities. From Berlin's cultural districts to Paris's elegant arrondissements.
          </p>
        </div>

        {/* European Cities Grid - 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {europeanCities.map((city, index) => (
            <div
              key={city.name}
              className="tilt-card-container"
              style={{ backgroundImage: `url('${city.image}')` }}
              data-tilt
              data-tilt-max="10"
              data-tilt-speed="500"
              data-tilt-perspective="1800"
              data-tilt-glare
              data-tilt-max-glare="0.1"
              data-tilt-scale="1.03"
              data-tilt-reset="true"
              onClick={() => router.push(`/city/${city.name}`)}
            >
              <div className="tilt-inner-border" data-tilt-transform-element></div>

              <div className="tilt-content-area p-4 sm:p-5 lg:p-7" data-tilt-transform-element>
                <div className="tilt-gradient-overlay"></div>

                <div className="tilt-elevation-badge" data-tilt-transform-element>
                  <span className="text-2xl">{city.flag}</span>
                  {city.properties === '0 Properties' ? 'Coming Soon' : city.properties}
                </div>

                {/* Average Rent Mini Box */}
                {(() => {
                  const avgRent = getAvgRent(city.name)
                  return avgRent > 0 ? (
                    <div className="tilt-rent-box" data-tilt-transform-element>
                      <div className="text-xs text-amber-200 font-semibold">
                        €{avgRent.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-amber-300/70 leading-tight">
                        average rent of our properties
                      </div>
                    </div>
                  ) : null
                })()}

                <div className="tilt-text-block" data-tilt-transform-element>
                  <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                    {city.name}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg font-light">
                    {city.country}
                  </p>
                </div>

                <button 
                  className="tilt-tour-button" 
                  data-tilt-transform-element
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/city/${city.name}`)
                  }}
                >
                  Explore {city.name}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5l7 7-7 7"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Expanding Across Europe</h3>
            <p className="text-gray-300 mb-6">
              We're continuously adding luxury properties in Europe's most desirable cities. 
              Be the first to know when we launch in your preferred destination.
            </p>
            <button 
              onClick={() => router.push('/properties')}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-colors"
            >
              View All Cities
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Locations