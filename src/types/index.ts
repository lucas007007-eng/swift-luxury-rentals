export interface Property {
  id: string
  title: string
  description: string
  price: number
  priceUnit: 'night' | 'month' | 'year'
  /** When true, UI should hide price and show Inquire Now; excluded from averages */
  priceHidden?: boolean
  location: string
  bedrooms: number
  bathrooms: number
  guests: number
  images: string[]
  amenities: string[]
  type: 'short-term' | 'month-to-month' | 'long-term'
  available: boolean
  nextAvailable?: Date
  featured?: boolean
  discount?: number
  sourceUrl?: string
  sourcePlatform?: string
  isReference?: boolean
}

export interface ContactForm {
  fullName: string
  email: string
  inquiryType: string
  message: string
}

export interface BookingForm {
  checkIn: Date
  checkOut: Date
  guests: number
  propertyId: string
}

export interface FilterOptions {
  priceRange: [number, number]
  bedrooms: number[]
  type: Property['type'][]
  amenities: string[]
  location: string[]
}

