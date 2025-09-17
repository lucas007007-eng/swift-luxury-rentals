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
  return {}
}


