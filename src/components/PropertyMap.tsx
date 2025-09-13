'use client'

import React, { useMemo, useRef, useState } from 'react'
import { MapPinIcon, ViewColumnsIcon, MapIcon } from '@heroicons/react/24/outline'
import { Property } from '@/types'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useRouter } from 'next/navigation'

interface PropertyMapProps {
  properties: Property[]
  selectedProperty?: string | null
  onPropertySelect?: (propertyId: string) => void
  heightClassName?: string
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  selectedProperty, 
  onPropertySelect,
  heightClassName
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map')
  const router = useRouter()

  // Load Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }
  const onUnmount = () => {
    mapRef.current = null
  }

  // Real property coordinates based on actual addresses
  const getPropertyCoordinates = (property: Property) => {
    // Specific coordinates for Berlin luxury properties
    const berlinPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Berlin property coordinates based on actual addresses
      'berlin-real-1': { lat: 52.5236, lng: 13.4019 }, // Krausnickstraße, Mitte
      'berlin-real-2': { lat: 52.5321, lng: 13.3989 }, // Brunnenstraße
      'berlin-real-3': { lat: 52.5219, lng: 13.4041 }, // Linienstraße
      'berlin-real-4': { lat: 52.5291, lng: 13.3817 }, // Schwartzkopffstraße, Mitte
      'berlin-real-5': { lat: 52.5217, lng: 13.4067 }, // Monbijouplatz, Mitte
      'berlin-real-7': { lat: 52.5096, lng: 13.3738 }, // Potsdamer Platz
    }

    // Coordinates for Paris properties (add as properties are added)
    const parisPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Paris property coordinates here when properties are added
    }

    // Coordinates for Amsterdam properties (add as properties are added)
    const amsterdamPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Amsterdam property coordinates here when properties are added
    }

    // Coordinates for Vienna properties (add as properties are added)
    const viennaPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Vienna property coordinates here when properties are added
    }

    // Coordinates for Barcelona properties (add as properties are added)
    const barcelonaPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Barcelona property coordinates here when properties are added
    }

    // Coordinates for London properties (add as properties are added)
    const londonPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add London property coordinates here when properties are added
    }

    // Coordinates for Rome properties (add as properties are added)
    const romePropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Rome property coordinates here when properties are added
    }

    // Coordinates for Prague properties (add as properties are added)
    const praguePropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Prague property coordinates here when properties are added
    }

    // Coordinates for Copenhagen properties (add as properties are added)
    const copenhagenPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Copenhagen property coordinates here when properties are added
    }

    // Coordinates for Zurich properties (add as properties are added)
    const zurichPropertyCoords: Record<string, { lat: number; lng: number }> = {
      // Add Zurich property coordinates here when properties are added
    }

    // City center coordinates for map centering and fallback
    const cityCoords = {
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Prague': { lat: 50.0755, lng: 14.4378 },
      'Copenhagen': { lat: 55.6761, lng: 12.5683 },
      'Zurich': { lat: 47.3769, lng: 8.5417 }
    }

    // Check each city's specific coordinates first
    if (berlinPropertyCoords[property.id]) {
      return berlinPropertyCoords[property.id]
    }
    if (parisPropertyCoords[property.id]) {
      return parisPropertyCoords[property.id]
    }
    if (amsterdamPropertyCoords[property.id]) {
      return amsterdamPropertyCoords[property.id]
    }
    if (viennaPropertyCoords[property.id]) {
      return viennaPropertyCoords[property.id]
    }
    if (barcelonaPropertyCoords[property.id]) {
      return barcelonaPropertyCoords[property.id]
    }
    if (londonPropertyCoords[property.id]) {
      return londonPropertyCoords[property.id]
    }
    if (romePropertyCoords[property.id]) {
      return romePropertyCoords[property.id]
    }
    if (praguePropertyCoords[property.id]) {
      return praguePropertyCoords[property.id]
    }
    if (copenhagenPropertyCoords[property.id]) {
      return copenhagenPropertyCoords[property.id]
    }
    if (zurichPropertyCoords[property.id]) {
      return zurichPropertyCoords[property.id]
    }

    // Fallback to city center with small offset for unmapped properties
    const city = property.location.split(',').pop()?.trim() || 'Berlin'
    const baseCoord = cityCoords[city as keyof typeof cityCoords] || cityCoords.Berlin
    
    return {
      lat: baseCoord.lat + (Math.random() - 0.5) * 0.01,
      lng: baseCoord.lng + (Math.random() - 0.5) * 0.01
    }
  }

  // Get map center based on properties' city
  const getMapCenter = () => {
    if (properties.length === 0) return { lat: 52.52, lng: 13.405 } // Default to Berlin
    
    const city = properties[0].location.split(',').pop()?.trim() || 'Berlin'
    const cityCoords = {
      'Berlin': { lat: 52.52, lng: 13.405 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Prague': { lat: 50.0755, lng: 14.4378 },
      'Copenhagen': { lat: 55.6761, lng: 12.5683 },
      'Zurich': { lat: 47.3769, lng: 8.5417 }
    }
    
    return cityCoords[city as keyof typeof cityCoords] || cityCoords.Berlin
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Property Locations</h3>
          <p className="text-gray-400 text-sm">Explore luxury properties on the map</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'map' 
                ? 'bg-amber-500 text-black font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-amber-500 text-black font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ViewColumnsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Map View */
        <div className="relative">
          <div className={`bg-gray-800 rounded-xl border border-gray-700 ${heightClassName || 'h-96'} relative overflow-hidden`}>
            {isLoaded ? (
              <GoogleMap
                mapContainerClassName={`w-full ${heightClassName || 'h-96'}`}
                onLoad={onLoad}
                onUnmount={onUnmount}
                center={getMapCenter()}
                zoom={13}
                options={{
                  mapId: undefined,
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  gestureHandling: 'greedy',
                  styles: [
                    { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2937' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#fbbf24' }] },
                    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
                    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
                    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
                    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4b5563' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
                  ]
                }}
              >
                {properties.map((property) => {
                  const coords = getPropertyCoordinates(property)
                  const isSelected = selectedProperty === property.id
                  return (
                    <Marker
                      key={property.id}
                      position={coords}
                      title={property.title}
                      onClick={() => onPropertySelect?.(property.id)}
                      onMouseOver={() => onPropertySelect?.(property.id)}
                      icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,\
                          %3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E\
                          %3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E\
                          %3Cstop offset=%220%25%22 stop-color=%22%23ff6b6b%22/%3E\
                          %3Cstop offset=%2250%25%22 stop-color=%22%23ef4444%22/%3E\
                          %3Cstop offset=%22100%25%22 stop-color=%22%23b91c1c%22/%3E\
                          %3C/linearGradient%3E%3C/defs%3E\
                          %3Cpath fill=%22url(%23g)%22 stroke=%22%23000000%22 stroke-width=%222%22 d=%22M32 2C20 2 11 11 11 23c0 15 18 35 20.3 37.5.4.4 1 .4 1.4 0C35 58 53 38 53 23 53 11 44 2 32 2z%22/%3E\
                          %3Ccircle cx=%2232%22 cy=%2224%22 r=%229%22 fill=%22%23fff3%22/%3E\
                          %3Ccircle cx=%2230%22 cy=%2222%22 r=%223%22 fill=%22%23fff8%22/%3E\
                          %3C/svg%3E',
                        scaledSize: new google.maps.Size(isSelected ? 30 : 26, isSelected ? 30 : 26),
                        anchor: new google.maps.Point(13, 24)
                      }}
                    />
                  )
                })}
              </GoogleMap>
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-300">
                Loading map...
              </div>
            )}
          </div>

          {/* Selected Property Info */}
          {selectedProperty && (
            <div className="mt-4 bg-black/40 rounded-xl p-4 border border-gray-700">
              {(() => {
                const property = properties.find(p => p.id === selectedProperty)
                return property ? (
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-16 h-16 bg-gray-700 rounded-lg cursor-pointer"
                      style={{
                        backgroundImage: `url('${property.images[0]}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => router.push(`/property/${property.id}`)}
                      aria-label={`Open ${property.title}`}
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{property.title}</h4>
                      <p className="text-gray-400 text-sm">{property.location}</p>
                      <p className="text-amber-400 font-semibold">€{property.price.toLocaleString()}/{property.priceUnit}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/property/${property.id}`)}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ) : null
              })()}
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-black/40 rounded-xl p-4 border border-gray-700 hover:border-amber-400/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 bg-gray-700 rounded-lg"
                  style={{
                    backgroundImage: `url('${property.images[0]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{property.title}</h4>
                  <p className="text-gray-400 text-sm">{property.location}</p>
                  <p className="text-amber-400 font-semibold">€{property.price.toLocaleString()}/{property.priceUnit}</p>
                </div>
                <MapPinIcon className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertyMap
