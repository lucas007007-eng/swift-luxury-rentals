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
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Nunito:wght@300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@300;400;600;700;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700;800;900&family=Oswald:wght@300;400;500;600;700&family=Ubuntu:wght@300;400;500;700&family=Quicksand:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Lobster&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Great+Vibes&family=Amatic+SC:wght@400;700&family=Comfortaa:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
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

