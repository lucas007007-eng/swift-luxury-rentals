import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  if (envUrl) {
    const hasProtocol = envUrl.startsWith('http://') || envUrl.startsWith('https://')
    return hasProtocol ? envUrl : `https://${envUrl}`
  }
  return 'http://localhost:3002'
})()

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Swift Luxury - Premium Rentals in Berlin',
  description: 'Discover luxury rental properties in Berlin. Short-term, month-to-month, and long-term rentals made easy with Swift Luxury',
  keywords: 'Berlin rentals, luxury apartments, short-term rentals, long-term rentals, furnished apartments Berlin',
  openGraph: {
    title: 'Swift Luxury - Premium Rentals in Berlin',
    description: 'Discover luxury rental properties in Berlin. Short-term, month-to-month, and long-term rentals made easy with Swift Luxury',
    url: baseUrl,
    siteName: 'Swift Luxury',
    images: [
      {
        url: '/images/berlin-illustration.png',
        width: 1200,
        height: 630,
        alt: 'Swift Luxury Rentals',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          <ServiceWorkerRegistration />
          <div className="w-full overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

