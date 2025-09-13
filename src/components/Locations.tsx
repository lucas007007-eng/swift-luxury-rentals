'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cityProperties } from '@/data/cityProperties'

const Locations = () => {
  const router = useRouter()
  
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
          <h2 className="text-4xl md:text-5xl font-black text-amber-400 mb-6 drop-shadow-lg" style={{ color: '#fbbf24', textShadow: '0 4px 8px rgba(251, 191, 36, 0.3)' }}>
            Our European Destinations
          </h2>
          <p className="text-xl text-white max-w-4xl mx-auto">
            Discover luxury rental properties across Europe's most prestigious cities. From Berlin's cultural districts to Paris's elegant arrondissements.
          </p>
        </div>

        {/* European Cities Grid - Artin Properties Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {europeanCities.map((city, index) => (
            <div
              key={city.name}
              className="group relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 hover:border-amber-400/50 transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => router.push(`/city/${city.name}`)}
              role="button"
              tabIndex={0}
              aria-label={`View ${city.name} properties`}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/city/${city.name}`) }}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <div
                  className="w-full h-full bg-gray-800 group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('${city.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                
                {/* Flag Overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
                  <span className="text-2xl">{city.flag}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-gray-400 text-sm">{city.country}</p>
                  </div>
                  <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                    city.properties === '0 Properties' 
                      ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30' 
                      : 'text-green-400 bg-green-500/20 border border-green-500/30'
                  }`}>
                    {city.properties === '0 Properties' ? 'Coming Soon' : city.properties}
                  </span>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  {city.description}
                </p>
                
                <div className="pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => router.push(`/city/${city.name}`)}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-all duration-300 group-hover:translate-x-1 transform flex items-center space-x-2"
                  >
                    <span>Explore {city.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
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