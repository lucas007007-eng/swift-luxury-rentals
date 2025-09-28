// Luxury Spy-Tech Email Templates - James Bond Style
// Matching phantomproperties.co/sales-analytics aesthetic

import { EmailTemplateConfig } from '@/types/email-templates'

export const LUXURY_SPY_TEMPLATES: EmailTemplateConfig[] = [
  // ===== MISSION BRIEFING - VIP WELCOME =====
  {
    id: 'mission-briefing-vip',
    name: '🎯 Mission Briefing - VIP Onboarding',
    description: 'James Bond-style VIP welcome with classified aesthetic',
    category: 'customer',
    subject: '🎯 CLASSIFIED: Your VIP Access Clearance Approved - Agent {{customerName}}',
    preheader: 'Welcome to the elite. Your mission parameters await.',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Agent Name', type: 'text', required: true, placeholder: 'Agent Smith' },
      { key: 'agentCode', label: 'Agent Code', type: 'text', required: false, defaultValue: 'VIP-001' },
      { key: 'clearanceLevel', label: 'Clearance Level', type: 'text', required: false, defaultValue: 'ULTRA-PREMIUM' },
      { key: 'activationDate', label: 'Activation Date', type: 'date', required: false, defaultValue: new Date().toLocaleDateString() }
    ],
    styling: {
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981',
      accentColor: '#ef4444',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'CLASSIFIED BRIEFING',
        subtitle: 'Ultra-Premium Intelligence Division',
        icon: '🎯',
        showLogo: true
      },
      body: {
        greeting: 'Welcome to the Elite, Agent {{customerName}}',
        mainMessage: 'Your VIP clearance has been approved by our Intelligence Division. You now have access to Berlin\'s most classified luxury accommodations network. Your mission: Experience unparalleled luxury with spy-tech precision.',
        sections: [
          {
            id: 'clearance-details',
            type: 'data-table',
            content: {
              title: '🔐 SECURITY CLEARANCE PROFILE',
              data: [
                { label: '🆔 Agent Identity', value: '{{customerName}}' },
                { label: '🔢 Agent Code', value: '{{agentCode}}', style: 'highlight' },
                { label: '🏆 Clearance Level', value: '{{clearanceLevel}}', style: 'success' },
                { label: '📅 Activation Date', value: '{{activationDate}}' },
                { label: '🌍 Operation Zone', value: 'Berlin + 10 European Cities' },
                { label: '⏱️ Mission Duration', value: 'Unlimited Access' }
              ]
            }
          },
          {
            id: 'classified-assets',
            type: 'info-card',
            content: {
              title: '🏢 CLASSIFIED ASSETS - YOUR ARSENAL:',
              items: [
                '🏙️ Ultra-Premium Penthouses - Panoramic city command centers',
                '🤖 AI Concierge Network - 24/7 intelligent assistance protocol',
                '📱 Ghost Protocol App - Instant booking with verified payment methods',
                '🚗 Phantom Transport - Luxury vehicle coordination service',
                '🔐 Security Level Alpha - Military-grade property access systems',
                '🍾 VIP Amenities Package - Personalized luxury experience curation',
                '⚡ Priority Response Team - Sub-60 second emergency assistance',
                '💎 Exclusive Property Access - Member-only locations across Europe',
                '🎯 Concierge Intelligence - Local insider recommendations and bookings'
              ]
            }
          },
          {
            id: 'mission-intel',
            type: 'info-card',
            content: {
              title: '📊 OPERATIONAL INTELLIGENCE:',
              items: [
                '🎯 Mission Success Rate: 99.7% guest satisfaction',
                '⚡ Response Time: Average 47 seconds for urgent requests',
                '🏆 Elite Status: Top 1% of luxury rental networks',
                '🔒 Security Protocol: Zero compromise on guest privacy',
                '🌟 Asset Quality: All properties undergo 47-point inspection',
                '📈 Network Growth: 300% expansion across European capitals'
              ]
            }
          }
        ],
        callToAction: {
          text: 'ACCESS CLASSIFIED PROPERTIES',
          url: '/properties?clearance={{clearanceLevel}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals - Intelligence Division | Unter den Linden 77, 10117 Berlin',
        contactInfo: 'Secure Line: +49 (30) 1234-5678 | Encrypted Channel: intel@phantomproperties.co',
        disclaimer: 'This transmission is classified. Your clearance expires in 90 days without activity.',
        unsubscribeLink: false
      }
    }
  },

  // ===== OPERATION STATUS - BOOKING CONFIRMATION =====
  {
    id: 'operation-status-booking',
    name: '✅ Operation Status - Mission Confirmed',
    description: 'Spy-tech booking confirmation with operational details',
    category: 'booking',
    subject: '✅ OPERATION CONFIRMED - Target Secured: {{propertyName}} | Mission #{{bookingId}}',
    preheader: 'Your luxury accommodation is secured and operational',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Agent Name', type: 'text', required: true },
      { key: 'bookingId', label: 'Mission ID', type: 'text', required: true },
      { key: 'propertyName', label: 'Target Property', type: 'text', required: true },
      { key: 'propertyAddress', label: 'Coordinates', type: 'text', required: true },
      { key: 'checkIn', label: 'Infiltration Date', type: 'date', required: true },
      { key: 'checkOut', label: 'Extraction Date', type: 'date', required: true },
      { key: 'guestCount', label: 'Team Size', type: 'number', required: true },
      { key: 'totalAmount', label: 'Operation Cost', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: '€' },
      { key: 'threatLevel', label: 'Luxury Level', type: 'text', required: false, defaultValue: 'ULTRA-PREMIUM' }
    ],
    styling: {
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      accentColor: '#6366f1',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '8px',
      spacing: 'normal'
    },
    content: {
      header: {
        title: 'OPERATION CONFIRMED',
        subtitle: 'Mission Status: ACTIVE',
        icon: '✅',
        showLogo: true
      },
      body: {
        greeting: 'Agent {{customerName}}, Your Target is Secured',
        mainMessage: 'Operation {{bookingId}} has been confirmed and authorized by our Command Center. Your luxury accommodation target has been secured with military-grade precision. Prepare for infiltration.',
        sections: [
          {
            id: 'mission-parameters',
            type: 'data-table',
            content: {
              title: '🎯 MISSION PARAMETERS - {{propertyName}}',
              data: [
                { label: '📍 Target Coordinates', value: '{{propertyAddress}}' },
                { label: '🗓️ Infiltration Date', value: '{{checkIn}} - 15:00 Hours', style: 'success' },
                { label: '🗓️ Extraction Date', value: '{{checkOut}} - 11:00 Hours', style: 'warning' },
                { label: '👥 Team Size', value: '{{guestCount}} Operatives' },
                { label: '💰 Operation Budget', value: '{{currency}}{{totalAmount}}', style: 'highlight' },
                { label: '🏆 Threat Level', value: '{{threatLevel}}', style: 'success' },
                { label: '🔐 Security Clearance', value: 'ALPHA-VIP Confirmed' }
              ]
            }
          },
          {
            id: 'operational-assets',
            type: 'info-card',
            content: {
              title: '🏢 OPERATIONAL ASSETS CONFIRMED:',
              items: [
                '🏠 Fully Secure Luxury Base - Military-grade accommodation',
                '🛜 Encrypted Network Access - Quantum-secured 1Gb/s connection',
                '📺 Intelligence Monitoring - Smart displays with global networks',
                '🧹 Cleaning Protocol - Professional stealth maintenance service',
                '🔐 Access Control Systems - Biometric and code-based entry',
                '☕ Agent Provisions - Premium coffee, tea, and refreshment stations',
                '🧴 Luxury Amenities - High-end toiletries and Egyptian cotton linens',
                '🚗 Transport Coordination - On-demand luxury vehicle services',
                '📱 Mobile Command Center - Property control via secure app'
              ]
            }
          },
          {
            id: 'mission-intelligence',
            type: 'info-card',
            content: {
              title: '📊 OPERATIONAL INTELLIGENCE:',
              items: [
                '🎯 Property Rating: 5-Star Ultra-Premium Classification',
                '⚡ Response Time: <60 seconds for emergency assistance',
                '🔒 Security Level: Alpha-grade protection protocols',
                '🌟 Guest Satisfaction: 98.7% mission success rate',
                '🏆 Luxury Index: Platinum tier amenities and services',
                '📈 Network Status: Connected to 47 premium properties'
              ]
            }
          }
        ],
        callToAction: {
          text: 'ACCESS MISSION DOSSIER',
          url: '/bookings/{{bookingId}}/briefing',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals - Operations Command | Secure Facility: Unter den Linden 77',
        contactInfo: 'Emergency Protocol: +49 (30) 9876-5432 | Command Center: ops@phantomproperties.co',
        disclaimer: 'Mission briefing will be transmitted 24 hours before infiltration. Maintain operational security.',
        unsubscribeLink: false
      }
    }
  },

  // ===== INTELLIGENCE REPORT - PAYMENT REMINDER =====
  {
    id: 'intelligence-payment-urgent',
    name: '🚨 Intelligence Report - Payment Protocol',
    description: 'Urgent payment reminder with spy-tech urgency and sophistication',
    category: 'payment',
    subject: '🚨 URGENT INTEL - Operation Funding Required: {{propertyName}} | {{daysLeft}} Days to Mission',
    preheader: 'Critical: Operation funding must be secured to maintain mission status',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Agent Name', type: 'text', required: true },
      { key: 'bookingId', label: 'Mission ID', type: 'text', required: true },
      { key: 'propertyName', label: 'Target Property', type: 'text', required: true },
      { key: 'amountDue', label: 'Funding Required', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: '€' },
      { key: 'dueDate', label: 'Deadline', type: 'date', required: true },
      { key: 'daysLeft', label: 'Days Remaining', type: 'number', required: true },
      { key: 'threatLevel', label: 'Priority Level', type: 'text', required: false, defaultValue: 'CRITICAL' }
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
        title: 'URGENT INTELLIGENCE',
        subtitle: 'Operation Funding Required - {{threatLevel}} Priority',
        icon: '🚨',
        showLogo: true
      },
      body: {
        greeting: 'URGENT - Agent {{customerName}}, Immediate Action Required',
        mainMessage: 'Our intelligence division has detected critical funding gaps for Operation {{bookingId}}. Without immediate payment processing, your {{propertyName}} mission will be compromised. Time is of the essence - only {{daysLeft}} days remain.',
        sections: [
          {
            id: 'threat-assessment',
            type: 'data-table',
            content: {
              title: '⚠️ THREAT ASSESSMENT - OPERATION AT RISK',
              data: [
                { label: '🎯 Mission Target', value: '{{propertyName}}' },
                { label: '🆔 Operation Code', value: '{{bookingId}}' },
                { label: '💰 Funding Gap', value: '{{currency}}{{amountDue}}', style: 'highlight' },
                { label: '⏰ Critical Deadline', value: '{{dueDate}}', style: 'warning' },
                { label: '🚨 Time Remaining', value: '{{daysLeft}} Days', style: 'warning' },
                { label: '📊 Mission Status', value: 'FUNDING REQUIRED', style: 'warning' },
                { label: '🔴 Threat Level', value: '{{threatLevel}}', style: 'warning' }
              ]
            }
          },
          {
            id: 'payment-protocols',
            type: 'info-card',
            content: {
              title: '💳 AUTHORIZED PAYMENT PROTOCOLS:',
              items: [
                '💳 Classified Credit Operations - Visa, Mastercard, Amex (Instant)',
                '🏦 Secure Bank Transfer Protocol - SEPA European Network',
                '₿ Cryptocurrency Operations - Bitcoin, Ethereum, USDC (Anonymous)',
                '📱 Digital Wallet Integration - PayPal, Apple Pay, Google Pay',
                '💰 Intelligence Fund Transfer - Klarna Buy Now, Pay Later',
                '🔒 All transactions encrypted with military-grade security',
                '⚡ Instant confirmation upon successful payment processing'
              ]
            }
          },
          {
            id: 'mission-consequences',
            type: 'info-card',
            content: {
              title: '⚠️ MISSION TERMINATION PROTOCOL:',
              items: [
                '🚨 Mission auto-cancellation in {{daysLeft}} days without funding',
                '🔒 Property access codes will be revoked immediately',
                '📊 Agent clearance may be downgraded for future operations',
                '💰 All deposits will be transferred to penalty reserves',
                '🎯 Priority booking status will be suspended',
                '⏰ Immediate payment prevents all consequences'
              ]
            }
          }
        ],
        callToAction: {
          text: 'SECURE OPERATION FUNDING',
          url: '/payments/{{bookingId}}?priority=critical',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals - Financial Intelligence Unit | Secure Operations Center',
        contactInfo: 'Emergency Funding Line: +49 (30) 1234-5678 | Encrypted: funding@phantomproperties.co',
        disclaimer: 'This is an automated intelligence report. Immediate action prevents mission compromise.',
        unsubscribeLink: false
      }
    }
  },

  // ===== VIP INTELLIGENCE NEWSLETTER =====
  {
    id: 'vip-intelligence-newsletter',
    name: '📰 VIP Intelligence Newsletter',
    description: 'Monthly intelligence briefing with market insights and exclusive opportunities',
    category: 'customer',
    subject: '📊 Monthly Intelligence Brief - Exclusive Market Intel for Agent {{customerName}}',
    preheader: 'Classified market intelligence and exclusive opportunities await',
    isActive: true,
    lastModified: new Date().toISOString(),
    variables: [
      { key: 'customerName', label: 'Agent Name', type: 'text', required: true },
      { key: 'monthYear', label: 'Report Period', type: 'text', required: true, defaultValue: 'October 2025' },
      { key: 'marketTrend', label: 'Market Trend', type: 'text', required: false, defaultValue: '+12% Growth' },
      { key: 'newProperties', label: 'New Assets', type: 'number', required: false, defaultValue: 5 },
      { key: 'exclusiveDeals', label: 'Exclusive Deals', type: 'number', required: false, defaultValue: 3 }
    ],
    styling: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontFamily: 'Sora, sans-serif',
      borderRadius: '12px',
      spacing: 'spacious'
    },
    content: {
      header: {
        title: 'VIP INTELLIGENCE BRIEF',
        subtitle: 'Classified Market Analysis - {{monthYear}}',
        icon: '📊',
        showLogo: true
      },
      body: {
        greeting: 'Agent {{customerName}}, Your Intelligence Briefing is Ready',
        mainMessage: 'Our intelligence division has compiled exclusive market insights and opportunities for your review. This classified briefing contains premium opportunities reserved for our most elite operatives.',
        sections: [
          {
            id: 'market-intelligence',
            type: 'data-table',
            content: {
              title: '📈 MARKET INTELLIGENCE SUMMARY',
              data: [
                { label: '📊 Market Trend', value: '{{marketTrend}}', style: 'success' },
                { label: '🏢 New Assets Added', value: '{{newProperties}} Properties', style: 'highlight' },
                { label: '💎 VIP Exclusives', value: '{{exclusiveDeals}} Limited Offers', style: 'success' },
                { label: '🎯 Booking Success Rate', value: '99.2% Confirmed' },
                { label: '⚡ Average Response', value: '< 45 Seconds' },
                { label: '🌍 Network Expansion', value: '12 European Cities' }
              ]
            }
          },
          {
            id: 'featured-assets',
            type: 'info-card',
            content: {
              title: '🏆 FEATURED CLASSIFIED ASSETS:',
              items: [
                '🏙️ Berlin Penthouse Alpha - 360° city surveillance views, 3BR/2BA',
                '🏰 Munich Castle Suite - Historic luxury fortress, private courtyard',
                '🌊 Hamburg Harbor Command - Waterfront operations center, 2BR/2BA',
                '🍷 Frankfurt Executive Base - Financial district command post',
                '🎭 Vienna Opera Intelligence - Cultural quarter infiltration point',
                '🏔️ Zurich Alpine Retreat - Mountain surveillance facility',
                '🌸 Amsterdam Canal House - Historic intelligence safehouse'
              ]
            }
          },
          {
            id: 'exclusive-opportunities',
            type: 'info-card',
            content: {
              title: '💎 EXCLUSIVE VIP OPPORTUNITIES:',
              items: [
                '🎯 Early Access: New Prague penthouse - 48 hours before public',
                '💰 Agent Discount: 25% off Barcelona coastal operations base',
                '🏆 Upgrade Protocol: Complimentary suite upgrades for 30 days',
                '🚗 Transport Package: Free luxury transfers with 3+ night missions',
                '🍾 Welcome Assets: Premium champagne and local delicacies',
                '⚡ Fast-Track Booking: Ghost Protocol instant confirmation'
              ]
            }
          },
          {
            id: 'intelligence-metrics',
            type: 'data-table',
            content: {
              title: '📊 NETWORK PERFORMANCE METRICS',
              data: [
                { label: '🎯 Agent Satisfaction', value: '98.7%', style: 'success' },
                { label: '⚡ Booking Speed', value: '< 60 Seconds', style: 'highlight' },
                { label: '🔒 Security Rating', value: 'AAA+ Classified' },
                { label: '💎 Luxury Index', value: '9.8/10 Premium' },
                { label: '🌍 Global Coverage', value: '12 Major Cities' },
                { label: '📈 Growth Rate', value: '+127% YoY', style: 'success' }
              ]
            }
          }
        ],
        callToAction: {
          text: 'ACCESS EXCLUSIVE INTEL',
          url: '/properties?intel=classified&agent={{customerName}}',
          style: 'primary'
        }
      },
      footer: {
        companyInfo: 'Berlin Luxe Rentals - Intelligence Division | Classification: VIP EYES ONLY',
        contactInfo: 'Intelligence Hotline: +49 (30) 1234-5678 | Secure Channel: intel@phantomproperties.co',
        disclaimer: 'This intelligence is classified VIP-level. Distribution restricted to authorized agents only.',
        unsubscribeLink: true
      }
    }
  }
]
