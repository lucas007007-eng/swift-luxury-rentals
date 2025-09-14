// TEMPLATE FOR AI AGENT - Copy this file and rename to: berlin-properties.ts, paris-properties.ts, etc.
// Fill in EXACT data from luxury rental listings

import { Property } from '@/types'

export const CITY_NAME_properties: Property[] = [
  {
    id: 'CITY-real-1', // e.g., 'berlin-real-1'
    title: 'EXACT_TITLE_FROM_LISTING_PAGE',
    description: 'COPY_ENTIRE_DESCRIPTION_FROM_LISTING_EXACTLY_AS_WRITTEN_INCLUDING_ALL_DETAILS',
    price: 6500, // EXACT price number from listing (e.g., 6500)
    priceUnit: 'month',
    location: 'EXACT_ADDRESS_OR_NEIGHBORHOOD_FROM_LISTING, CITY_NAME',
    bedrooms: 0, // Count from listing
    bathrooms: 0, // Count from listing
    guests: 0, // Max guests from listing
    images: [
      'EXACT_IMAGE_URL_1_RIGHT_CLICK_COPY_IMAGE_ADDRESS',
      'EXACT_IMAGE_URL_2_RIGHT_CLICK_COPY_IMAGE_ADDRESS',
      'EXACT_IMAGE_URL_3_RIGHT_CLICK_COPY_IMAGE_ADDRESS', 
      'EXACT_IMAGE_URL_4_RIGHT_CLICK_COPY_IMAGE_ADDRESS',
      'EXACT_IMAGE_URL_5_RIGHT_CLICK_COPY_IMAGE_ADDRESS',
    ],
    amenities: [
      'EXACT_AMENITY_1_FROM_LISTING',
      'EXACT_AMENITY_2_FROM_LISTING', 
      'EXACT_AMENITY_3_FROM_LISTING',
      // ... copy all amenities exactly as listed
    ],
    type: 'month-to-month', // or 'short-term' or 'long-term' based on listing
    available: true,
    featured: true, // Set to true for best/most expensive properties
    discount: 0, // If listing shows discount percentage
    sourceUrl: 'EXACT_LISTING_URL_WHERE_YOU_FOUND_THIS',
    sourcePlatform: 'HousingAnywhere' // or 'Airbnb', 'Booking.com', etc.
  },
  
  // REPEAT THE ABOVE STRUCTURE FOR 12 PROPERTIES TOTAL
  // Property 2:
  {
    id: 'CITY-real-2',
    title: 'SECOND_LISTING_EXACT_TITLE',
    description: 'SECOND_LISTING_DESCRIPTION',
    price: 7000,
    priceUnit: 'month',
    location: 'LOCATION, CITY',
    bedrooms: 0,
    bathrooms: 0,
    guests: 0,
    images: ['URL1', 'URL2', 'URL3', 'URL4', 'URL5'],
    amenities: ['AMENITY1', 'AMENITY2'],
    type: 'month-to-month',
    available: true,
    featured: false,
    sourceUrl: 'LISTING_URL',
    sourcePlatform: 'HousingAnywhere'
  },
  
  // Property 3-12: Follow same pattern
  // ...
]

// EXAMPLE OF COMPLETED ENTRY (based on real HousingAnywhere listing):
/*
{
  id: 'berlin-real-1',
  title: 'Substantial and Stylish 2 Bedroom Penthouse in Berlin Mitte',
  description: 'Ideally situated in the heart of the city, these 230-250sqm fully furnished, brand-new apartments offer luxury, enormous living spaces, daily convenience, and direct access from the building to a gorgeous secret park.',
  price: 6500,
  priceUnit: 'month',
  location: 'Krausnickstraße, Mitte, Berlin',
  bedrooms: 2,
  bathrooms: 1,
  guests: 4,
  images: [
    'https://housinganywhere.imgix.net/unit_type/1064396/actual-image-1.jpg',
    'https://housinganywhere.imgix.net/unit_type/1064396/actual-image-2.jpg',
    'https://housinganywhere.imgix.net/unit_type/1064396/actual-image-3.jpg',
    'https://housinganywhere.imgix.net/unit_type/1064396/actual-image-4.jpg',
    'https://housinganywhere.imgix.net/unit_type/1064396/actual-image-5.jpg',
  ],
  amenities: ['Wood flooring', 'Electrical heating', 'Private kitchenware', 'WiFi', 'Private toilet', 'Shared garden'],
  type: 'month-to-month',
  available: true,
  featured: true,
  sourceUrl: 'https://housinganywhere.com/room/ut1064396/de/Berlin/krausnickstra-e',
  sourcePlatform: 'HousingAnywhere'
}
*/

