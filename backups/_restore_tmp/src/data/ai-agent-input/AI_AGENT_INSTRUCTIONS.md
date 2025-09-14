# 🤖 CURSOR AI AGENT INSTRUCTIONS

## Mission: Extract Luxury Property Listings

You are tasked with finding and extracting luxury property rental listings from websites and formatting them for a rental platform.

## 🎯 Target Specifications:
- **Price Range**: €6,000+ per month minimum
- **Property Type**: Entire apartments/penthouses only
- **Cities**: Berlin, Paris, Amsterdam, Vienna, Barcelona, London
- **Quantity**: 12 properties per city
- **Images**: 5 real images per property minimum

## 🔍 Search Strategy:

### Primary Source: HousingAnywhere.com
1. Navigate to: `https://housinganywhere.com/s/[CITY]--[COUNTRY]`
2. Set filters:
   - Price: Minimum €6000/month
   - Property type: Entire apartment
   - Sort: Highest price first
3. Click on each luxury listing
4. Extract all data using format below

### Secondary Source: Airbnb.com
1. Search: "[City] luxury apartment monthly rental"
2. Filter for monthly stays
3. Sort by highest price
4. Focus on €6000+ properties

## 📋 Data Extraction Format:

For each property, create this exact structure:

```typescript
{
  id: 'city-real-[number]', // e.g., 'berlin-real-1'
  title: '[EXACT title from listing page]',
  description: '[COMPLETE description from listing - copy everything]',
  price: [number], // Just the number, e.g., 6500
  priceUnit: 'month',
  location: '[Exact address/neighborhood from listing], [City]',
  bedrooms: [number from listing],
  bathrooms: [number from listing],
  guests: [max guests from listing],
  images: [
    '[Right-click image 1 → Copy image address]',
    '[Right-click image 2 → Copy image address]',
    '[Right-click image 3 → Copy image address]',
    '[Right-click image 4 → Copy image address]',
    '[Right-click image 5 → Copy image address]',
  ],
  amenities: [
    '[Copy each amenity exactly as written]',
    '[Include all amenities from the listing]'
  ],
  type: 'month-to-month', // or 'short-term' or 'long-term'
  available: true,
  featured: true, // Set true for most expensive/best properties
  discount: [percentage if any discount shown],
  sourceUrl: '[Full URL of the listing]',
  sourcePlatform: '[HousingAnywhere/Airbnb/etc]'
}
```

## 📁 File Structure:
Save each city's data as:
- `berlin-properties.ts`
- `paris-properties.ts`
- `amsterdam-properties.ts`
- `vienna-properties.ts`
- `barcelona-properties.ts`
- `london-properties.ts`

## 🚨 Critical Requirements:

### Image URLs:
- ✅ Must be REAL image URLs from the actual listing
- ✅ Right-click each photo → "Copy image address"
- ✅ URLs should start with the website's domain
- ✅ Minimum 5 images per property
- ❌ Do NOT use placeholder or generic stock images

### Text Content:
- ✅ Copy titles EXACTLY as written on listing
- ✅ Copy descriptions COMPLETELY (entire text)
- ✅ Copy amenities EXACTLY as listed
- ✅ Use exact location names from listings
- ❌ Do NOT paraphrase or modify any text

### Data Accuracy:
- ✅ Verify price, bedrooms, bathrooms match listing
- ✅ Include source URL for verification
- ✅ Only include properties that are actually €6000+ per month
- ✅ Focus on luxury neighborhoods and premium properties

## 🎯 Priority Order:
1. **Berlin** (most important - get the best luxury listings)
2. **Paris** (high priority)
3. **Amsterdam** (high priority)
4. **Vienna, Barcelona, London** (complete when possible)

## 📝 Output Format:
Each city file should export an array like this:

```typescript
import { Property } from '@/types'

export const berlinProperties: Property[] = [
  // 12 luxury properties with real data
]
```

## ✅ Success Criteria:
- 12 properties per major city
- All properties €6000+ per month
- Real images from actual listings
- Authentic descriptions and amenities
- Verifiable source URLs

Start with Berlin and work through each city systematically! 🏢

