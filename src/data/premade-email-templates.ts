// Pre-made Email Templates for Berlin Luxe Rentals
// Professional templates ready for customization

import { EmailTemplateConfig } from '@/types/email-templates'

export const PREMADE_EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  // ===== CUSTOMER ONBOARDING =====
  {
    id: 'welcome-vip',
    name: '🎯 VIP Welcome Series',
    description: 'Premium welcome email for new VIP customers',
    category: 'customer',
    subject: 'Welcome to Berlin Luxe Rentals - Your VIP Access is Now Active 🎯',
    preheader: 'Exclusive access to Berlin\'s most luxurious properties awaits',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true, placeholder: 'John Smith' },
      { key: 'membershipTier', label: 'Membership Tier', type: 'text', required: false, defaultValue: 'VIP', placeholder: 'VIP' },
      { key: 'joinDate', label: 'Join Date', type: 'date', required: false, defaultValue: new Date().toLocaleDateString() }
    ],
    styling: {
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981',
      accentColor: '#6366f1',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'BERLIN LUXE RENTALS',
        subtitle: 'Ultra-Premium Rentals with Spy-Tech Precision',
        icon: '🎯',
        showLogo: true
      },
      body: {
        greeting: 'Welcome to the Elite, {{customerName}}!',
        mainMessage: 'You\'ve just joined Berlin\'s most exclusive rental network. Your {{membershipTier}} status grants you access to properties that blend luxury with cutting-edge technology.',
        sections: [
          {
            id: 'vip-benefits',
            type: 'info-card',
            content: {
              title: '🔓 Your VIP Benefits Include:',
              items: [
                '✨ Priority booking on premium properties across 10+ European cities',
                '🤖 24/7 AI-powered concierge with real-time assistance',
                '📱 Advanced smart home controls via our mobile app',
                '💎 Access to exclusive member-only penthouses and villas',
                '🚗 Complimentary luxury transport coordination',
                '🍾 Welcome amenities and personalized check-in service',
                '⚡ Ghost Protocol: Instant booking with verified payment methods'
              ]
            }
          }
        ],
        callToAction: {
          text: 'EXPLORE ELITE PROPERTIES',
          url: '/properties?tier={{membershipTier}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Unter den Linden 77, 10117 Berlin, Germany',
        contactInfo: 'VIP Concierge: +49 (30) 1234-5678 | Email: concierge@phantomproperties.co',
        disclaimer: 'You received this because you joined our VIP program on {{joinDate}}.',
        unsubscribeLink: false
      }
    }
  },

  // ===== BOOKING CONFIRMATIONS =====
  {
    id: 'booking-confirmed-luxury',
    name: '✅ Luxury Booking Confirmation',
    description: 'Comprehensive booking confirmation with all details',
    category: 'booking',
    subject: '✅ Mission Confirmed - {{propertyName}} | Booking #{{bookingId}}',
    preheader: 'Your luxury accommodation is secured and ready',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'bookingId', label: 'Booking ID', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'checkIn', label: 'Check-in Date', type: 'date', required: true },
      { key: 'checkOut', label: 'Check-out Date', type: 'date', required: true },
      { key: 'checkInTime', label: 'Check-in Time', type: 'text', required: false, defaultValue: '15:00' },
      { key: 'checkOutTime', label: 'Check-out Time', type: 'text', required: false, defaultValue: '11:00' },
      { key: 'guestCount', label: 'Number of Guests', type: 'number', required: true },
      { key: 'totalAmount', label: 'Total Amount', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: '€' },
      { key: 'specialRequests', label: 'Special Requests', type: 'text', required: false }
    ],
    styling: {
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      accentColor: '#ef4444',
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
        mainMessage: 'Your booking has been confirmed and secured with our military-grade encryption. Prepare for a luxury experience that redefines premium hospitality.',
        sections: [
          {
            id: 'property-details',
            type: 'data-table',
            content: {
              title: '🏢 {{propertyName}}',
              data: [
                { label: '📍 Address', value: '{{propertyAddress}}' },
                { label: '📅 Check-in', value: '{{checkIn}} at {{checkInTime}}', style: 'success' },
                { label: '📅 Check-out', value: '{{checkOut}} at {{checkOutTime}}', style: 'warning' },
                { label: '👥 Guests', value: '{{guestCount}}' },
                { label: '💰 Total Amount', value: '{{currency}}{{totalAmount}}', style: 'highlight' }
              ]
            }
          },
          {
            id: 'whats-included',
            type: 'info-card',
            content: {
              title: '🌟 What\'s Included:',
              items: [
                '🏠 Fully furnished luxury accommodation',
                '🛜 High-speed fiber internet (1Gb/s)',
                '📺 Smart TV with Netflix, Amazon Prime, Disney+',
                '🧹 Professional cleaning service',
                '🔐 24/7 secure building access',
                '☕ Premium coffee & tea selection',
                '🧴 Luxury toiletries and linens'
              ]
            }
          }
        ],
        callToAction: {
          text: 'VIEW FULL BOOKING DETAILS',
          url: '/bookings/{{bookingId}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | 24/7 Guest Support: +49 (30) 1234-5678',
        contactInfo: 'Emergency Contact: +49 (30) 9876-5432 | concierge@phantomproperties.co',
        disclaimer: 'Check-in instructions will be sent 24 hours before your arrival.',
        unsubscribeLink: false
      }
    }
  },

  // ===== CHECK-IN INSTRUCTIONS =====
  {
    id: 'checkin-instructions',
    name: '🎯 Check-in Mission Briefing',
    description: 'Comprehensive check-in instructions with access codes',
    category: 'booking',
    subject: '🎯 Mission Briefing - Check-in Instructions for {{propertyName}}',
    preheader: 'Your access codes and check-in details are ready',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'checkIn', label: 'Check-in Date', type: 'date', required: true },
      { key: 'accessCode', label: 'Access Code', type: 'text', required: true },
      { key: 'wifiPassword', label: 'WiFi Password', type: 'text', required: true },
      { key: 'parkingInfo', label: 'Parking Information', type: 'text', required: false },
      { key: 'emergencyContact', label: 'Emergency Contact', type: 'text', required: true }
    ],
    styling: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '8px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'MISSION BRIEFING',
        subtitle: 'Check-in Protocol Activated',
        icon: '🎯',
        showLogo: true
      },
      body: {
        greeting: 'Agent {{customerName}}, Your Mission Begins Tomorrow!',
        mainMessage: 'Your luxury accommodation is ready for infiltration. Below are your classified access credentials and mission parameters.',
        sections: [
          {
            id: 'access-credentials',
            type: 'data-table',
            content: {
              title: '🔐 Access Credentials - CLASSIFIED',
              data: [
                { label: '📍 Target Location', value: '{{propertyAddress}}' },
                { label: '🗓️ Mission Date', value: '{{checkIn}}' },
                { label: '🔑 Access Code', value: '{{accessCode}}', style: 'highlight' },
                { label: '📶 WiFi Password', value: '{{wifiPassword}}' },
                { label: '📞 Emergency Line', value: '{{emergencyContact}}', style: 'success' }
              ]
            }
          },
          {
            id: 'mission-protocol',
            type: 'info-card',
            content: {
              title: '📋 Check-in Protocol:',
              items: [
                '🚪 Use access code on the main entrance keypad',
                '🛗 Take elevator to your floor (code works for elevator too)',
                '📱 Download our app for smart home controls',
                '🔌 All devices are pre-configured and ready',
                '🧳 Leave luggage in designated area if arriving early',
                '📋 Complete digital check-in via QR code inside',
                '☎️ Contact concierge for any immediate assistance'
              ]
            }
          }
        ],
        callToAction: {
          text: 'DOWNLOAD PROPERTY GUIDE',
          url: '/properties/{{bookingId}}/guide',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Mission Control Center',
        contactInfo: '24/7 Agent Support: {{emergencyContact}} | concierge@phantomproperties.co',
        disclaimer: 'This is a secure transmission. Do not forward these credentials.',
        unsubscribeLink: false
      }
    }
  },

  // ===== PAYMENT REMINDERS =====
  {
    id: 'payment-reminder-urgent',
    name: '🚨 Payment Reminder - Urgent',
    description: 'Professional payment reminder with urgency',
    category: 'payment',
    subject: '🚨 Action Required - Payment Due for {{propertyName}} | {{daysLeft}} Days Left',
    preheader: 'Secure your booking by completing payment',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'bookingId', label: 'Booking ID', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'amountDue', label: 'Amount Due', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: '€' },
      { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { key: 'daysLeft', label: 'Days Remaining', type: 'number', required: true },
      { key: 'paymentType', label: 'Payment Type', type: 'text', required: false, defaultValue: 'Final Payment' }
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
        subtitle: 'High Priority Action Required',
        icon: '🚨',
        showLogo: true
      },
      body: {
        greeting: 'Agent {{customerName}}, Immediate Action Required',
        mainMessage: 'Your {{paymentType}} for {{propertyName}} is due in {{daysLeft}} days. Complete payment now to secure your luxury accommodation.',
        sections: [
          {
            id: 'payment-details',
            type: 'data-table',
            content: {
              title: '💳 Payment Details',
              data: [
                { label: '🏢 Property', value: '{{propertyName}}' },
                { label: '📝 Booking ID', value: '{{bookingId}}' },
                { label: '💰 Amount Due', value: '{{currency}}{{amountDue}}', style: 'highlight' },
                { label: '📅 Due Date', value: '{{dueDate}}', style: 'warning' },
                { label: '⏰ Time Left', value: '{{daysLeft}} days', style: 'warning' }
              ]
            }
          },
          {
            id: 'payment-methods',
            type: 'info-card',
            content: {
              title: '💳 Accepted Payment Methods:',
              items: [
                '💳 Credit/Debit Cards (Visa, Mastercard, Amex)',
                '🏦 Bank Transfer (SEPA)',
                '₿ Cryptocurrency (Bitcoin, Ethereum, USDC)',
                '📱 Digital Wallets (PayPal, Apple Pay, Google Pay)',
                '💰 Klarna Buy Now, Pay Later'
              ]
            }
          }
        ],
        callToAction: {
          text: 'COMPLETE PAYMENT NOW',
          url: '/payments/{{bookingId}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Payment Processing Center',
        contactInfo: 'Payment Support: +49 (30) 1234-5678 | billing@phantomproperties.co',
        disclaimer: 'Late payments may result in booking cancellation.',
        unsubscribeLink: false
      }
    }
  },

  // ===== REVIEW REQUESTS =====
  {
    id: 'review-request-luxury',
    name: '⭐ Post-Stay Review Request',
    description: 'Elegant review request after checkout',
    category: 'customer',
    subject: 'How was your luxury experience? Share your thoughts ⭐',
    preheader: 'Help other travelers discover exceptional properties',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'checkOutDate', label: 'Check-out Date', type: 'date', required: true },
      { key: 'stayDuration', label: 'Stay Duration', type: 'text', required: false, defaultValue: '3 nights' },
      { key: 'reviewUrl', label: 'Review URL', type: 'text', required: true }
    ],
    styling: {
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981',
      accentColor: '#6366f1',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'spacious'
    },
    content: {
      header: {
        title: 'MISSION COMPLETE',
        subtitle: 'We Hope You Enjoyed Your Stay',
        icon: '⭐',
        showLogo: true
      },
      body: {
        greeting: 'Thank you, {{customerName}}!',
        mainMessage: 'We hope your {{stayDuration}} stay at {{propertyName}} exceeded your expectations. Your feedback helps us maintain our ultra-premium standards and helps fellow travelers discover exceptional properties.',
        sections: [
          {
            id: 'review-incentive',
            type: 'info-card',
            content: {
              title: '🎁 Review Rewards:',
              items: [
                '⭐ Share your experience and earn 500 loyalty points',
                '📸 Upload photos to receive 10% off your next booking',
                '💬 Detailed reviews unlock exclusive VIP properties',
                '🏆 Top reviewers get invited to our Elite Reviewer Program'
              ]
            }
          }
        ],
        callToAction: {
          text: 'LEAVE A REVIEW',
          url: '{{reviewUrl}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Guest Relations Department',
        contactInfo: 'Feedback: feedback@phantomproperties.co | Phone: +49 (30) 1234-5678',
        disclaimer: 'Your honest feedback is valuable to us and other guests.',
        unsubscribeLink: true
      }
    }
  },

  // ===== PROPERTY MAINTENANCE =====
  {
    id: 'maintenance-notification',
    name: '🔧 Maintenance Notification',
    description: 'Professional maintenance update for guests',
    category: 'system',
    subject: '🔧 Property Enhancement - {{propertyName}} | {{maintenanceDate}}',
    preheader: 'Brief maintenance to improve your experience',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { key: 'maintenanceType', label: 'Maintenance Type', type: 'text', required: true },
      { key: 'maintenanceDate', label: 'Maintenance Date', type: 'date', required: true },
      { key: 'startTime', label: 'Start Time', type: 'text', required: true },
      { key: 'estimatedDuration', label: 'Estimated Duration', type: 'text', required: true },
      { key: 'impact', label: 'Expected Impact', type: 'text', required: false, defaultValue: 'Minimal disruption expected' }
    ],
    styling: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '8px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'PROPERTY ENHANCEMENT',
        subtitle: 'System Optimization in Progress',
        icon: '🔧',
        showLogo: true
      },
      body: {
        greeting: 'Dear {{customerName}},',
        mainMessage: 'We\'re enhancing {{propertyName}} to maintain our ultra-premium standards. This brief maintenance will improve your experience and ensure everything operates flawlessly.',
        sections: [
          {
            id: 'maintenance-details',
            type: 'data-table',
            content: {
              title: '🔧 Enhancement Details',
              data: [
                { label: '🏢 Property', value: '{{propertyName}}' },
                { label: '⚙️ Type', value: '{{maintenanceType}}' },
                { label: '📅 Date', value: '{{maintenanceDate}}' },
                { label: '🕐 Time', value: '{{startTime}}' },
                { label: '⏱️ Duration', value: '{{estimatedDuration}}' },
                { label: '📊 Impact', value: '{{impact}}', style: 'success' }
              ]
            }
          },
          {
            id: 'what-to-expect',
            type: 'info-card',
            content: {
              title: '📋 What to Expect:',
              items: [
                '🔧 Professional technicians with building access',
                '🔒 All work completed with security protocols',
                '📱 Minimal impact on smart home systems',
                '🧹 Area will be cleaned after completion',
                '✅ Enhanced functionality upon completion'
              ]
            }
          }
        ],
        callToAction: {
          text: 'CONTACT CONCIERGE',
          url: '/contact',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | Property Management Team',
        contactInfo: 'Questions? Call: +49 (30) 1234-5678 | Email: maintenance@phantomproperties.co',
        disclaimer: 'We apologize for any inconvenience and appreciate your understanding.',
        unsubscribeLink: false
      }
    }
  },

  // ===== SPECIAL OFFERS =====
  {
    id: 'special-offer-vip',
    name: '🎁 VIP Special Offer',
    description: 'Exclusive deals for VIP customers',
    category: 'customer',
    subject: '🎁 Exclusive VIP Offer - {{discountPercent}}% Off Premium Properties',
    preheader: 'Limited time offer for our most valued guests',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { key: 'discountPercent', label: 'Discount Percentage', type: 'number', required: true },
      { key: 'offerCode', label: 'Promo Code', type: 'text', required: true },
      { key: 'validUntil', label: 'Valid Until', type: 'date', required: true },
      { key: 'minStay', label: 'Minimum Stay', type: 'text', required: false, defaultValue: '3 nights' }
    ],
    styling: {
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      accentColor: '#6366f1',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'spacious'
    },
    content: {
      header: {
        title: 'EXCLUSIVE VIP OFFER',
        subtitle: 'Limited Time - Premium Properties',
        icon: '🎁',
        showLogo: true
      },
      body: {
        greeting: 'Exclusive for You, {{customerName}}!',
        mainMessage: 'As one of our most valued VIP members, you have exclusive access to {{discountPercent}}% off our premium property collection. This offer is valid until {{validUntil}}.',
        sections: [
          {
            id: 'offer-details',
            type: 'data-table',
            content: {
              title: '🎯 Offer Details',
              data: [
                { label: '💰 Discount', value: '{{discountPercent}}%', style: 'highlight' },
                { label: '🎟️ Promo Code', value: '{{offerCode}}', style: 'success' },
                { label: '📅 Valid Until', value: '{{validUntil}}', style: 'warning' },
                { label: '🏠 Minimum Stay', value: '{{minStay}}' },
                { label: '🌟 Eligible Properties', value: 'Premium & VIP Only' }
              ]
            }
          },
          {
            id: 'featured-properties',
            type: 'info-card',
            content: {
              title: '🏢 Featured Premium Properties:',
              items: [
                '🏙️ Berlin Penthouse Suite - Panoramic city views',
                '🏰 Munich Castle Apartment - Historic luxury',
                '🌊 Hamburg Waterfront Loft - Harbor views',
                '🍷 Frankfurt Executive Suite - Business district',
                '🎭 Vienna Opera House Residence - Cultural quarter'
              ]
            }
          }
        ],
        callToAction: {
          text: 'BOOK WITH VIP DISCOUNT',
          url: '/properties?promo={{offerCode}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals | VIP Services Department',
        contactInfo: 'VIP Concierge: +49 (30) 1234-5678 | vip@phantomproperties.co',
        disclaimer: 'Offer valid for new bookings only. Terms and conditions apply.',
        unsubscribeLink: true
      }
    }
  }
]
