// Email Service for Berlin Luxe Rentals
// Centralized email sending with template management

import { Resend } from 'resend'
import {
  createWelcomeTemplate,
  createPasswordResetTemplate,
  createBookingConfirmationTemplate,
  createReminderTemplate,
  createMaintenanceNotificationTemplate,
  createPaymentConfirmationTemplate,
  EmailTemplateData,
  BookingData,
  ReminderData
} from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'newsletters@phantomproperties.co'
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO || 'info@phantomproperties.dev'

export class EmailService {
  private static instance: EmailService
  
  private constructor() {}
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Base email sending function
  private async sendEmail(options: {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
  }) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || REPLY_TO_EMAIL,
      })

      console.log('Email sent successfully:', result.data?.id)
      return { success: true, id: result.data?.id }
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  // 1. Welcome Email
  async sendWelcomeEmail(to: string, customerName: string) {
    const html = createWelcomeTemplate({ customerName })
    
    return this.sendEmail({
      to,
      subject: '🎯 Welcome to Berlin Luxe Rentals - Your VIP Access is Active',
      html
    })
  }

  // 2. Password Reset Email
  async sendPasswordResetEmail(to: string, customerName: string, resetLink: string, expiresIn: string = '1 hour') {
    const html = createPasswordResetTemplate({ 
      customerName, 
      resetLink, 
      expiresIn 
    })
    
    return this.sendEmail({
      to,
      subject: '🔐 Berlin Luxe Rentals - Password Reset Request',
      html
    })
  }

  // 3. Booking Confirmation Email
  async sendBookingConfirmationEmail(to: string, customerName: string, booking: BookingData) {
    const html = createBookingConfirmationTemplate({ 
      customerName, 
      booking 
    })
    
    return this.sendEmail({
      to,
      subject: `✅ Mission Confirmed - Booking #${booking.bookingId} | ${booking.propertyName}`,
      html
    })
  }

  // 4. Payment Reminder Email
  async sendPaymentReminderEmail(to: string, customerName: string, reminder: ReminderData) {
    const html = createReminderTemplate({ 
      customerName, 
      reminder 
    })
    
    const urgencyMap = {
      payment: '🚨 URGENT',
      checkin: '📅 UPCOMING',
      checkout: '⏰ REMINDER',
      review: '⭐ REQUEST',
      maintenance: '🔧 UPDATE'
    }
    
    return this.sendEmail({
      to,
      subject: `${urgencyMap[reminder.type]} - ${reminder.actionRequired}`,
      html
    })
  }

  // 5. Maintenance Notification Email
  async sendMaintenanceNotificationEmail(
    to: string, 
    customerName: string, 
    propertyName: string, 
    maintenanceType: string, 
    scheduledDate: string, 
    estimatedDuration: string
  ) {
    const html = createMaintenanceNotificationTemplate({
      customerName,
      propertyName,
      maintenanceType,
      scheduledDate,
      estimatedDuration
    })
    
    return this.sendEmail({
      to,
      subject: `🔧 Maintenance Notice - ${propertyName} | ${scheduledDate}`,
      html
    })
  }

  // 6. Payment Confirmation Email
  async sendPaymentConfirmationEmail(
    to: string,
    customerName: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    bookingId: string
  ) {
    const html = createPaymentConfirmationTemplate({
      customerName,
      amount,
      currency,
      paymentMethod,
      bookingId
    })
    
    return this.sendEmail({
      to,
      subject: `✅ Payment Confirmed - ${currency}${amount} | Booking #${bookingId}`,
      html
    })
  }

  // 7. Custom Email (for admin use)
  async sendCustomEmail(to: string, subject: string, html: string) {
    return this.sendEmail({
      to,
      subject,
      html
    })
  }

  // 8. Bulk Email (for newsletters, announcements)
  async sendBulkEmail(recipients: string[], subject: string, html: string) {
    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        subject,
        html
      })
    )
    
    try {
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`Bulk email results: ${successful} sent, ${failed} failed`)
      return { successful, failed, total: recipients.length }
    } catch (error) {
      console.error('Error sending bulk emails:', error)
      throw error
    }
  }

  // 9. Check-in Instructions Email (24 hours before)
  async sendCheckinInstructionsEmail(
    to: string,
    customerName: string,
    booking: BookingData,
    instructions: {
      propertyAddress: string
      accessCode: string
      contactInfo: string
      specialNotes?: string
    }
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Mission Briefing - Check-in Instructions</title>
      </head>
      <body style="font-family: 'Sora', sans-serif; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
          
          <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">🎯 MISSION BRIEFING</h1>
            <p style="color: #f59e0b; margin: 10px 0 0 0; font-weight: 600;">CHECK-IN INSTRUCTIONS</p>
          </div>
          
          <div style="background-color: #0a0a0a; padding: 30px 20px; border-left: 3px solid #f59e0b; margin: 20px 0;">
            <h2 style="color: #f59e0b; margin-top: 0;">Agent ${customerName}, Your Mission Starts Tomorrow! 🏢</h2>
            
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f59e0b;">
              <h3 style="color: #f59e0b; margin-top: 0;">🔑 Access Credentials</h3>
              
              <div style="background-color: #0a0a0a; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <p style="color: #10b981; font-weight: 600; margin: 0;">📍 LOCATION</p>
                <p style="color: #fff; margin: 5px 0; font-size: 16px;">${instructions.propertyAddress}</p>
                
                <p style="color: #f59e0b; font-weight: 600; margin: 20px 0 5px 0;">🔐 ACCESS CODE</p>
                <p style="color: #fff; background-color: #1a1a1a; padding: 10px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 20px; text-align: center; letter-spacing: 2px;">${instructions.accessCode}</p>
                
                <p style="color: #06b6d4; font-weight: 600; margin: 20px 0 5px 0;">📞 EMERGENCY CONTACT</p>
                <p style="color: #fff; margin: 5px 0; font-size: 16px;">${instructions.contactInfo}</p>
              </div>
            </div>
            
            ${instructions.specialNotes ? `
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #f59e0b; margin-top: 0;">📋 Special Instructions</h3>
              <p style="color: #ccc; margin: 0;">${instructions.specialNotes}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${booking.bookingId}/guide" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                VIEW FULL PROPERTY GUIDE
              </a>
            </div>
          </div>
          
          <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              Berlin Luxe Rentals | 24/7 Support: +49 (30) 1234-5678<br>
              Safe travels, Agent ${customerName}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    
    return this.sendEmail({
      to,
      subject: `🎯 Mission Briefing - Access Codes for ${booking.propertyName}`,
      html
    })
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()

// Utility functions for common operations
export const sendWelcomeEmail = (to: string, customerName: string) =>
  emailService.sendWelcomeEmail(to, customerName)

export const sendBookingConfirmation = (to: string, customerName: string, booking: BookingData) =>
  emailService.sendBookingConfirmationEmail(to, customerName, booking)

export const sendPaymentReminder = (to: string, customerName: string, reminder: ReminderData) =>
  emailService.sendPaymentReminderEmail(to, customerName, reminder)

export const sendPasswordReset = (to: string, customerName: string, resetLink: string) =>
  emailService.sendPasswordResetEmail(to, customerName, resetLink)
