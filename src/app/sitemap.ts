import type { MetadataRoute } from 'next'

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  if (envUrl) {
    const hasProtocol = envUrl.startsWith('http://') || envUrl.startsWith('https://')
    return hasProtocol ? envUrl : `https://${envUrl}`
  }
  return 'http://localhost:3002'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  // Public routes only
  const routes = ['/', '/properties']

  // Optionally include city pages present in data
  // Keep it simple and safe to avoid runtime issues

  const now = new Date()
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }))
}


