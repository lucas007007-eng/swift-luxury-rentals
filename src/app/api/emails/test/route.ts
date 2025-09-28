// Test Email API - Send test emails for design and deliverability testing
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { EmailTemplateConfig } from '@/types/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { 
      template, 
      testEmail, 
      testData,
      testType 
    }: {
      template: EmailTemplateConfig
      testEmail: string
      testData?: Record<string, any>
      testType: 'design' | 'deliverability' | 'spam'
    } = await request.json()

    if (!template || !testEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: template and testEmail' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Default test data if not provided
    const defaultTestData = {
      customerName: 'Test User',
      customerEmail: testEmail,
      bookingId: 'TEST-' + Date.now(),
      propertyName: 'Test Property Suite',
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 10 days from now
      totalAmount: 1250,
      currency: '€',
      guestCount: 2,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 days from now
      amount: 500,
      actionRequired: 'Complete test payment for your booking',
      timestamp: new Date().toLocaleString()
    }

    const finalTestData = { ...defaultTestData, ...testData }

    // Generate test email HTML and plain-text based on template
    let testHtml = generateTestEmailHtml(template, finalTestData, testType)
    let testText = generateTestEmailText(template, finalTestData)
    
    // Add test email headers for different test types
    let subject = template.subject
    if (testType === 'spam') {
      subject = `[SPAM TEST] ${template.subject}`
    } else if (testType === 'deliverability') {
      // Keep subject as-is but sanitize for deliverability (remove emojis and excessive caps)
      subject = sanitizeSubjectForDeliverability(template.subject)
    } else {
      // Design test: avoid spammy prefixes; keep original for visual checks
      subject = template.subject
    }

    // Replace variables in subject
    subject = replaceVariables(subject, finalTestData)

    // Send test email using Resend directly for better analytics
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const replyTo = process.env.RESEND_REPLY_TO_EMAIL || fromAddress

    const emailResult = await resend.emails.send({
      from: fromAddress,
      to: [testEmail],
      subject: subject,
      html: testHtml,
      text: testText,
      replyTo: replyTo,
      headers: {
        'X-Test-Type': testType,
        'X-Template-Name': template.name,
        'X-Test-Timestamp': new Date().toISOString(),
        // Include unsubscribe URL for client recognition
        'List-Unsubscribe': '<https://www.phantomproperties.co/unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    })

    // Log test email for tracking
    console.log(`Test email sent:`, {
      testType,
      recipient: testEmail,
      template: template.name,
      emailId: emailResult.data?.id,
      timestamp: new Date().toISOString()
    })

    // Get Resend analytics if available
    let deliveryStatus = 'sent'
    let analyticsData = null

    try {
      // Try to get email status from Resend (if API supports it)
      if (emailResult.data?.id) {
        // Note: Resend doesn't have a public get email API yet, but we can prepare for it
        analyticsData = {
          emailId: emailResult.data.id,
          status: 'sent',
          sentAt: new Date().toISOString(),
          provider: 'resend'
        }
      }
    } catch (analyticsError) {
      console.log('Analytics not available:', analyticsError)
    }

    return NextResponse.json({
      success: true,
      message: `${testType} test email sent successfully`,
      emailId: emailResult.data?.id,
      testData: finalTestData,
      recipientEmail: testEmail,
      templateName: template.name,
      testType,
      sentAt: new Date().toISOString(),
      deliverabilityTips: getDeliverabilityTips(testType),
      analytics: analyticsData,
      deliveryStatus,
      resendResponse: {
        id: emailResult.data?.id,
        status: emailResult.error ? 'error' : 'sent'
      },
      warnings: !process.env.RESEND_FROM_EMAIL ? ['Using fallback from address onboarding@resend.dev; verify your sending domain for best deliverability.'] : []
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Generate test email HTML from template
function generateTestEmailHtml(
  template: EmailTemplateConfig, 
  testData: Record<string, any>,
  testType: 'design' | 'deliverability' | 'spam'
): string {
  const testBanner = getTestBanner(testType)
  
  const baseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${template.subject}</title>
    </head>
    <body style="font-family: ${template.styling.fontFamily}; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; margin: 0; padding: 0;">
      ${testBanner}
      
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid ${template.styling.primaryColor};">
          <h1 style="color: ${template.styling.primaryColor}; font-size: 28px; margin: 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">
            ${template.content.header.icon} ${replaceVariables(template.content.header.title, testData)}
          </h1>
          ${template.content.header.subtitle ? `
            <p style="color: ${template.styling.secondaryColor}; margin: 10px 0 0 0; font-weight: 600;">
              ${replaceVariables(template.content.header.subtitle, testData)}
            </p>
          ` : ''}
        </div>
        
        <!-- Body -->
        <div style="background-color: #0a0a0a; padding: 30px 20px; border-left: 3px solid ${template.styling.primaryColor}; margin: 20px 0;">
          <h2 style="color: ${template.styling.primaryColor}; margin-top: 0;">
            ${replaceVariables(template.content.body.greeting, testData)}
          </h2>
          
          <p style="color: #cccccc; line-height: 1.6;">
            ${replaceVariables(template.content.body.mainMessage, testData)}
          </p>
          
          <!-- Dynamic Content Sections -->
          ${template.content.body.sections.map(section => generateSectionHtml(section, testData, template.styling)).join('')}
          
          ${template.content.body.callToAction ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${template.content.body.callToAction.url}" 
                 style="display: inline-block; background: linear-gradient(135deg, ${template.styling.primaryColor} 0%, ${template.styling.secondaryColor} 100%); color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${template.content.body.callToAction.text}
              </a>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            ${template.content.footer.companyInfo}
          </p>
          <p style="color: #555; font-size: 10px; margin: 10px 0 0 0;">
            ${replaceVariables(template.content.footer.contactInfo, testData)}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return baseHtml
}

// Generate a plain-text alternative for better deliverability
function generateTestEmailText(
  template: EmailTemplateConfig,
  data: Record<string, any>
): string {
  const lines: string[] = []
  lines.push(`${replaceVariables(template.content.header.title, data)}`)
  if (template.content.header.subtitle) {
    lines.push(`${replaceVariables(template.content.header.subtitle, data)}`)
  }
  lines.push('')
  lines.push(replaceVariables(template.content.body.greeting, data))
  lines.push('')
  lines.push(replaceVariables(template.content.body.mainMessage, data))
  lines.push('')
  for (const section of template.content.body.sections) {
    if (section.type === 'info-card' && section.content?.items) {
      for (const item of section.content.items) {
        lines.push(`- ${replaceVariables(item, data)}`)
      }
      lines.push('')
    }
    if (section.type === 'data-table' && section.content?.data) {
      for (const row of section.content.data) {
        lines.push(`${row.label}: ${replaceVariables(row.value, data)}`)
      }
      lines.push('')
    }
  }
  if (template.content.body.callToAction) {
    lines.push('')
    lines.push(`${template.content.body.callToAction.text}: ${template.content.body.callToAction.url}`)
  }
  lines.push('')
  lines.push(template.content.footer.companyInfo)
  lines.push(template.content.footer.contactInfo)
  return lines.join('\n')
}

// Sanitize subject to avoid common spam triggers (remove emojis and excessive caps)
function sanitizeSubjectForDeliverability(subject: string): string {
  // Remove non-ASCII characters (approximate emoji removal without Unicode property escapes)
  const withoutEmoji = subject.replace(/[^\x00-\x7F]/g, '')
  // Reduce long ALL CAPS words
  return withoutEmoji.replace(/\b([A-Z]{6,})\b/g, (m) => m.charAt(0) + m.slice(1).toLowerCase())
}

// Generate test banner based on test type
function getTestBanner(testType: string): string {
  const banners = {
    design: {
      bg: '#3B82F6',
      text: '🎨 DESIGN TEST EMAIL',
      desc: 'This is a test email to check design and layout'
    },
    deliverability: {
      bg: '#10B981',
      text: '📬 DELIVERABILITY TEST',
      desc: 'This email tests inbox placement and deliverability'
    },
    spam: {
      bg: '#EF4444',
      text: '🚨 SPAM FILTER TEST',
      desc: 'This email tests spam filter performance'
    }
  }

  const banner = banners[testType as keyof typeof banners] || banners.design

  return `
    <div style="background-color: ${banner.bg}; color: white; padding: 10px 20px; text-align: center; font-size: 14px; font-weight: 600;">
      ${banner.text}
      <div style="font-size: 12px; font-weight: normal; margin-top: 5px; opacity: 0.9;">
        ${banner.desc}
      </div>
    </div>
  `
}

// Generate section HTML
function generateSectionHtml(section: any, testData: Record<string, any>, styling: any): string {
  switch (section.type) {
    case 'info-card':
      return `
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid ${styling.primaryColor};">
          <h3 style="color: ${styling.primaryColor}; margin-top: 0;">${section.content.title}</h3>
          <ul style="color: #cccccc; padding-left: 20px;">
            ${section.content.items.map((item: string) => `<li>${replaceVariables(item, testData)}</li>`).join('')}
          </ul>
        </div>
      `
    
    case 'data-table':
      return `
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid ${styling.primaryColor};">
          <h3 style="color: ${styling.primaryColor}; margin-top: 0;">${replaceVariables(section.content.title, testData)}</h3>
          <div style="background-color: #0a0a0a; padding: 20px; border-radius: 8px;">
            ${section.content.data.map((item: any) => `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #ccc;">${item.label}</span>
                <span style="color: ${item.style === 'success' ? '#10b981' : item.style === 'warning' ? '#f59e0b' : item.style === 'highlight' ? '#10b981' : '#fff'}; font-weight: ${item.style === 'highlight' ? '600' : 'normal'}; ${item.style === 'highlight' ? 'font-size: 20px;' : ''}">${replaceVariables(item.value, testData)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `
    
    default:
      return ''
  }
}

// Replace template variables
function replaceVariables(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

// Get deliverability tips based on test type
function getDeliverabilityTips(testType: string): string[] {
  const tips = {
    design: [
      'Check how the email appears on mobile and desktop',
      'Ensure images load properly and have alt text',
      'Verify all links work correctly',
      'Test with different email clients (Gmail, Outlook, Apple Mail)'
    ],
    deliverability: [
      'Check if email lands in Primary inbox (not Promotions/Spam)',
      'Verify sender reputation and domain authentication',
      'Monitor open and click rates',
      'Check for any delivery delays'
    ],
    spam: [
      'Avoid excessive use of promotional words',
      'Maintain good text-to-image ratio',
      'Use proper sender authentication (SPF, DKIM, DMARC)',
      'Monitor spam complaint rates'
    ]
  }

  return tips[testType as keyof typeof tips] || tips.design
}
