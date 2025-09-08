'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  HeartIcon, 
  ShareIcon, 
  MapPinIcon, 
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Property } from '@/types'

// Property data - in real app this would come from API
const getPropertyById = (id: string): Property | null => {
  const properties: Property[] = [
    {
      id: '5',
      title: 'Luxury Industrial Loft at Engeldamm (X-Berg/Mitte Border)',
      description: 'Dieses Loft befindet sich direkt an der Grenze von X-Berg und Mitte und vereinigt daher schon durch seine Lage das Beste aus 2 Welten: Edel und luxuriös, großstädtisch, zentral und modern in Mitte - cool & stylish, kiezig, jung in Kreuzberg. Es wurde 2016 kernsaniert und in modernem Design nach Industrial Art luxuriös ausgestattet. Bei ca. 300 m2 Fläche verfügen Sie über einen repräsentativen ca. 160 m2 großen offenen Bereich, der das Zentrum des Lofts bildet sowie drei weitere Zimmer, Abstellräume und ein Badezimmer.',
      price: 17900,
      priceUnit: 'month',
      location: 'Engeldamm, Berlin',
      bedrooms: 3,
      bathrooms: 1,
      guests: 6,
      images: [
        'https://housinganywhere.imgix.net/unit_type/1574579/e013c9bb-d811-49c3-a487-6946ad2d4670.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/1f62e621-0559-4d79-bce4-e37a64d91038.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/f6a2affa-7407-40ce-a581-cadc14cb735c.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/f3f3e952-3e50-486f-8829-fdc695391b05.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/6786f262-b571-4a3a-ad13-2fc81b2eab04.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/a001a468-5662-48ed-a176-fd99687c2b9e.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/fad05981-102a-498d-95f9-733fe1892366.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/c446e537-2d25-4c0f-bec3-6acb147ecfc9.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/1b97b3ad-416a-4cdf-84ba-328be9b86342.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/2a49df44-4971-4442-995f-dca40c1e6242.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1574579/3936bd0b-a071-435b-8f46-f5a26247a335.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
      ],
      amenities: ['Wood Flooring', 'Central Heating', 'Private Kitchen', 'Elevator', 'Balcony/Terrace', 'Underground Parking'],
      type: 'long-term',
      available: true,
      featured: true
    }
  ]
  return properties.find(p => p.id === id) || null
}

export default function PropertyPage() {
  const params = useParams()
  const property = getPropertyById(params.id as string)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'rules'>('overview')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  if (!property) {
    return <div>Property not found</div>
  }

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

  const facilities = [
    'Private toilet',
    'Shared garden', 
    'Private living room',
    'Private kitchen',
    'Wood flooring',
    'Central heating',
    'Private kitchenware',
    'WiFi'
  ]

  const houseRules = [
    { category: 'Age', rule: 'No preference' },
    { category: 'Gender', rule: 'No preference' },
    { category: 'Tenant type', rule: 'Students, working professionals' },
    { category: 'Suitable for couples', rule: 'Yes' },
    { category: 'Playing Musical Instruments allowed', rule: 'Yes' },
    { category: 'Pets allowed', rule: 'No' },
    { category: 'Smoking allowed', rule: 'Outside only' }
  ]

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section - Full Screen Image */}
      <section className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-gray-900"
            style={{
              backgroundImage: `url('${property.images[currentImageIndex]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => handleImageNavigation('prev')}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => handleImageNavigation('next')}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Top Right Actions */}
        <div className="absolute top-24 right-8 flex items-center space-x-4">
          <button className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors backdrop-blur-sm">
            See All Photos
          </button>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end">
              <div className="text-white mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                    Long Term
                  </span>
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    BerlinLuxe Operated
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                  {property.title}
                </h1>
                
                <div className="flex items-center space-x-8 text-xl font-semibold mb-4">
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="w-6 h-6" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1M21 3H3l2-2h14l2 2" />
                    </svg>
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-6 h-6" />
                    <span>{property.guests}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-lg">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{property.location}</span>
                </div>
              </div>
              
              <div className="text-white text-right">
                <div className="mb-2">
                  <span className="text-gray-300">max. {property.guests} guests</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-300">Lease length:</span>
                  <div className="text-xl font-bold">Flexible</div>
                </div>
                <div>
                  <span className="text-gray-300">Available from:</span>
                  <div className="text-xl font-bold">Immediately</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-2">
              {/* Property Overview */}
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    {property.description}
                  </p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Hier am Engelbecken treffen sich Mitte und Kreuzberg – chic trifft auf alternativ, edel trifft auf bodenständig. 
                    Der Engeldamm zieht sich vom Engelbecken, einem künstlichen See, bis zur Spree und bildet einen grünen 
                    Streifen mitten in der Hektik der Großstadt. Die Oranienstraße und der Mariannenplatz mit unzähligen 
                    Bars, Restaurants und Clubs sind in direkter Laufnähe.
                  </p>
                  <button className="text-primary-600 hover:text-primary-700 font-semibold mt-4">
                    Read More →
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-8">
                <div className="flex border-b border-gray-200">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'rules', label: 'Rules' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-3 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="py-6">
                  {activeTab === 'overview' && (
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {property.description}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        Hier am Engelbecken treffen sich Mitte und Kreuzberg – chic trifft auf alternativ, edel trifft auf bodenständig. 
                        Aber alle vereint eine gewisse Coolness. Der Engeldamm zieht sich vom Engelbecken, einem künstlichen See, 
                        bis zur Spree und bildet einen grünen Streifen mitten in der Hektik der Großstadt. Die Oranienstraße und 
                        der Mariannenplatz mit unzähligen Bars, Restaurants und Clubs sind in direkter Laufnähe.
                      </p>
                    </div>
                  )}
                  
                  {activeTab === 'amenities' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Facilities and amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {facilities.map((facility, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckIcon className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'rules' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">House rules and preferences</h3>
                      <div className="space-y-4">
                        {houseRules.map((rule, index) => (
                          <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-900">{rule.category}:</span>
                            <span className="text-gray-600">{rule.rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant Protection */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Tenant Protection: Smooth move, or your money back
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Move in and check the place out. You have 48 hours to report any problems, 
                      then we'll send your money to the landlord.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Your money's held safe</span>
                      <span>→</span>
                      <span>Confirm rental</span>
                      <span>→</span>
                      <span>Move in</span>
                      <span>→</span>
                      <span>48 hours later</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Price Box */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-6">
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      €{property.price.toLocaleString('de-DE')}
                    </div>
                    <div className="text-gray-600 text-lg">/ month</div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-5 h-5 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900">4.9</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <button className="text-primary-600 hover:text-primary-700 font-semibold">
                      See 23 Reviews →
                    </button>
                  </div>

                  {/* Booking Calendar */}
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Book Now</h3>
                    <p className="text-gray-600 mb-6">Select dates and guests to see prices.</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                          <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
                          <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                        <select
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {[1,2,3,4,5,6].map(num => (
                            <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  {checkIn && checkOut && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>€{property.price.toLocaleString('de-DE')} x 1 month</span>
                          <span>€{property.price.toLocaleString('de-DE')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning fee</span>
                          <span>€150</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>€890</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span>€{(property.price + 150 + 890).toLocaleString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg">
                      Book Property Now
                    </button>
                    <button className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-lg transition-colors">
                      Send Inquiry
                    </button>
                    <button className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-4 px-6 rounded-lg transition-colors">
                      Book a Viewing
                    </button>
                  </div>

                  {/* Lease Options */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Join BerlinLuxe for accommodations less than 90 days</p>
                    <div className="flex space-x-2">
                      {['6 Months', '12 Months', '18 Months'].map((period) => (
                        <button
                          key={period}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
