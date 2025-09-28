// Welcome Email API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, customerName } = await request.json()

    if (!email || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: email and customerName' },
        { status: 400 }
      )
    }

    const result = await emailService.sendWelcomeEmail(email, customerName)

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.id
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
