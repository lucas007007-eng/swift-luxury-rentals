// CRM Reminder Email API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { ReminderData } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, reminder }: {
      email: string
      customerName: string
      reminder: ReminderData
    } = await request.json()

    if (!email || !customerName || !reminder) {
      return NextResponse.json(
        { error: 'Missing required fields: email, customerName, and reminder' },
        { status: 400 }
      )
    }

    // Validate reminder object
    const validTypes: ReminderData['type'][] = ['payment', 'checkin', 'checkout', 'review', 'maintenance']
    if (!validTypes.includes(reminder.type)) {
      return NextResponse.json(
        { error: 'Invalid reminder type. Must be one of: payment, checkin, checkout, review, maintenance' },
        { status: 400 }
      )
    }

    if (!reminder.dueDate || !reminder.actionRequired) {
      return NextResponse.json(
        { error: 'Missing required reminder fields: dueDate and actionRequired' },
        { status: 400 }
      )
    }

    const result = await emailService.sendPaymentReminderEmail(email, customerName, reminder)

    return NextResponse.json({
      success: true,
      message: `${reminder.type} reminder email sent successfully`,
      emailId: result.id,
      reminderType: reminder.type
    })

  } catch (error) {
    console.error('Error sending reminder email:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    )
  }
}
