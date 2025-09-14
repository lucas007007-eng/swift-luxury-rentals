# 🤖 FINAL CURSOR AGENT MISSION: 6 Cities × 12 Properties = 72 Total

## 🎯 Repository: `https://github.com/lucas007007-eng/crypto-real-estate`

## 📋 MISSION OVERVIEW:
Extract **72 real luxury property listings** (12 per city) from HousingAnywhere and other premium rental platforms for Swift Luxury's European expansion.

## 🏙️ TARGET CITIES (All Required):

### **Priority Order - Complete Each City Before Moving to Next:**
1. **🇩🇪 Berlin, Germany** (12 properties)
2. **🇫🇷 Paris, France** (12 properties)  
3. **🇳🇱 Amsterdam, Netherlands** (12 properties)
4. **🇦🇹 Vienna, Austria** (12 properties)
5. **🇪🇸 Barcelona, Spain** (12 properties)
6. **🇬🇧 London, United Kingdom** (12 properties)

**TOTAL GOAL: 72 luxury properties**

## 🔍 SEARCH STRATEGY:

### 🥇 PRIMARY SOURCE: HousingAnywhere.com (Best for Large Luxury Rentals)

**Direct Search URLs (Pre-filtered for €6000+ & 100m²+):**
- **Berlin**: https://housinganywhere.com/s/Berlin--Germany?priceMin=600000&surfaceMin=100&propertyType=entire-apartment
- **Paris**: https://housinganywhere.com/s/Paris--France?priceMin=600000&surfaceMin=100&propertyType=entire-apartment  
- **Amsterdam**: https://housinganywhere.com/s/Amsterdam--Netherlands?priceMin=600000&surfaceMin=100&propertyType=entire-apartment
- **Vienna**: https://housinganywhere.com/s/Vienna--Austria?priceMin=600000&surfaceMin=100&propertyType=entire-apartment
- **Barcelona**: https://housinganywhere.com/s/Barcelona--Spain?priceMin=600000&surfaceMin=100&propertyType=entire-apartment
- **London**: https://housinganywhere.com/s/London--United-Kingdom?priceMin=600000&surfaceMin=100&propertyType=entire-apartment

### 🏢 APARTMENT SIZE PRIORITIES:
1. **200m²+ apartments** (Top Priority)
2. **150-199m² apartments** (High Priority)
3. **100-149m² apartments** (Acceptable)
4. **Focus on**: Penthouses, luxury lofts, executive apartments

### 🏆 NEIGHBORHOOD FOCUS BY CITY:

**Berlin**: Mitte, Prenzlauer Berg, Charlottenburg, Tiergarten
**Paris**: Champs-Élysées, Saint-Germain, Marais, Trocadéro, Louvre
**Amsterdam**: Jordaan, Museum Quarter, Canal Ring, Vondelpark
**Vienna**: Innere Stadt, Ringstrasse, Schönbrunn area
**Barcelona**: Eixample, Gothic Quarter, Gràcia, Passeig de Gràcia
**London**: Mayfair, Kensington, Covent Garden, Knightsbridge

## 📊 EXACT EXTRACTION FORMAT:

### For Each Property (Copy into src/data/cityProperties.ts):

```typescript
{
  id: 'berlin-real-1', // Sequential: berlin-real-1 to berlin-real-12
  title: '[EXACT title from listing page]',
  description: '[COMPLETE description from listing - copy everything]',
  price: 6500, // Exact price number only
  priceUnit: 'month',
  location: '[Exact neighborhood/address], Berlin',
  bedrooms: 3, // From listing
  bathrooms: 2, // From listing
  guests: 6, // Max guests from listing
  images: [
    '[Right-click Image 1 → Copy image address]',
    '[Right-click Image 2 → Copy image address]',
    '[Right-click Image 3 → Copy image address]',
    '[Right-click Image 4 → Copy image address]',
    '[Right-click Image 5 → Copy image address]',
  ],
  amenities: [
    '[Copy each amenity exactly]',
    '[Include ALL amenities from listing]'
  ],
  type: 'month-to-month',
  available: true,
  featured: true, // Set true for largest/most expensive
  sourceUrl: '[Full listing URL]',
  sourcePlatform: 'HousingAnywhere'
},
```

## 🎯 STEP-BY-STEP PROCESS:

### **STEP 1: Clone Repository**
```bash
git clone https://github.com/lucas007007-eng/crypto-real-estate.git
cd crypto-real-estate
```

### **STEP 2: For Each City (Start with Berlin)**
1. **Open the city's HousingAnywhere search URL**
2. **Sort by**: "Largest apartment size" or "Highest price"
3. **Click on each of the top 12 listings**
4. **For each listing**:
   - Copy exact title from page
   - Copy complete description
   - Note exact price (number only)
   - Copy exact location/address
   - Count bedrooms, bathrooms, max guests
   - **RIGHT-CLICK each image** → "Copy image address"
   - Copy all amenities exactly as written
   - Copy the listing page URL

### **STEP 3: Add to Code**
1. **Open**: `src/data/cityProperties.ts`
2. **Find the city array** (e.g., 'Berlin': [])
3. **Replace the comment** with 12 real properties
4. **Update count** in cityInfo section
5. **Save file**

### **STEP 4: Commit**
```bash
git add .
git commit -m "Add 12 real [CITY] luxury properties (100m²+ apartments)"
git push
```

### **STEP 5: Repeat for Next City**
Continue with Paris, Amsterdam, Vienna, Barcelona, London

## 🚨 CRITICAL SUCCESS FACTORS:

### ✅ **Image URLs Must Be Real:**
- **Right-click each photo** on listing page
- **Select "Copy image address"**
- **Paste exact URL** (should start with housinganywhere.imgix.net)
- **5+ images per property minimum**

### ✅ **Text Must Be Authentic:**
- **Copy-paste exact titles** (no modifications)
- **Copy complete descriptions** (entire text blocks)
- **Copy amenities exactly** as listed on website

### ✅ **Large Apartment Focus:**
- **Minimum 100m² size** (prefer 150m²+)
- **3+ bedrooms when possible**
- **Penthouses and luxury lofts prioritized**

### ✅ **Quality Control:**
- **Verify all image URLs load**
- **Check all properties are €6000+ monthly**
- **Ensure proper TypeScript syntax**
- **Test website still works after each city**

## 🎯 FINAL RESULT TARGET:

**72 luxury properties total:**
- Berlin: 12 large luxury apartments
- Paris: 12 large luxury apartments  
- Amsterdam: 12 large luxury apartments
- Vienna: 12 large luxury apartments
- Barcelona: 12 large luxury apartments
- London: 12 large luxury apartments

**360+ authentic property images**
**Professional luxury rental database ready for production**

Start with Berlin and work systematically through all 6 cities! 🚀


