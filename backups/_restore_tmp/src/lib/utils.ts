import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = '€'): string {
  // Use consistent formatting to avoid hydration issues
  return `${currency}${price.toLocaleString('de-DE')}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getProxiedImageUrl(url: string): string {
  if (!url) return ''
  try {
    const encoded = encodeURIComponent(url)
    return `/api/img?url=${encoded}`
  } catch {
    return `/api/img?url=${encodeURIComponent(url)}`
  }
}

