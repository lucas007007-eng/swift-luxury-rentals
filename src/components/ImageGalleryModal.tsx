'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { getProxiedImageUrl } from '@/lib/utils'

interface ImageGalleryModalProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  propertyTitle: string
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  propertyTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm z-10"
      >
        <XMarkIcon className="w-8 h-8 text-white" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-6 left-6 bg-black/60 text-white px-4 py-2 rounded-full font-medium backdrop-blur-sm z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Property Title */}
      <div className="absolute bottom-6 left-6 right-6 text-center z-10">
        <h3 className="text-white text-2xl font-bold drop-shadow-lg">
          {propertyTitle}
        </h3>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div
          className="max-w-7xl max-h-full w-full h-full bg-gray-900 rounded-lg"
          style={{
            backgroundImage: `url('${getProxiedImageUrl(images[currentIndex])}')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-8 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronLeftIcon className="w-10 h-10 text-white" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-8 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronRightIcon className="w-10 h-10 text-white" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3 max-w-4xl overflow-x-auto pb-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index 
                ? 'border-white shadow-lg' 
                : 'border-white/30 hover:border-white/60'
            }`}
          >
            <div
              className="w-full h-full bg-gray-800"
              style={{
                backgroundImage: `url('${getProxiedImageUrl(image)}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </button>
        ))}
      </div>

      {/* Click Outside to Close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  )
}

export default ImageGalleryModal

