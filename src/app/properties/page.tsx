"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cityProperties } from '@/data/cityProperties'

function getCityStats() {
  return Object.entries(cityProperties).map(([city, props]) => {
    const priced = props.filter(p => typeof p.price === 'number' && !p.priceHidden)
    const count = props.length
    const avg = priced.length > 0 ? Math.round(priced.reduce((s, p) => s + (p.price || 0), 0) / priced.length) : 0
    return { city, count, avg }
  })
}

export default function PropertiesPage() {
  const router = useRouter()
  const cities = getCityStats()

  useEffect(() => {
    // Initialize vanilla-tilt for 3D effects (desktop only for performance)
    const initTilt = async () => {
      try {
        // Only initialize on desktop (screen width > 768px) and when visible
        if (window.innerWidth <= 768) return
        
        // Use Intersection Observer to only init when cards are visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
              const VanillaTilt = (await import('vanilla-tilt')).default
              const element = entry.target as HTMLElement
              VanillaTilt.init(element, {
                max: 10,
                speed: 500,
                perspective: 1800,
                glare: true,
                'max-glare': 0.1,
                scale: 1.03,
                reset: true
              })
              observer.unobserve(element)
            }
          })
        }, { rootMargin: '50px' })

        // Observe all tilt elements
        const tiltElements = Array.from(document.querySelectorAll('[data-tilt]')) as HTMLElement[]
        tiltElements.forEach(el => observer.observe(el))
        
        return () => observer.disconnect()
      } catch (error) {
        console.error('Failed to initialize tilt:', error)
      }
    }
    
    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initTilt, 200)
    return () => clearTimeout(timer)
  }, [])
  const cityIcons: Record<string, string> = {
    Berlin: '🇩🇪',
    Paris: '🇫🇷',
    Amsterdam: '🇳🇱',
    Vienna: '🇦🇹',
    Barcelona: '🇪🇸',
    London: '🇬🇧',
    Rome: '🇮🇹',
    Prague: '🇨🇿',
    Copenhagen: '🇩🇰',
    Zurich: '🇨🇭'
  }

  // City images per city - Beautiful iconic skylines and landmarks (optimized for performance)
  const cityImages: Record<string, string> = {
    Berlin: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Paris: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Vienna: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    London: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Prague: 'https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Copenhagen: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
    Zurich: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75'
  }

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      <section className="pt-32 md:pt-36 lg:pt-40 pb-12 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Explore Our Cities</h1>
            <p className="text-amber-300/90 text-lg">Select a city to view its luxury properties</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cities.map(({ city, count, avg }) => (
              <div 
                key={city} 
                className="tilt-card-container homepage-style"
                style={{ backgroundImage: `url('${cityImages[city] || 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=1200&q=80'}')` }}
                data-tilt
                data-tilt-max="10"
                data-tilt-speed="500"
                data-tilt-perspective="1800"
                data-tilt-glare
                data-tilt-max-glare="0.1"
                data-tilt-scale="1.03"
                data-tilt-reset="true"
                onClick={() => router.push(`/city/${city}`)}
              >
                <div className="tilt-inner-border" data-tilt-transform-element></div>

                <div className="tilt-content-area p-4 sm:p-5 lg:p-7" data-tilt-transform-element>
                  <div className="tilt-gradient-overlay"></div>

                  <div className="tilt-elevation-badge" data-tilt-transform-element>
                    <span className="text-2xl">{cityIcons[city] || '🏙️'}</span>
                    {count > 0 ? `${count}+ Homes` : 'Coming Soon'}
                  </div>

                  {/* Average Rent Mini Box */}
                  {avg > 0 && (
                    <div className="tilt-rent-box" data-tilt-transform-element>
                      <div className="text-xs text-zinc-200 font-semibold">
                        €{avg.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-zinc-300/80 leading-tight">
                        average rent of our properties
                      </div>
                    </div>
                  )}

                  <div className="tilt-text-block" data-tilt-transform-element>
                    <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      {city}
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg font-light">
                      {count} {count === 1 ? 'Property' : 'Properties'}
                    </p>
                  </div>

                  <button 
                    className="tilt-tour-button" 
                    data-tilt-transform-element
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/city/${city}`)
                    }}
                  >
                    Explore {city}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5l7 7-7 7"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}





