import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, inquiryType, subject, message } = body

    // Validate required fields
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send notification to admin using custom template
    const adminNotificationHtml = `
      <div style="font-family: 'Sora', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">
            📧 NEW CONTACT FORM
          </h1>
          <p style="color: #f59e0b; margin: 10px 0 0 0; font-weight: 600;">INCOMING TRANSMISSION</p>
        </div>
        
        <div style="background-color: #0a0a0a; padding: 30px 20px; border-left: 3px solid #f59e0b; margin: 20px 0;">
          <h2 style="color: #f59e0b; margin-top: 0;">New Inquiry Received 🎯</h2>
          
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">📋 Contact Details</h3>
            <div style="background-color: #0a0a0a; padding: 20px; border-radius: 8px;">
              <p><strong style="color: #10b981;">Name:</strong> ${fullName}</p>
              <p><strong style="color: #10b981;">Email:</strong> ${email}</p>
              <p><strong style="color: #10b981;">Type:</strong> ${inquiryType || 'General Inquiry'}</p>
              ${subject ? `<p><strong style="color: #10b981;">Subject:</strong> ${subject}</p>` : ''}
            </div>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #06b6d4;">
            <h3 style="color: #06b6d4; margin-top: 0;">💬 Message</h3>
            <div style="background-color: #0a0a0a; padding: 15px; border-radius: 6px;">
              <p style="white-space: pre-wrap; line-height: 1.6; color: #ccc;">${message}</p>
            </div>
          </div>
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              📅 Received: ${new Date().toLocaleString()}<br>
              🌐 Source: Berlin Luxe Rentals Contact Form<br>
              🔒 This is a secure transmission
            </p>
          </div>
        </div>
      </div>
    `

    const emailData = await emailService.sendCustomEmail(
      process.env.RESEND_TO_EMAIL || 'info@phantomproperties.dev',
      `🎯 New Contact: ${inquiryType} from ${fullName}`,
      adminNotificationHtml
    )

    // Send auto-reply to customer using custom template  
    const customerReplyHtml = `
      <div style="font-family: 'Sora', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">
            🎯 TRANSMISSION RECEIVED
          </h1>
          <p style="color: #10b981; margin: 10px 0 0 0; font-weight: 600;">AUTO-CONFIRMATION</p>
        </div>
        
        <div style="background-color: #0a0a0a; padding: 30px 20px; border-left: 3px solid #f59e0b; margin: 20px 0;">
          <h2 style="color: #f59e0b; margin-top: 0;">Message Received, ${fullName}! ✅</h2>
          
          <p>Your inquiry has been successfully transmitted to our command center. Our elite team will respond within <strong style="color: #f59e0b;">24 hours</strong>.</p>
          
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">📋 Your Message Summary</h3>
            <div style="background-color: #0a0a0a; padding: 20px; border-radius: 8px;">
              <p><strong style="color: #10b981;">Inquiry Type:</strong> ${inquiryType || 'General Inquiry'}</p>
              ${subject ? `<p><strong style="color: #10b981;">Subject:</strong> ${subject}</p>` : ''}
              <p><strong style="color: #10b981;">Status:</strong> <span style="color: #10b981;">✅ RECEIVED & PROCESSING</span></p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              EXPLORE PROPERTIES
            </a>
          </div>
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #10b981; margin: 0; font-weight: 600;">🤖 Next Steps:</p>
            <p style="margin: 5px 0 0 0; color: #ccc;">Our AI system has logged your request. A human agent will review and respond personally.</p>
          </div>
        </div>
        
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals | Ultra-premium rentals with spy-tech precision<br>
            📞 Emergency: +49 (30) 1234-5678 | 📧 info@phantomproperties.dev
          </p>
        </div>
      </div>
    `

    const confirmationEmail = await emailService.sendCustomEmail(
      email,
      '🎯 Berlin Luxe Rentals - Message Received & Processing',
      customerReplyHtml
    )

    console.log('Emails sent successfully:', { emailData, confirmationEmail })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailData.id,
        confirmationId: confirmationEmail.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
