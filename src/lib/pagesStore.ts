import prisma from '@/lib/prisma'

export type EditablePage = {
  slug: string
  route: string
  displayName: string
  seoTitle: string
  seoDescription: string
  ogImage?: string
  content?: string
  // Optional granular content overrides (keyed by section id)
  contentOverrides?: Record<string, string>
  updatedAt?: string
}

const PAGE_OVERRIDE_KEY = 'site-pages'

const defaultPages: EditablePage[] = [
  { slug: 'home', route: '/', displayName: 'Home', seoTitle: 'Swift Luxury — Premium Rentals in Berlin', seoDescription: 'Luxury serviced apartments. Month-to-month and longer stays.' },
  { slug: 'properties', route: '/properties', displayName: 'Properties', seoTitle: 'Luxury Properties — Swift Luxury', seoDescription: 'Explore our curated luxury apartments across Europe.' },
  { slug: 'city', route: '/city/[cityName]', displayName: 'City Page', seoTitle: 'City Rentals — Swift Luxury', seoDescription: 'Find furnished rentals in your destination city.' },
  { slug: 'property', route: '/property/[id]', displayName: 'Property Detail', seoTitle: 'Property — Swift Luxury', seoDescription: 'See photos, amenities, availability, and pricing.' },
  { slug: 'about', route: '/about', displayName: 'About', seoTitle: 'About Swift Luxury', seoDescription: 'About our service and promise.' },
  { slug: 'contact', route: '/contact', displayName: 'Contact', seoTitle: 'Contact Swift Luxury', seoDescription: 'Get in touch with our team.' },
  { slug: 'pricing', route: '/pricing', displayName: 'Pricing', seoTitle: 'Pricing — Swift Luxury', seoDescription: 'Transparent pricing for monthly stays.' },
  { slug: 'corporate', route: '/corporate-rentals', displayName: 'Corporate Rentals', seoTitle: 'Corporate Rentals — Swift Luxury', seoDescription: 'Flexible housing for teams and executives.' },
  { slug: 'list', route: '/list-your-property', displayName: 'List Your Property', seoTitle: 'List Your Property — Swift Luxury', seoDescription: 'Partner with us to host your property.' },
  { slug: 'privacy', route: '/privacy', displayName: 'Privacy Policy', seoTitle: 'Privacy Policy — Swift Luxury', seoDescription: 'How we handle your data.' },
  { slug: 'terms', route: '/terms', displayName: 'Terms of Service', seoTitle: 'Terms — Swift Luxury', seoDescription: 'Legal terms and conditions.' },
  { slug: 'cookies', route: '/cookie-policy', displayName: 'Cookie Policy', seoTitle: 'Cookie Policy — Swift Luxury', seoDescription: 'Cookies and tracking technologies.' },
]

function toIndex(pages: EditablePage[]) {
  const map: Record<string, EditablePage> = {}
  for (const p of pages) map[p.slug] = p
  return map
}

export async function getAllPages(): Promise<EditablePage[]> {
  try {
    const rec = await prisma.adminOverride.findUnique({ where: { propertyExtId: PAGE_OVERRIDE_KEY } })
    const stored = rec?.data && (rec.data as any).pages
    const current = Array.isArray(stored) ? stored as EditablePage[] : []
    // merge defaults with stored, stored wins
    const merged: EditablePage[] = []
    const bySlug = toIndex(current)
    for (const d of defaultPages) merged.push({ ...d, ...(bySlug[d.slug] || {}) })
    // include any extra custom pages
    for (const k of Object.keys(bySlug)) if (!merged.some(p => p.slug === k)) merged.push(bySlug[k])
    return merged
  } catch {
    return defaultPages
  }
}

export async function getPage(slug: string): Promise<EditablePage | null> {
  const all = await getAllPages()
  return all.find(p => p.slug === slug) || null
}

export async function upsertPage(slug: string, input: Partial<EditablePage>): Promise<EditablePage> {
  const all = await getAllPages()
  const idx = all.findIndex(p => p.slug === slug)
  const base = idx >= 0 ? all[idx] : { slug, route: `/${slug}`, displayName: slug, seoTitle: '', seoDescription: '' }
  const mergedOverrides = { ...(base.contentOverrides || {}), ...(input.contentOverrides || {}) }
  const updated: EditablePage = { ...base, ...input, contentOverrides: mergedOverrides, slug, updatedAt: new Date().toISOString() }
  const next = [...all]
  if (idx >= 0) next[idx] = updated; else next.push(updated)
  try {
    await prisma.adminOverride.upsert({
      where: { propertyExtId: PAGE_OVERRIDE_KEY },
      update: { data: { pages: next } as any },
      create: { propertyExtId: PAGE_OVERRIDE_KEY, data: { pages: next } as any },
    })
  } catch {}
  return updated
}

export function getDefaultContent(slug: string): Record<string, string> {
  if (slug === 'about') {
    return {
      'hero.subtitle': 'Revolutionizing luxury rentals across Europe with cryptocurrency payments and premium service',
      'mission.body': 'Swift Luxury is pioneering the future of luxury rentals by combining premium European properties with cutting-edge cryptocurrency payment solutions. We believe luxury living should be accessible and payments should be seamless.',
      'mission.body.2': 'Our platform connects discerning travelers and long-term residents with Europe\'s finest rental properties, offering unparalleled convenience through our revolutionary crypto payment system.',
      'values.intro': 'The principles that guide everything we do at Swift Luxury',
      'features.intro': 'Revolutionary features that set Swift Luxury apart from traditional rental platforms',
      'cta.subtitle': 'Discover our curated collection of ultra-luxury properties across Europe',
    }
  }
  if (slug === 'home') {
    return {
      'hero.subtitle': 'Discover luxury furnished apartments across Europe with flexible month-to-month leases and secure crypto payments',
      'mission.body': 'Swift Luxury offers premium furnished apartments in Europe\'s most desirable cities. Experience luxury living with the convenience of cryptocurrency payments.',
      'mission.body.2': 'From Berlin to Paris, our handpicked properties provide the perfect blend of comfort, style, and technology for modern travelers and residents.',
      'values.intro': 'Why choose Swift Luxury for your premium rental needs',
      'features.intro': 'Advanced features designed for the modern luxury traveler',
      'cta.subtitle': 'Join the Swift Luxury Network and access exclusive properties with crypto-enabled payments',
    }
  }
  if (slug === 'properties') {
    return {
      'hero.subtitle': 'Browse our curated collection of luxury properties across Europe\'s most prestigious cities',
      'mission.body': 'Each property is handpicked for its exceptional quality, prime location, and luxury amenities to ensure your stay exceeds expectations.',
      'mission.body.2': 'From penthouse apartments in Berlin to elegant flats in Paris, discover your perfect temporary home.',
      'values.intro': 'What makes our property collection exceptional',
      'features.intro': 'Premium amenities and services included with every property',
      'cta.subtitle': 'Find your perfect luxury rental and book with cryptocurrency',
    }
  }
  if (slug === 'contact') {
    return {
      'hero.subtitle': 'Get in touch with our luxury rental specialists for personalized assistance',
      'mission.body': 'Our dedicated team is here to help you find the perfect luxury accommodation or answer any questions about our services.',
      'mission.body.2': 'Whether you\'re booking a short stay or looking for a long-term rental, we\'re committed to providing exceptional service.',
      'values.intro': 'How we can assist you with your luxury rental needs',
      'features.intro': 'Multiple ways to connect with our expert team',
      'cta.subtitle': 'Ready to experience luxury living? Contact us today',
    }
  }
  if (slug === 'corporate') {
    return {
      'hero.subtitle': 'Flexible corporate housing solutions for teams, executives, and business travelers',
      'mission.body': 'Swift Luxury Corporate provides premium furnished accommodations designed specifically for business needs with flexible terms and professional service.',
      'mission.body.2': 'From executive relocations to team housing, we offer customized solutions that meet your company\'s requirements.',
      'values.intro': 'Why leading companies choose Swift Luxury for corporate housing',
      'features.intro': 'Enterprise-grade services tailored for business travelers',
      'cta.subtitle': 'Contact our corporate team for customized housing solutions',
    }
  }
  if (slug === 'pricing') {
    return {
      'hero.subtitle': 'Transparent pricing for luxury furnished apartments with no hidden fees',
      'mission.body': 'Our pricing is straightforward and competitive, with all costs clearly outlined upfront so you can make informed decisions.',
      'mission.body.2': 'From monthly rates to service fees, everything is transparent with options for traditional and cryptocurrency payments.',
      'values.intro': 'What\'s included in our pricing structure',
      'features.intro': 'Pricing benefits that provide exceptional value',
      'cta.subtitle': 'Ready to secure your luxury rental? View our competitive rates',
    }
  }
  if (slug === 'list') {
    return {
      'hero.subtitle': 'Partner with Swift Luxury to list your premium property and access our exclusive clientele',
      'mission.body': 'We work with property owners to showcase exceptional rental properties to our curated network of luxury travelers and residents.',
      'mission.body.2': 'Our platform provides maximum exposure for your property while maintaining the highest standards of service and guest quality.',
      'values.intro': 'Benefits of listing your property with Swift Luxury',
      'features.intro': 'Professional services to maximize your property\'s potential',
      'cta.subtitle': 'Ready to list your luxury property? Get started today',
    }
  }
  if (slug === 'privacy') {
    return {
      'hero.subtitle': 'Your privacy and data security are our top priorities',
      'mission.body': 'This privacy policy explains how Swift Luxury collects, uses, and protects your personal information when you use our services.',
      'mission.body.2': 'We are committed to transparency and compliance with all applicable data protection regulations.',
      'values.intro': 'Our commitment to protecting your personal information',
      'features.intro': 'Security measures we implement to safeguard your data',
      'cta.subtitle': 'Questions about our privacy practices? Contact our team',
    }
  }
  if (slug === 'terms') {
    return {
      'hero.subtitle': 'Terms of service governing your use of Swift Luxury platform and services',
      'mission.body': 'These terms outline the legal relationship between you and Swift Luxury when using our rental platform and related services.',
      'mission.body.2': 'By using our platform, you agree to these terms which are designed to protect both guests and property owners.',
      'values.intro': 'Key terms that govern our service relationship',
      'features.intro': 'Rights and responsibilities for platform users',
      'cta.subtitle': 'Have questions about our terms? Contact our legal team',
    }
  }
  if (slug === 'cookies') {
    return {
      'hero.subtitle': 'How Swift Luxury uses cookies and tracking technologies to enhance your experience',
      'mission.body': 'We use cookies and similar technologies to provide personalized experiences, analyze usage, and improve our services.',
      'mission.body.2': 'This policy explains what cookies we use, why we use them, and how you can control your preferences.',
      'values.intro': 'Types of cookies used on our platform',
      'features.intro': 'How cookies enhance your browsing experience',
      'cta.subtitle': 'Manage your cookie preferences or contact us with questions',
    }
  }
  return {}
}


