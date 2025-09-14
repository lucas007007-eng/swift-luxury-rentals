# 🤖 CURSOR AGENT MISSION: Extract Real Luxury Property Listings

## 🎯 Repository: `lucas007007-eng/crypto-real-estate`

You are tasked with populating a luxury rental platform with REAL property listings from actual rental websites.

## 📋 MISSION OBJECTIVES:

### Primary Goal:
Extract 12+ real luxury property listings (€6000+ per month) for each European city and integrate them into the existing Swift Luxury platform.

### Target Cities (Priority Order):
1. **Berlin, Germany** (Highest Priority)
2. **Paris, France** 
3. **Amsterdam, Netherlands**
4. **Vienna, Austria**
5. **Barcelona, Spain** 
6. **London, United Kingdom**

## 🔍 DATA SOURCES (Priority Order):

### 🥇 PRIMARY: HousingAnywhere.com (BEST for long-term luxury)
- **Specializes in longer-term rentals (1-12 months)**
- **Larger apartment sizes (100m²+ common)**
- **Professional landlords and property managers**
- **Berlin**: https://housinganywhere.com/s/Berlin--Germany?priceMin=600000&surfaceMin=100
- **Paris**: https://housinganywhere.com/s/Paris--France?priceMin=600000&surfaceMin=100
- **Amsterdam**: https://housinganywhere.com/s/Amsterdam--Netherlands?priceMin=600000&surfaceMin=100
- **Vienna**: https://housinganywhere.com/s/Vienna--Austria?priceMin=600000&surfaceMin=100
- **Barcelona**: https://housinganywhere.com/s/Barcelona--Spain?priceMin=600000&surfaceMin=100
- **London**: https://housinganywhere.com/s/London--United-Kingdom?priceMin=600000&surfaceMin=100

### 🥈 SECONDARY: Spotahome.com
- **Verified properties with virtual tours**
- **Medium to long-term focus**
- **Large luxury apartments**
- Search: "[City] luxury apartment" + filter €6000+ + 100m²+

### 🥉 TERTIARY: Nestpick.com
- **Corporate housing and luxury rentals**
- **Furnished luxury apartments**
- **Professional property management**

### 🚫 AVOID: Airbnb.com (Unless Necessary)
- **Primarily short-term focused**
- **Smaller apartment sizes typically**
- **Less suitable for our luxury long-term focus**

## 📊 EXACT DATA EXTRACTION REQUIREMENTS:

### For Each Property Listing:
```typescript
{
  id: 'berlin-real-[1-12]', // Sequential numbering
  title: '[EXACT title from listing page]',
  description: '[COMPLETE description - copy everything]',
  price: [exact number], // e.g., 6500 (no currency symbols)
  priceUnit: 'month',
  location: '[Exact address/neighborhood], [City]',
  bedrooms: [number from listing],
  bathrooms: [number from listing], 
  guests: [max guests from listing],
  images: [
    '[Right-click Image 1 → Copy image address]',
    '[Right-click Image 2 → Copy image address]',
    '[Right-click Image 3 → Copy image address]',
    '[Right-click Image 4 → Copy image address]',
    '[Right-click Image 5 → Copy image address]',
  ],
  amenities: [
    '[Copy each amenity exactly as written]',
    '[Include ALL amenities from listing]'
  ],
  type: 'month-to-month', // or 'short-term'/'long-term' based on listing
  available: true,
  featured: true, // Set true for most expensive properties
  discount: [percentage if shown], // or omit if no discount
  sourceUrl: '[Full URL of the listing page]',
  sourcePlatform: '[HousingAnywhere/Airbnb/etc]'
}
```

## 🎯 CRITICAL REQUIREMENTS:

### 🏢 Property Size & Type:
- **MINIMUM 100m² apartment size** (prefer 150m²+)
- **Prioritize largest apartments available** in each city
- **3+ bedrooms preferred** (for luxury family/corporate use)
- **Entire apartments only** (no shared accommodations)
- **Penthouse and top-floor properties** get priority
- **Look for "luxury", "executive", "premium" in titles**

### ✅ Image URLs:
- **MUST be real image URLs** from actual property listings
- **Right-click each photo** → "Copy image address"
- **Minimum 5 images per property**
- **URLs should start with website domain** (e.g., housinganywhere.imgix.net)
- **Include living room, bedroom, kitchen, bathroom, and exterior shots**

### ✅ Text Content:
- **Copy titles EXACTLY** as written on listing page
- **Copy descriptions COMPLETELY** (entire text block)
- **Copy amenities EXACTLY** as listed (no paraphrasing)
- **Use exact location names** from listings
- **Include square meter info** if mentioned in description

### ✅ Data Accuracy:
- **Only properties €6000+ per month**
- **Minimum 100m² apartment size**
- **Verify bedrooms/bathrooms/guests match listing**
- **Include source URL for verification**
- **Focus on luxury neighborhoods** (Mitte, Champs-Élysées, Jordaan, etc.)
- **Prioritize properties with balconies/terraces**

## 📁 FILE STRUCTURE:

### Update This File:
`src/data/cityProperties.ts`

### Add Properties To:
```typescript
'Berlin': [
  // Add 12 real properties here, replacing comments
],
'Paris': [
  // Add 12 real properties here
],
// etc.
```

### Update Counts In:
```typescript
cityInfo = {
  'Berlin': { count: 12 }, // Update as you add properties
  'Paris': { count: 12 },
  // etc.
}
```

## 🔄 WORKFLOW:

1. **Start with Berlin** (most important)
2. **Open HousingAnywhere Berlin search** (luxury filter applied)
3. **Sort by highest price first**
4. **Open top 12 most expensive listings**
5. **For each listing**:
   - Copy exact title, description, price, location
   - Right-click each image → copy image address
   - Copy all amenities exactly
   - Note bedrooms/bathrooms/guests
   - Copy listing URL
6. **Format using the structure above**
7. **Add to cityProperties.ts**
8. **Update city count in cityInfo**
9. **Commit changes**: "Add real Berlin luxury properties"
10. **Repeat for next city**

## ✅ SUCCESS CRITERIA:

- ✅ 12 properties per major city (Berlin, Paris, Amsterdam)
- ✅ All properties €6000+ per month
- ✅ Real images from actual listings (minimum 5 per property)
- ✅ Authentic titles, descriptions, and amenities
- ✅ Verifiable source URLs
- ✅ Proper TypeScript formatting
- ✅ Updated property counts

## 🚨 QUALITY CHECKS:

Before committing each city:
- ✅ All image URLs load properly
- ✅ No placeholder text remains
- ✅ All properties are actually luxury (€6000+)
- ✅ Descriptions are complete and authentic
- ✅ Source URLs are valid and accessible

Start with Berlin and work systematically through each city! 🏢
