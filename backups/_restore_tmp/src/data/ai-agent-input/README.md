# AI Agent Property Data Collection Instructions

## 🤖 FOR CURSOR AI AGENT: Read This First!

This folder is designed for you to dump property listing data from luxury rental websites. Focus on LARGE LUXURY APARTMENTS with authentic images.

## 🎯 Your Mission:
Extract LARGE luxury property listings (€6000+ per month, 100m²+ size) from long-term rental websites and save them in the specified format.

## 🏢 SIZE REQUIREMENTS:
- **MINIMUM 100m² apartment size** 
- **PREFER 150m²+ apartments** (prioritize largest available)
- **3+ bedrooms preferred** for luxury family/corporate use
- **Penthouses and top-floor properties** get highest priority

## 📍 Target Websites:
1. **HousingAnywhere.com** - Primary source
2. **Airbnb.com** - Secondary source  
3. **Booking.com** - Luxury apartments
4. **Other premium rental sites**

## 🏙️ Cities to Extract (12 properties each):
- Berlin, Germany
- Paris, France  
- Amsterdam, Netherlands
- Vienna, Austria
- Barcelona, Spain
- London, United Kingdom

## 📋 Extraction Process:

### Step 1: Search for Luxury Properties
- Go to rental website
- Search for city (e.g., "Berlin")
- Set price filter: €6000+ per month
- Filter: "Entire apartment" only
- Sort by: "Highest price first"

### Step 2: For Each Property Listing:
1. **Copy exact title** from listing page
2. **Copy exact description** (full text)
3. **Note exact price** (number only, no currency)
4. **Copy exact location/address**
5. **Count bedrooms, bathrooms, guests** from listing
6. **Right-click each image** → "Copy image address" 
7. **Copy all amenities** exactly as listed
8. **Copy the listing URL** for reference

### Step 3: Save Data
Create one file per city using the format in `CITY_TEMPLATE.ts`

## ⚠️ Critical Requirements:
- ✅ Use EXACT titles, descriptions, and amenities from listings
- ✅ Use REAL image URLs from the actual property photos  
- ✅ Minimum 5 images per property
- ✅ Only properties €6000+ per month
- ✅ Include source URL for verification
- ✅ Follow the exact TypeScript format

## 🚀 Quick Start:
1. Copy `CITY_TEMPLATE.ts` 
2. Rename to `berlin-properties.ts`, `paris-properties.ts`, etc.
3. Fill in real data for 12 properties per city
4. Save in this folder
5. I'll integrate them into the main system

Ready to start! 🏢

