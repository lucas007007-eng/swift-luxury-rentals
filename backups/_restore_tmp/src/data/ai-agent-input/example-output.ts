// EXAMPLE OUTPUT - Shows AI agent exactly how to format the data
// Based on the real HousingAnywhere listing you provided

import { Property } from '@/types'

export const berlinPropertiesExample: Property[] = [
  {
    id: 'berlin-real-1',
    title: 'Substantial and Stylish 2 Bedroom Penthouse in Berlin Mitte',
    description: 'Ideally situated in the heart of the city, these 230-250sqm fully furnished, brand-new apartments offer luxury, enormous living spaces, daily convenience, and direct access from the building to a gorgeous secret park. Stunning vernacular architectural detailing evidences superb craftsmanship, while the exterior displays subtle and tasteful aspects of modernity. Automobiles delightfully line the streets, as pedestrians happily and briskly walk to a variety of local destinations and attractions. Impressively designed, the apartment features an open floor plan, dedicated living spaces, high ceilings, neutral color scheme, and phenomenal hardwood floors.',
    price: 6500,
    priceUnit: 'month',
    location: 'Krausnickstraße, Mitte, Berlin',
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    images: [
      'https://housinganywhere.imgix.net/unit_type/1064396/REAL_IMAGE_1.jpg',
      'https://housinganywhere.imgix.net/unit_type/1064396/REAL_IMAGE_2.jpg',
      'https://housinganywhere.imgix.net/unit_type/1064396/REAL_IMAGE_3.jpg',
      'https://housinganywhere.imgix.net/unit_type/1064396/REAL_IMAGE_4.jpg',
      'https://housinganywhere.imgix.net/unit_type/1064396/REAL_IMAGE_5.jpg',
    ],
    amenities: [
      'Wood flooring',
      'Electrical heating', 
      'Private kitchenware',
      'WiFi',
      'Private toilet',
      'Shared garden',
      'Private living room',
      'Private kitchen'
    ],
    type: 'month-to-month',
    available: true,
    featured: true,
    sourceUrl: 'https://housinganywhere.com/room/ut1064396/de/Berlin/krausnickstra-e',
    sourcePlatform: 'HousingAnywhere'
  },
  
  // AI AGENT: Create 11 more properties following this EXACT format
  // Each property should be a real luxury listing with real images
  
  {
    id: 'berlin-real-2',
    title: 'NEXT_REAL_LISTING_TITLE',
    description: 'NEXT_REAL_LISTING_FULL_DESCRIPTION',
    price: 7000, // Real price from next listing
    priceUnit: 'month',
    location: 'REAL_LOCATION, Berlin',
    bedrooms: 0,
    bathrooms: 0,
    guests: 0,
    images: [
      'REAL_IMAGE_URL_1',
      'REAL_IMAGE_URL_2',
      'REAL_IMAGE_URL_3',
      'REAL_IMAGE_URL_4',
      'REAL_IMAGE_URL_5',
    ],
    amenities: ['REAL', 'AMENITIES', 'FROM', 'LISTING'],
    type: 'month-to-month',
    available: true,
    featured: true,
    sourceUrl: 'REAL_LISTING_URL',
    sourcePlatform: 'HousingAnywhere'
  }
  
  // Continue for properties 3-12...
]

