// IMPORT SCRIPT - Run this after AI agent completes data extraction
// This script will merge all city data into the main cityProperties.ts file

// Import all city data files created by AI agent
// import { berlinProperties } from './berlin-properties'
// import { parisProperties } from './paris-properties'
// import { amsterdamProperties } from './amsterdam-properties'
// import { viennaProperties } from './vienna-properties'
// import { barcelonaProperties } from './barcelona-properties'
// import { londonProperties } from './london-properties'

// Merge function to combine all city data
export function mergeAIAgentData() {
  const mergedData = {
    // 'Berlin': berlinProperties,
    // 'Paris': parisProperties,
    // 'Amsterdam': amsterdamProperties,
    // 'Vienna': viennaProperties,
    // 'Barcelona': barcelonaProperties,
    // 'London': londonProperties,
  }
  
  console.log('Merged property data:', mergedData)
  return mergedData
}

// Instructions for integration:
// 1. AI agent creates city files in this folder
// 2. Uncomment the imports above
// 3. Uncomment the city data in mergedData object
// 4. Run this script to verify data
// 5. Copy merged data to main cityProperties.ts file

// Data validation function
export function validatePropertyData(properties: any[]) {
  const errors: string[] = []
  
  properties.forEach((property, index) => {
    if (!property.title || property.title.includes('EXACT_TITLE')) {
      errors.push(`Property ${index + 1}: Missing real title`)
    }
    
    if (!property.price || property.price === 0) {
      errors.push(`Property ${index + 1}: Missing real price`)
    }
    
    if (property.price < 6000) {
      errors.push(`Property ${index + 1}: Price too low (${property.price}) - need €6000+`)
    }
    
    if (!property.images || property.images.length < 5) {
      errors.push(`Property ${index + 1}: Need at least 5 real images`)
    }
    
    if (property.images.some((img: string) => img.includes('REAL_IMAGE'))) {
      errors.push(`Property ${index + 1}: Contains placeholder image URLs`)
    }
    
    if (!property.sourceUrl || property.sourceUrl.includes('REAL_LISTING')) {
      errors.push(`Property ${index + 1}: Missing real source URL`)
    }
  })
  
  if (errors.length > 0) {
    console.error('Data validation errors:', errors)
  } else {
    console.log('✅ All property data is valid!')
  }
  
  return errors.length === 0
}

