import type { MetadataRoute } from 'next'

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  if (envUrl) {
    const hasProtocol = envUrl.startsWith('http://') || envUrl.startsWith('https://')
    return hasProtocol ? envUrl : `https://${envUrl}`
  }
  return 'http://localhost:3002'
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ''),
  }
}


