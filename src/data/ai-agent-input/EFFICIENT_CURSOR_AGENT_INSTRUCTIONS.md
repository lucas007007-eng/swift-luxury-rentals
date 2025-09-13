# 🎯 EFFICIENT CURSOR AGENT INSTRUCTIONS (Token Optimized)

## 🤖 Repository: https://github.com/lucas007007-eng/crypto-real-estate

## 📋 MISSION: Extract Large Luxury Apartments (Token Efficient)

### **STRICT SCOPE - HOUSINGANYWHERE ONLY:**
- ✅ **ONLY use HousingAnywhere.com** (no other websites)
- ✅ **Skip cities with insufficient listings** 
- ✅ **Report skipped cities clearly**
- ✅ **Focus on available luxury properties**

## 🏙️ TARGET CITIES (Check Each):

### **Required Cities (Extract if Available):**
1. **Berlin**: https://housinganywhere.com/s/Berlin--Germany?priceMin=600000&surfaceMin=100
2. **Paris**: https://housinganywhere.com/s/Paris--France?priceMin=600000&surfaceMin=100
3. **Amsterdam**: https://housinganywhere.com/s/Amsterdam--Netherlands?priceMin=600000&surfaceMin=100
4. **Vienna**: https://housinganywhere.com/s/Vienna--Austria?priceMin=600000&surfaceMin=100
5. **Barcelona**: https://housinganywhere.com/s/Barcelona--Spain?priceMin=600000&surfaceMin=100
6. **London**: https://housinganywhere.com/s/London--United-Kingdom?priceMin=600000&surfaceMin=100

## 🎯 EFFICIENT WORKFLOW:

### **STEP 1: Quick Availability Check**
For each city:
1. **Open the HousingAnywhere search URL**
2. **Count available listings** (need minimum 12 properties €6000+)
3. **If less than 12 available** → SKIP and note in report
4. **If 12+ available** → Proceed with extraction

### **STEP 2: Extract Only Available Cities**
For cities with sufficient listings:
1. **Sort by largest apartment size**
2. **Extract top 12 properties** with largest sizes
3. **For each property**:
   - Copy exact title, description, price, location
   - Right-click 5 images → copy image addresses
   - Copy all amenities exactly
   - Copy listing URL

### **STEP 3: Update Code Efficiently**
1. **Open**: `src/data/cityProperties.ts`
2. **Add properties to available cities only**
3. **Update counts in cityInfo**
4. **Leave empty arrays for skipped cities**

### **STEP 4: Create Summary Report**
At the end, create a commit message like:
```
"Added luxury properties for [CITIES_COMPLETED]

✅ Completed: Berlin (12), Paris (12), Amsterdam (12)
⏭️ Skipped: Vienna (insufficient listings), Barcelona (insufficient listings), London (insufficient listings)

Total: XX properties extracted from HousingAnywhere
```

## 📊 DATA FORMAT (Same as Before):

```typescript
{
  id: 'berlin-real-1',
  title: '[EXACT title]',
  description: '[COMPLETE description]',
  price: 6500,
  priceUnit: 'month',
  location: '[Exact location], Berlin',
  bedrooms: 3,
  bathrooms: 2,
  guests: 6,
  images: [
    '[Real HousingAnywhere image URL 1]',
    '[Real HousingAnywhere image URL 2]',
    '[Real HousingAnywhere image URL 3]',
    '[Real HousingAnywhere image URL 4]',
    '[Real HousingAnywhere image URL 5]',
  ],
  amenities: ['[Exact amenities from listing]'],
  type: 'month-to-month',
  available: true,
  featured: true,
  sourceUrl: '[HousingAnywhere listing URL]',
  sourcePlatform: 'HousingAnywhere'
},
```

## 🚫 **STRICT LIMITATIONS (To Save Tokens):**

### **DO NOT:**
- ❌ Browse other rental websites
- ❌ Search Google for alternatives
- ❌ Try to find properties elsewhere if HousingAnywhere doesn't have enough
- ❌ Generate fake or placeholder data

### **DO:**
- ✅ Only use HousingAnywhere.com
- ✅ Skip cities with insufficient listings
- ✅ Report exactly which cities were skipped
- ✅ Focus on largest available apartments
- ✅ Use real images and exact listing details

## 🎯 **Success Criteria:**

**Minimum Success**: Extract properties for 3+ cities
**Ideal Success**: Extract properties for all 6 cities
**Report**: Clear summary of completed vs skipped cities

**Focus on efficiency and authenticity over completeness!** 🚀


