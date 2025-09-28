// Booking Confirmation Email API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { BookingData } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, booking }: { 
      email: string
      customerName: string 
      booking: BookingData 
    } = await request.json()

    if (!email || !customerName || !booking) {
      return NextResponse.json(
        { error: 'Missing required fields: email, customerName, and booking' },
        { status: 400 }
      )
    }

    // Validate booking object
    if (!booking.bookingId || !booking.propertyName || !booking.checkIn || !booking.checkOut) {
      return NextResponse.json(
        { error: 'Invalid booking data - missing required booking fields' },
        { status: 400 }
      )
    }

    const result = await emailService.sendBookingConfirmationEmail(email, customerName, booking)

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email sent successfully',
      emailId: result.id,
      bookingId: booking.bookingId
    })

  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    return NextResponse.json(
      { error: 'Failed to send booking confirmation email' },
      { status: 500 }
    )
  }
}
