// Template for adding real listing data from HousingAnywhere, Airbnb, etc.
// Copy this structure and fill in with real listing information

export const realListingTemplate = {
  id: 'city-number', // e.g., 'berlin-1'
  title: 'EXACT_TITLE_FROM_LISTING',
  description: 'EXACT_DESCRIPTION_FROM_LISTING',
  price: 0, // Exact price from listing
  priceUnit: 'month',
  location: 'EXACT_LOCATION_FROM_LISTING, CITY',
  bedrooms: 0, // From listing
  bathrooms: 0, // From listing  
  guests: 0, // From listing
  images: [
    'EXACT_IMAGE_URL_1_FROM_LISTING',
    'EXACT_IMAGE_URL_2_FROM_LISTING', 
    'EXACT_IMAGE_URL_3_FROM_LISTING',
    'EXACT_IMAGE_URL_4_FROM_LISTING',
    'EXACT_IMAGE_URL_5_FROM_LISTING',
  ],
  amenities: ['EXACT_AMENITIES_FROM_LISTING'], // Copy from listing
  type: 'month-to-month', // or 'short-term', 'long-term'
  available: true,
  featured: false, // Set to true for best listings
  discount: 0, // If listing has discount
  sourceUrl: 'ORIGINAL_LISTING_URL', // For reference
  sourcePlatform: 'HousingAnywhere' // or 'Airbnb', 'Booking.com', etc.
}

// Instructions for finding luxury listings:
// 
// 1. Go to HousingAnywhere Berlin search
// 2. Set price filter to €6000+ per month
// 3. Sort by "Highest price first"
// 4. Click on each luxury listing
// 5. Copy the exact title, description, price, images URLs
// 6. Right-click on each image -> "Copy image address"
// 7. Paste the URLs into the images array
// 8. Copy amenities list exactly as shown
// 9. Fill in bedrooms, bathrooms, guests from listing details
//
// Repeat for Paris, Amsterdam, Vienna, Barcelona, London
//
// For Airbnb:
// 1. Search "Berlin luxury apartment monthly"
// 2. Filter by price €6000+/month
// 3. Use same process to extract data

