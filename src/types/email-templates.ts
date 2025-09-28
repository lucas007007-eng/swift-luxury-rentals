// Email Template Configuration Types
export interface EmailTemplateConfig {
  id: string
  name: string
  description: string
  category: 'customer' | 'booking' | 'payment' | 'reminder' | 'system'
  subject: string
  preheader?: string
  isActive: boolean
  lastModified: string
  variables: TemplateVariable[]
  styling: TemplateStyling
  content: TemplateContent
}

export interface TemplateVariable {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'boolean' | 'object'
  required: boolean
  defaultValue?: any
  description?: string
  placeholder?: string
}

export interface TemplateStyling {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  spacing: 'compact' | 'normal' | 'spacious'
}

export interface TemplateContent {
  header: {
    title: string
    subtitle?: string
    icon?: string
    showLogo: boolean
  }
  body: {
    greeting: string
    mainMessage: string
    sections: TemplateSection[]
    callToAction?: {
      text: string
      url: string
      style: 'primary' | 'secondary' | 'success' | 'warning'
    }
  }
  footer: {
    companyInfo: string
    contactInfo: string
    disclaimer?: string
    unsubscribeLink?: boolean
  }
}

export interface TemplateSection {
  id: string
  type: 'text' | 'info-card' | 'data-table' | 'image' | 'divider' | 'button'
  content: any
  styling?: Partial<TemplateStyling>
  conditions?: TemplateCondition[]
}

export interface TemplateCondition {
  variable: string
  operator: 'equals' | 'not-equals' | 'contains' | 'exists' | 'greater-than' | 'less-than'
  value: any
}

// Default template configurations
export const DEFAULT_TEMPLATES: EmailTemplateConfig[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to new customers when they sign up',
    category: 'customer',
    subject: '🎯 Welcome to Berlin Luxe Rentals - Your VIP Access is Active',
    preheader: 'Welcome to the elite rental experience',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true, placeholder: 'John Doe' },
      { key: 'customerEmail', label: 'Customer Email', type: 'email', required: true, placeholder: 'john@example.com' }
    ],
    styling: {
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981',
      accentColor: '#ef4444',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '8px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'BERLIN LUXE RENTALS',
        subtitle: 'Ultra-premium rentals with spy-tech precision',
        icon: '🏙️',
        showLogo: true
      },
      body: {
        greeting: 'Welcome to the Elite, {{customerName}}!',
        mainMessage: 'You\'ve just joined Berlin\'s most exclusive rental platform. Get ready for accommodations that blend luxury with cutting-edge technology.',
        sections: [
          {
            id: 'vip-features',
            type: 'info-card',
            content: {
              title: '🔓 Your VIP Access Includes:',
              items: [
                '✨ Priority booking on premium properties',
                '🤖 24/7 AI-powered concierge support',
                '📱 Advanced property controls via mobile app',
                '💎 Exclusive member-only properties',
                '🚗 Complimentary luxury transport coordination'
              ]
            }
          }
        ],
        callToAction: {
          text: 'EXPLORE ELITE PROPERTIES',
          url: '/properties',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Unter den Linden 77, Berlin',
        contactInfo: 'This is a secure transmission. Do not forward.',
        disclaimer: undefined,
        unsubscribeLink: false
      }
    }
  },
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    description: 'Sent when a booking is confirmed',
    category: 'booking',
    subject: '✅ Mission Confirmed - Booking #{{bookingId}} | {{propertyName}}',
    preheader: 'Your elite accommodation awaits',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'bookingId', label: 'Booking ID', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'checkIn', label: 'Check-in Date', type: 'date', required: true },
      { key: 'checkOut', label: 'Check-out Date', type: 'date', required: true },
      { key: 'totalAmount', label: 'Total Amount', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: '€' },
      { key: 'guestCount', label: 'Guest Count', type: 'number', required: true },
      { key: 'specialInstructions', label: 'Special Instructions', type: 'text', required: false }
    ],
    styling: {
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      accentColor: '#06b6d4',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'MISSION CONFIRMED',
        subtitle: 'Booking #{{bookingId}}',
        icon: '✅',
        showLogo: true
      },
      body: {
        greeting: 'Your Elite Accommodation Awaits, {{customerName}}!',
        mainMessage: 'Your booking has been confirmed and secured with our military-grade encryption. Prepare for luxury redefined.',
        sections: [
          {
            id: 'booking-details',
            type: 'data-table',
            content: {
              title: '🏢 {{propertyName}}',
              data: [
                { label: '📅 CHECK-IN', value: '{{checkIn}}', style: 'success' },
                { label: '📅 CHECK-OUT', value: '{{checkOut}}', style: 'warning' },
                { label: '👥 Guests', value: '{{guestCount}}' },
                { label: '💰 Total', value: '{{currency}}{{totalAmount}}', style: 'highlight' }
              ]
            }
          }
        ],
        callToAction: {
          text: 'VIEW BOOKING DETAILS',
          url: '/bookings/{{bookingId}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | 24/7 Support: +49 (30) 1234-5678',
        contactInfo: 'Booking confirmed at {{timestamp}}',
        disclaimer: undefined,
        unsubscribeLink: false
      }
    }
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    description: 'Sent when payment is due',
    category: 'reminder',
    subject: '🚨 URGENT - Payment Required for {{propertyName}}',
    preheader: 'Action required to secure your booking',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'amount', label: 'Amount Due', type: 'currency', required: true },
      { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { key: 'bookingId', label: 'Booking ID', type: 'text', required: true }
    ],
    styling: {
      primaryColor: '#ef4444',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '8px',
      spacing: 'compact'
    },
    content: {
      header: {
        title: 'PAYMENT REQUIRED',
        subtitle: 'HIGH PRIORITY',
        icon: '💳',
        showLogo: true
      },
      body: {
        greeting: 'Agent {{customerName}}, Action Required',
        mainMessage: 'Your payment for {{propertyName}} is due. Immediate action required to maintain your booking.',
        sections: [
          {
            id: 'payment-details',
            type: 'info-card',
            content: {
              title: '💳 Payment Details:',
              items: [
                'Property: {{propertyName}}',
                'Amount Due: €{{amount}}',
                'Due Date: {{dueDate}}',
                'Booking ID: {{bookingId}}'
              ]
            }
          }
        ],
        callToAction: {
          text: 'PAY NOW',
          url: '/payments/{{bookingId}}',
          style: 'warning'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals CRM | Automated Mission Control',
        contactInfo: 'This message was generated by our AI system',
        disclaimer: undefined,
        unsubscribeLink: false
      }
    }
  }
]
