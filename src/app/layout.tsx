import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// ServiceWorkerRegistration temporarily removed due to terminal interference

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Swift Luxury - Premium Rentals in Berlin',
  description: 'Discover luxury rental properties in Berlin. Short-term, month-to-month, and long-term rentals made easy with Swift Luxury',
  keywords: 'Berlin rentals, luxury apartments, short-term rentals, long-term rentals, furnished apartments Berlin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}

