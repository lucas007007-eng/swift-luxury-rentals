'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HeartIcon, PlayIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Property } from '@/types'
import { formatPrice } from '@/lib/utils'
import ImageGalleryModal from './ImageGalleryModal'

interface PropertyCardProps {
  property: Property
  index?: number
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        {/* Discount Badge */}
        {property.discount && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {property.discount}% off
          </div>
        )}

        {/* New Badge */}
        {property.featured && (
          <div className="absolute top-4 right-16 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            New
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          {isLiked ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Image Carousel */}
        <div className="relative h-full">
          <div
            className="w-full h-full bg-gray-200 group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            style={{
              backgroundImage: `url('${property.images[currentImageIndex]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => router.push(`/property/${property.id}`)}
          >
          </div>
          
          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageNavigation('prev')
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-amber-400"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageNavigation('next')
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-amber-400"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Indicators */}
          {property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Video Play Button */}
        <button className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <PlayIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Property Type & Availability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              property.type === 'short-term' 
                ? 'bg-blue-100 text-blue-800'
                : property.type === 'month-to-month'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {property.type === 'short-term' ? 'Short Term' : 
               property.type === 'month-to-month' ? 'Month to Month' : 'Long Term'}
            </span>
            {!property.available && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                Leased
              </span>
            )}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {property.location}
          </div>
        </div>

        {/* Title */}
        <Link href={`/property/${property.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.guests} guests</span>
        </div>

        {/* Next Available */}
        {!property.available && property.nextAvailable && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Next Available: <span className="font-semibold">March 15, 2024</span>
            </p>
          </div>
        )}

        {/* Price or Inquire Now */}
        <div className="flex items-center justify-between">
          <div>
            {property.id === 'berlin-real-5' ? (
              <span className="text-xl font-bold text-gray-900">Inquire Now</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.price)}
                </span>
                <span className="text-gray-600">/ {property.priceUnit}</span>
              </>
            )}
          </div>
          <Link
            href={`/property/${property.id}`}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={property.images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={currentImageIndex}
        propertyTitle={property.title}
      />
    </div>
  )
}

export default PropertyCard
