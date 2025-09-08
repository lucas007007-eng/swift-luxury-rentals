'use client'

import React from 'react'

const Locations = () => {
  const locations = [
    {
      name: 'Mitte',
      description: 'The heart of Berlin with historic landmarks, museums, and vibrant nightlife. Perfect for those who want to be in the center of it all.',
      image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      properties: '45+ Properties'
    },
    {
      name: 'Prenzlauer Berg',
      description: 'Trendy neighborhood known for its bohemian atmosphere, cafes, and beautiful pre-war architecture. Ideal for creative professionals.',
      image: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      properties: '32+ Properties'
    },
    {
      name: 'Kreuzberg',
      description: 'Berlin\'s cultural melting pot with diverse communities, street art, and an eclectic mix of restaurants and bars.',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      properties: '28+ Properties'
    },
    {
      name: 'Charlottenburg',
      description: 'Elegant district with luxury shopping, fine dining, and beautiful parks. Perfect for those seeking sophisticated urban living.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      properties: '38+ Properties'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Locations 🌍
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the neighborhoods where Swift Luxury operates. From Berlin's most iconic districts 
            to emerging areas, we're making it easier to find your perfect rental in Germany's capital.
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((location, index) => (
            <div
              key={location.name}
              className="group cursor-pointer"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden mb-6">
                <div
                  className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url('${location.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
                  <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {location.properties}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {location.description}
              </p>
            </div>
          ))}
        </div>

        {/* Expansion Notice */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Expanding Across Germany
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Based in Berlin, Swift Luxury is committed to addressing Germany's rental challenges. 
            We're expanding to Munich, Hamburg, and Frankfurt, bringing our tech-driven approach to more cities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Munich', 'Hamburg', 'Frankfurt', 'Cologne'].map((city) => (
              <span
                key={city}
                className="px-4 py-2 bg-white rounded-full text-gray-700 font-medium shadow-sm"
              >
                {city} - Coming Soon
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Locations
