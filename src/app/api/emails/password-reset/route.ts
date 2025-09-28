// Password Reset Email API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, resetToken } = await request.json()

    if (!email || !customerName || !resetToken) {
      return NextResponse.json(
        { error: 'Missing required fields: email, customerName, and resetToken' },
        { status: 400 }
      )
    }

    // Generate reset link (you would generate this token securely)
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`
    const expiresIn = '1 hour'

    const result = await emailService.sendPasswordResetEmail(email, customerName, resetLink, expiresIn)

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      emailId: result.id
    })

  } catch (error) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    )
  }
}
