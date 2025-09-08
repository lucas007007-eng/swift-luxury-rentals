// Helper script for extracting property data from rental websites
// Run this in browser console on property listing pages

function extractListingData() {
  // This script can be run in browser console to extract data
  const listing = {
    title: document.querySelector('h1')?.textContent?.trim() || '',
    price: document.querySelector('[class*="price"]')?.textContent?.trim() || '',
    description: document.querySelector('[class*="description"]')?.textContent?.trim() || '',
    location: document.querySelector('[class*="location"]')?.textContent?.trim() || '',
    
    // Extract all images
    images: Array.from(document.querySelectorAll('img[src*="housinganywhere"], img[src*="airbnb"]'))
      .map(img => img.src)
      .filter(src => src.includes('http'))
      .slice(0, 5), // Get first 5 images
    
    // Extract amenities
    amenities: Array.from(document.querySelectorAll('[class*="amenity"], [class*="facility"]'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)
  }
  
  console.log('Copy this data:')
  console.log(JSON.stringify(listing, null, 2))
  return listing
}

// Usage:
// 1. Open browser dev tools (F12)
// 2. Go to property listing page
// 3. Paste this script in console
// 4. Run: extractListingData()
// 5. Copy the output and paste into cityProperties.ts

