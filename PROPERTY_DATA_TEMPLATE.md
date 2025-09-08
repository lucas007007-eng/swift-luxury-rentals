# Real Property Listing Data Collection Template

## Instructions:
1. Go to luxury property listing (€6k+ per month)
2. Copy the exact details below
3. Right-click each image → "Copy image address"
4. Paste data into cityProperties.ts

---

## Listing 1: [PASTE LISTING URL HERE]

```typescript
{
  id: 'berlin-real-1',
  title: '[COPY EXACT TITLE FROM LISTING]',
  description: '[COPY EXACT DESCRIPTION FROM LISTING]',
  price: [EXACT_PRICE_NUMBER], // e.g., 6500
  priceUnit: 'month',
  location: '[EXACT LOCATION FROM LISTING], Berlin',
  bedrooms: [NUMBER],
  bathrooms: [NUMBER],
  guests: [NUMBER],
  images: [
    '[RIGHT-CLICK IMAGE 1 → COPY IMAGE ADDRESS]',
    '[RIGHT-CLICK IMAGE 2 → COPY IMAGE ADDRESS]',
    '[RIGHT-CLICK IMAGE 3 → COPY IMAGE ADDRESS]',
    '[RIGHT-CLICK IMAGE 4 → COPY IMAGE ADDRESS]',
    '[RIGHT-CLICK IMAGE 5 → COPY IMAGE ADDRESS]',
  ],
  amenities: ['[COPY', 'EXACT', 'AMENITIES', 'FROM', 'LISTING]'],
  type: 'month-to-month',
  available: true,
  featured: true,
  sourceUrl: '[PASTE LISTING URL]',
  sourcePlatform: 'HousingAnywhere' // or 'Airbnb', etc.
},
```

---

## Quick Links for Finding Luxury Listings:

**Berlin:**
- HousingAnywhere: https://housinganywhere.com/s/Berlin--Germany?priceMin=600000
- Airbnb: Search "Berlin luxury apartment monthly"

**Paris:**  
- HousingAnywhere: https://housinganywhere.com/s/Paris--France?priceMin=600000
- Airbnb: Search "Paris luxury apartment monthly"

**Amsterdam:**
- HousingAnywhere: https://housinganywhere.com/s/Amsterdam--Netherlands?priceMin=600000
- Airbnb: Search "Amsterdam luxury apartment monthly"

## Search Tips:
- Set minimum price to €6000+ per month
- Filter for "Entire apartment" only
- Sort by "Highest price first"
- Look for properties with 5+ images
- Focus on luxury neighborhoods (Mitte, Champs-Élysées, etc.)

