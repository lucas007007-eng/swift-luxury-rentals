import { Property } from '@/types'

// Luxury properties by city - AI Agent will populate with real listings €6k+/month
export const cityProperties: Record<string, Property[]> = {
  'Berlin': [
    {
      id: 'berlin-reference-1',
      title: 'Sample Luxury Apartment - Reference Style',
      description: 'This is a reference listing to maintain page design and layout. AI Agent will replace this with real luxury properties from HousingAnywhere and other rental sites.',
      price: 8500,
      priceUnit: 'month',
      location: 'Mitte, Berlin',
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Reference Style', 'Design Template', 'Layout Example', 'AI Agent Replace'],
      type: 'month-to-month',
      available: true,
      featured: true,
      isReference: true
    }
    // AI AGENT: Add 12 real Berlin luxury properties here
    // Use the template in src/data/ai-agent-input/CITY_TEMPLATE.ts
    // Search HousingAnywhere for properties €6000+ per month
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
    title: 'Premium Berlin Rentals',
    description: 'Discover our handpicked selection of luxury rental properties across Berlin\'s most prestigious neighborhoods.',
    count: 1 // AI Agent: Update this count as you add real properties
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