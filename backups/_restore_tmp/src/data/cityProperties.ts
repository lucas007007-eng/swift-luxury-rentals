import { Property } from '@/types'

// Luxury properties by city - AI Agent will populate with real listings €6k+/month
export const cityProperties: Record<string, Property[]> = {
  'Berlin': [
    {
      id: 'berlin-real-1',
      title: 'Substantial and Stylish 2 Bedroom Penthouse in Berlin Mitte',
      description: 'Ideally situated in the heart of the city, these 230-250sqm fully furnished, brand-new apartments offer luxury, enormous living spaces, daily convenience, and direct access from the building to a gorgeous secret park. Stunning vernacular architectural detailing evidences superb craftsmanship, while the exterior displays subtle and tasteful aspects of modernity. Impressively designed, the apartment features an open floor plan, dedicated living spaces, high ceilings, neutral color scheme, and phenomenal hardwood floors. Carefully laid in a herringbone pattern, the heated flooring is bursting with natural hues of amber, vanilla, and honey. Flooding the space in luminous natural light, the bright windows offer unparalleled serenity. Midcentury modern furniture adds to the panache and gives additional depth and texture with velvet touches and geometric angularity.',
      price: 6500,
      priceUnit: 'month',
      location: 'Krausnickstraße, Mitte, Berlin',
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      images: [
        'https://housinganywhere.imgix.net/room/1711141/9861bbbc-720c-436b-8684-fcd6de3ecec9.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/89baa6e2-accc-4030-b2bc-3360f70cb587.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/4437657c-9b66-4803-a249-b9a6c80c81f4.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/8f2fab2b-ea9c-4cf1-9f99-db777a79876a.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/c7338577-478e-412c-8761-e456da687749.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/0221a954-27f7-4c27-82c6-01e7807bdd1c.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/2ceba85d-94b0-4797-9138-460bd56ee9a1.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/f84b904f-3d73-4719-a46a-53e1547fb5b4.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/6d0da902-5984-47b5-aacc-9742f58a2970.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/9543c08f-445d-427f-93a1-86f1af68c5cf.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
        'https://housinganywhere.imgix.net/room/1711141/b4928faf-b6d3-4bc1-8167-ccabe49fe620.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=1920',
      ],
      amenities: ['Private toilet', 'Shared garden', 'Private kitchen', 'Wood flooring', 'Electrical heating', 'Private kitchenware', 'WiFi'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://housinganywhere.com/room/ut1064396/de/Berlin/',
      sourcePlatform: 'HousingAnywhere'
    },
    {
      id: 'berlin-real-2',
      title: 'Modern Luxury Apartment on Brunnenstraße',
      description: 'Spacious luxury apartment with modern design and natural light. Located on Brunnenstraße with premium amenities and contemporary furnishing.',
      price: 7500, // Placeholder - update with actual price from listing
      priceUnit: 'month',
      location: 'Brunnenstraße, Berlin',
      bedrooms: 3, // Placeholder - update with actual count
      bathrooms: 2, // Placeholder - update with actual count
      guests: 6, // Placeholder - update with actual count
      images: [
        'https://housinganywhere.imgix.net/room/1886004/b29db614-614d-42bd-b3fe-354e2b6f9e29.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/6b27c878-9b83-4e0f-9e21-37c3e73a23b0.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/22ffc639-0a63-4881-9524-ff123e3d0a46.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/28c7f32c-98b7-402a-b333-38283dfa868e.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/7c344641-d2c9-4da3-80c3-18ca612f4f6f.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/9816f764-7c46-4ddc-bd22-9b37f6c0bf47.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/1e5f5d58-1b5a-4dc6-88cc-8919fd114fe2.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/4bafabaa-2a3f-403a-990b-fa88ead11082.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/d38f1073-2dca-4586-9eaf-b54b902c6e50.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/556f694b-66e0-43fc-a42e-7c3fa2b136ba.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/3cb1a1c5-7b45-49f2-8423-8815b661bd17.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/4d1f2ee6-3993-4b32-a07c-63f342225ada.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/6ed63351-abc8-4ec7-a3d3-d0e5d83daa97.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/1f1517b4-3721-4cfb-ab33-6ca3c9012fcc.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/7d46a2d1-b18e-460f-8f47-c47add59af01.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/abf14c66-d632-4c73-ad6f-fe40df5c0d7c.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/98dc411a-a49a-46bd-8aeb-1751ac40d497.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/room/1886004/fed3b22c-a6f9-4822-b755-ccd4a9869bfe.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
      ],
      amenities: ['Modern Design', 'Natural Light', 'Contemporary Furnishing', 'Premium Location'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://housinganywhere.com/room/ut1239598/de/Berlin/brunnenstra-e',
      sourcePlatform: 'HousingAnywhere'
    },
    {
      id: 'berlin-real-3',
      title: 'Spacious Loft in Absolute Center of Berlin',
      description: 'Spacious loft in the absolute center of Berlin. Featuring flooring and walls made of high-quality concrete. Floor-to-ceiling windows, bright open living/dining area opens into stainless steel kitchen with microwave, dishwasher, coffee machine. Small balcony on courtyard side. Downstairs toilet, upstairs has open work area, TV lounge & hidden laundry. Floating box bedroom with double bed, hidden guest bedroom with queen bed, main bathroom with shower, bath tub & sauna.',
      price: 6500,
      priceUnit: 'month',
      location: 'Linienstraße, Berlin',
      bedrooms: 2,
      bathrooms: 1,
      guests: 3,
      images: [
        'https://housinganywhere.imgix.net/unit_type/1568393/19069135-7d44-4057-a8e3-a5d0494db384.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/9f791bc8-52d6-4638-a100-0ab9a617a969.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/082e667d-66b3-4386-87d3-21a8eb8d915f.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/cd20fcbf-5e6b-41d6-8297-b180ac9f12d0.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/0d38484d-0dec-4740-aeaa-d8f33066a12f.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/92ddcefc-4b4f-47a0-bd34-7e0627ec873e.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/b71cad48-afd2-405b-942e-5e7f1054f28d.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/b6dcca8e-50f6-4cd1-ac0a-9643271d1ebd.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
        'https://housinganywhere.imgix.net/unit_type/1568393/f239c213-a031-42b6-b643-6e9eab6ae693.jpg?ixlib=react-9.8.1&auto=format&fit=clip&cs=srgb&w=2619',
      ],
      amenities: ['Unisex bathroom', 'Private living room', 'Private toilet', 'Private kitchen', 'Stone flooring', 'Central heating', 'Private kitchenware', 'WiFi'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://housinganywhere.com/room/ut1568393/de/Berlin/linienstra-e',
      sourcePlatform: 'HousingAnywhere'
    },
    {
      id: 'berlin-real-4',
      title: 'An Architectural Jewel - The Sapphire Penthouse in Mitte',
      description: 'The building, designed by renowned star architect Daniel Libeskind and inspired by a sapphire, impresses with its outstanding and luxurious details. The exclusivity is also reflected in this penthouse. The interior design includes a dedicated sports room with sauna and a Kinesis wall, which makes the stay an extraordinary experience. The interior design by Fabian Freytag promises maximum comfort and creates a feel-good experience throughout. The three spacious terraces offer a breathtaking view. The penthouse is located in the sought-after northern part of Berlin-Mitte with immediate proximity to Friedrichstrasse.',
      price: 10800,
      priceUnit: 'month',
      location: 'Schwartzkopffstraße, Mitte, Berlin',
      bedrooms: 4,
      bathrooms: 2,
      guests: 4,
      images: [
        'https://listingimages.wunderflats.com/d4G-TH7OG8tFHWctThfjH-large.jpg',
        'https://listingimages.wunderflats.com/8bw4xfsl6mvEvH5irK6UT-large.jpg',
        'https://listingimages.wunderflats.com/xHagj6CWuBqrCsS6UZqhY-large.jpg',
        'https://listingimages.wunderflats.com/UPbaCyikyLF4B8qVzWDuk-large.jpg',
        'https://listingimages.wunderflats.com/s_HVxMhRzTy0gG-Ain4Z7-large.jpg',
        'https://listingimages.wunderflats.com/pUWylN2jiqZ-KYmWZQPG8-large.jpg',
        'https://listingimages.wunderflats.com/-ZZWRyHXOsp8E3YR4CEqh-large.jpg',
        'https://listingimages.wunderflats.com/peWeCzfX69JMw-w9qBGWQ-large.jpg',
        'https://listingimages.wunderflats.com/TkvEn5HYKb4cDvBF7F5wE-large.jpg',
        'https://listingimages.wunderflats.com/wlZHb3VAo6UMTZC2iMsCO-large.jpg',
        'https://listingimages.wunderflats.com/UENuHPHTd7Jr3iG4Lhz7a-large.jpg',
        'https://listingimages.wunderflats.com/49tQb4x4upLqs1cC7UcVg-large.jpg',
        'https://listingimages.wunderflats.com/p-4ocb5T83vEOcXrHokcF-large.jpg',
        'https://listingimages.wunderflats.com/vL8_feJ1x0DI8wuJFBW8l-large.jpg',
      ],
      amenities: ['Washing machine', 'Dryer', 'Coffee machine', 'TV', 'Desk workspace', 'WiFi', 'Balcony', 'Terrace', 'Lift', 'Dishwasher', 'Stove', 'Refrigerator', 'Oven', 'Air conditioning', 'Floor heating', 'Sauna', 'Concierge service', 'Sports room', 'Kinesis wall'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://wunderflats.com/en/furnished-apartment/an-architectural-jewel-the-sapphire-penthouse-in-mitte/6570326e3cc68cefe31f3b33',
      sourcePlatform: 'Wunderflats'
    },
    {
      id: 'berlin-real-5',
      title: 'Pure Luxury - Penthouse with Large Terrace Overlooking Museum Island',
      description: 'The luxurious penthouse is located in Berlin-Mitte and is therefore in a top location, directly on the Spree at Monbijou Park, and offers a spectacular view of the most important historical buildings such as the Berlin Cathedral, the new City Palace and Museum Island. 5 stars plus paired with infinite variety. It combines style, elegance and modernity in one. 353 sqm with 136 sqm roof terrace, sauna, meeting room, and breathtaking views.',
      price: 22000,
      priceUnit: 'month',
      priceHidden: true,
      location: 'Monbijouplatz, Mitte, Berlin',
      bedrooms: 3,
      bathrooms: 3,
      guests: 6,
      images: [
        'https://listingimages.wunderflats.com/qMrvajdBcBT8eIOrok8IY-large.jpg',
        'https://listingimages.wunderflats.com/KcGxwaY2R1zfE1FVnxjwU-large.jpg',
        'https://listingimages.wunderflats.com/BCGZbmpXUPxxaMhZi2qyK-large.jpg',
        'https://listingimages.wunderflats.com/qHxhZKKdQvpRNlamK75mu-large.jpg',
        'https://listingimages.wunderflats.com/3a6q6LkOCS82nNsI5o8wP-large.jpg',
        'https://listingimages.wunderflats.com/xKhHxJuY1F93WvDZULHQ2-large.jpg',
        'https://listingimages.wunderflats.com/Ls93VWpwyjzPFfwy7aTaO-large.jpg',
        'https://listingimages.wunderflats.com/QUZG_RCLZdRw5X3aDSEab-large.jpg',
        'https://listingimages.wunderflats.com/4TdcSewst1FFv5hDkePWt-large.jpg',
        'https://listingimages.wunderflats.com/UbMu97QapOObZZQn0X2HE-large.jpg',
        'https://listingimages.wunderflats.com/MqiubaP1KiYiZSucBSXk4-large.jpg',
        'https://listingimages.wunderflats.com/LFORnP4qQ3_RvX_lixVsd-large.jpg',
        'https://listingimages.wunderflats.com/AmZHwBh3kejDEIus_y_Ap-large.jpg',
        'https://listingimages.wunderflats.com/brnQHBmUv8Jvmtuuev3ts-large.jpg',
        'https://listingimages.wunderflats.com/tinTYEyeQ92vfk4eltA3R-large.jpg',
        'https://listingimages.wunderflats.com/4Z3QE8D8uiahxudQmJMiU-large.jpg',
        'https://listingimages.wunderflats.com/q_JiQ9ov3IlyG3HynVjED-large.jpg',
        'https://listingimages.wunderflats.com/yxwu0PZTAS1s4UhzSlGfM-large.jpg',
      ],
      amenities: ['Washing machine', 'Dryer', 'Coffee machine', 'TV', 'Desk workspace', 'WiFi', 'Large terrace', 'Lift', 'Dishwasher', 'Stove', 'Refrigerator', 'Oven', 'Microwave', 'Air conditioning', 'Smart home technology', 'Floor heating', 'Sauna', '136 sqm roof terrace', 'Museum Island views', 'Meeting room', 'Swimming pool'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://wunderflats.com/en/furnished-apartment/pure-luxury-penthouse-with-large-terrace-overlooking-the-museum-island/65c102d6ffb1f2a151860bc3',
      sourcePlatform: 'Wunderflats'
    },
    {
      id: 'berlin-real-7',
      title: '4 Room Luxury Flat for Rent in Berlin - Premium Tower Living',
      description: 'Premium tower living with 5-star service in a cosmopolitan location. The Beisheim Center is the style-defining building ensemble at Potsdamer Platz. This unique 4-room premium tower apartment for discerning tastes on the 14th floor offers unparalleled panoramic views. The Art Deco-style building was constructed in 2003 by renowned architects. Features impressive living room with 86 square meters of space, high-quality SieMatic fitted kitchen with Miele appliances, Gaggenau cooktop, and Liebherr wine cooler. All bathrooms boast elegant natural stone and marble tiles.',
      price: 12000,
      priceUnit: 'month',
      location: 'Potsdamer Platz, Berlin',
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      images: [
        'https://pic.le-cdn.com/thumbs/1024x768/318/1/properties/Property-44066f48ec35d23468b321cf81cfbba4-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/3/properties/Property-1007e2b3c4b15e2469d7ed2ecafc1d06-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/5/properties/Property-1f7b601b6987618a370c31b24c4c9c27-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/6/properties/Property-885cc2020627d4d5e27aac5a0e9317c9-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/7/properties/Property-3c3df215901925067dd78099bf8fdbd5-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/8/properties/Property-1841e2a76f4ce3e9c570a07e8f25b613-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/9/properties/Property-6098c4c64a00d098409d09900faaea83-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/10/properties/Property-d0a96781ea6522639ca0bbe3a3d6e8d9-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/11/properties/Property-41d793937b06aef83aff1fd5bc360e9d-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/12/properties/Property-765e07141b2263b0d29380836778d00c-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/14/properties/Property-b62a798585365b8a757d3cadcdd7b9c0-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/15/properties/Property-00cea54c85bbd60078a60c06ea4476c5-131678729.jpg',
        'https://pic.le-cdn.com/thumbs/1024x768/318/16/properties/Property-55fc3603cca5fc029d89e98868ddfb6b-131678729.jpg',
      ],
      amenities: ['Premium tower living', '5-star service', 'SieMatic kitchen', 'Miele appliances', 'Gaggenau cooktop', 'Liebherr wine cooler', 'Air conditioning', 'Underfloor heating', 'Natural stone bathrooms', 'Marble tiles', '24/7 concierge', 'Security service', 'Panoramic views', 'Underground parking', 'Ritz Carlton services'],
      type: 'month-to-month',
      available: true,
      featured: true,
      sourceUrl: 'https://www.luxuryestate.com/p131678729-apartment-for-rent-berlin',
      sourcePlatform: 'LuxuryEstate'
    }
    // AI AGENT: Add more real Berlin luxury properties here
  ],
  
  'Paris': [
    // AI AGENT: Add 12 real Paris luxury properties here
    // Search HousingAnywhere Paris for properties €6000+ per month
  ],
  
  'Amsterdam': [
    // AI AGENT: Add 12 real Amsterdam luxury properties here
    // Search HousingAnywhere Amsterdam for properties €6000+ per month
  ],
  
  'Vienna': [
    // AI AGENT: Add real Vienna luxury properties here
    // Search HousingAnywhere Vienna for properties €6000+ per month
  ],
  
  'Barcelona': [
    // AI AGENT: Add real Barcelona luxury properties here
    // Search HousingAnywhere Barcelona for properties €6000+ per month
  ],
  
  'London': [
    // AI AGENT: Add real London luxury properties here
    // Search HousingAnywhere London for properties €6000+ per month
  ],
  
  'Rome': [
    // AI AGENT: Add real Rome luxury properties here
    // Search HousingAnywhere Rome for properties €6000+ per month
  ],
  
  'Prague': [
    // AI AGENT: Add real Prague luxury properties here
    // Search HousingAnywhere Prague for properties €6000+ per month
  ],
  
  'Copenhagen': [
    // AI AGENT: Add real Copenhagen luxury properties here
    // Search HousingAnywhere Copenhagen for properties €6000+ per month
  ],
  
  'Zurich': [
    // AI AGENT: Add real Zurich luxury properties here
    // Search HousingAnywhere Zurich for properties €6000+ per month
  ]
}

// City information for headers - AI Agent will update counts as properties are added
export const cityInfo = {
  'Berlin': {
    title: 'Swift Luxury Berlin',
    description: 'Discover our handpicked selection of luxury rental properties across Berlin\'s most prestigious neighborhoods.',
    count: 6 // Six ultra-luxury properties available
  },
  'Paris': {
    title: 'Luxury Paris Apartments',
    description: 'Experience Parisian elegance with our curated collection of luxury rentals in the City of Light\'s finest arrondissements.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Amsterdam': {
    title: 'Premium Amsterdam Rentals',
    description: 'Discover luxury canal houses and modern apartments in Amsterdam\'s most desirable neighborhoods.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Vienna': {
    title: 'Imperial Vienna Residences',
    description: 'Experience Austrian elegance with luxury apartments in Vienna\'s historic and prestigious districts.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Barcelona': {
    title: 'Luxury Barcelona Apartments',
    description: 'Explore our premium selection of luxury rentals in Barcelona\'s most coveted neighborhoods.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'London': {
    title: 'Prestigious London Rentals',
    description: 'Discover luxury properties in London\'s most exclusive boroughs and historic districts.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Rome': {
    title: 'Luxury Rome Apartments',
    description: 'Experience the Eternal City with our exclusive collection of luxury rentals near Rome\'s iconic landmarks.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Prague': {
    title: 'Premium Prague Rentals',
    description: 'Discover luxury apartments in Prague\'s historic districts with stunning architecture and modern amenities.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Copenhagen': {
    title: 'Luxury Copenhagen Rentals',
    description: 'Experience Scandinavian luxury with our premium collection of Copenhagen apartments.',
    count: 0 // AI Agent: Update this count as you add real properties
  },
  'Zurich': {
    title: 'Premium Zurich Apartments',
    description: 'Discover luxury rentals with stunning lake and mountain views in Switzerland\'s financial capital.',
    count: 0 // AI Agent: Update this count as you add real properties
  }
}