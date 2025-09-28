// Email Template System for Berlin Luxe Rentals
// Ultra-premium templates with spy-tech precision

export interface EmailTemplateData {
  customerName: string;
  [key: string]: any;
}

export interface BookingData {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  currency: string;
  guestCount: number;
  propertyImage?: string;
  specialInstructions?: string;
}

export interface ReminderData {
  type: 'payment' | 'checkin' | 'checkout' | 'review' | 'maintenance';
  dueDate: string;
  amount?: number;
  propertyName?: string;
  actionRequired: string;
}

// Base template styles matching your brand
const baseStyles = `
  font-family: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: #ffffff;
  line-height: 1.6;
`;

const headerStyles = `
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  padding: 30px 20px;
  text-align: center;
  border-bottom: 2px solid #f59e0b;
`;

const contentStyles = `
  background-color: #0a0a0a;
  padding: 30px 20px;
  border-left: 3px solid #f59e0b;
  margin: 20px 0;
`;

const buttonStyles = `
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #000000;
  padding: 12px 30px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 20px 0;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
`;

// 1. CUSTOMER SIGNUP WELCOME TEMPLATE
export const createWelcomeTemplate = (data: EmailTemplateData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Berlin Luxe Rentals</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">
            🏙️ BERLIN LUXE RENTALS
          </h1>
          <p style="color: #999; margin: 10px 0 0 0; font-size: 14px;">Ultra-premium rentals with spy-tech precision</p>
        </div>
        
        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="color: #f59e0b; margin-top: 0;">Welcome to the Elite, ${data.customerName}! 🎉</h2>
          
          <p>You've just joined Berlin's most exclusive rental platform. Get ready for accommodations that blend luxury with cutting-edge technology.</p>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">🔓 Your VIP Access Includes:</h3>
            <ul style="color: #cccccc; padding-left: 20px;">
              <li>✨ Priority booking on premium properties</li>
              <li>🤖 24/7 AI-powered concierge support</li>
              <li>📱 Advanced property controls via mobile app</li>
              <li>💎 Exclusive member-only properties</li>
              <li>🚗 Complimentary luxury transport coordination</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties" style="${buttonStyles}">
              EXPLORE ELITE PROPERTIES
            </a>
          </div>
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #f59e0b; margin: 0; font-weight: 600;">🎯 Pro Tip:</p>
            <p style="margin: 5px 0 0 0; color: #ccc;">Complete your profile within 24 hours to unlock our "Ghost Protocol" fast-booking feature.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals | Unter den Linden 77, Berlin<br>
            This is a secure transmission. Do not forward.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 2. PASSWORD RESET TEMPLATE
export const createPasswordResetTemplate = (data: EmailTemplateData & { resetLink: string; expiresIn: string }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Security Alert - Password Reset</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">🔐 SECURITY PROTOCOL</h1>
          <p style="color: #999; margin: 10px 0 0 0;">Berlin Luxe Rentals - Access Management</p>
        </div>
        
        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="color: #f59e0b; margin-top: 0;">Password Reset Requested 🚨</h2>
          
          <p>Hello ${data.customerName},</p>
          
          <p>We received a request to reset the password for your Berlin Luxe Rentals account. If this was you, click the secure link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="${buttonStyles}">
              🔓 RESET PASSWORD SECURELY
            </a>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #ef4444; margin-top: 0;">⚠️ Security Notice:</h3>
            <ul style="color: #cccccc; padding-left: 20px; margin: 10px 0;">
              <li>This link expires in <strong style="color: #f59e0b;">${data.expiresIn}</strong></li>
              <li>Only use this link if you requested the reset</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #ef4444; margin: 0; font-weight: 600;">🛡️ Didn't request this?</p>
            <p style="margin: 5px 0 0 0; color: #ccc;">Your account is secure. Someone may have entered your email by mistake. You can safely ignore this email.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals Security Team<br>
            This is an automated security message. Do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 3. BOOKING CONFIRMATION TEMPLATE
export const createBookingConfirmationTemplate = (data: EmailTemplateData & { booking: BookingData }) => {
  const { booking } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Mission Confirmed - Booking #${booking.bookingId}</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="color: #10b981; font-size: 28px; margin: 0; text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);">
            ✅ MISSION CONFIRMED
          </h1>
          <p style="color: #10b981; margin: 10px 0 0 0; font-weight: 600;">Booking #${booking.bookingId}</p>
        </div>
        
        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="color: #f59e0b; margin-top: 0;">Your Elite Accommodation Awaits, ${data.customerName}! 🏙️</h2>
          
          <p>Your booking has been confirmed and secured with our military-grade encryption. Prepare for luxury redefined.</p>
          
          <!-- Booking Details Card -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0; display: flex; align-items: center;">
              🏢 ${booking.propertyName}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div>
                <p style="color: #10b981; font-weight: 600; margin: 0;">📅 CHECK-IN</p>
                <p style="color: #fff; margin: 5px 0 0 0; font-size: 18px;">${booking.checkIn}</p>
              </div>
              <div>
                <p style="color: #ef4444; font-weight: 600; margin: 0;">📅 CHECK-OUT</p>
                <p style="color: #fff; margin: 5px 0 0 0; font-size: 18px;">${booking.checkOut}</p>
              </div>
            </div>
            
            <div style="background-color: #0a0a0a; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">👥 Guests:</span>
                <span style="color: #f59e0b; font-weight: 600;">${booking.guestCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span style="color: #ccc;">💰 Total:</span>
                <span style="color: #10b981; font-weight: 600; font-size: 20px;">${booking.currency}${booking.totalAmount}</span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${booking.bookingId}" style="${buttonStyles} margin-right: 10px;">
              VIEW BOOKING DETAILS
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties/${booking.bookingId}/guide" style="${buttonStyles.replace('#f59e0b', '#10b981').replace('#d97706', '#059669')}">
              ACCESS PROPERTY GUIDE
            </a>
          </div>
          
          ${booking.specialInstructions ? `
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">📋 Mission Briefing:</h3>
            <p style="color: #ccc; margin: 0;">${booking.specialInstructions}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #10b981; margin: 0; font-weight: 600;">🤖 Next Steps:</p>
            <p style="margin: 5px 0 0 0; color: #ccc;">You'll receive check-in instructions 24 hours before arrival. Our AI concierge is standing by for any assistance.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals | 24/7 Support: +49 (30) 1234-5678<br>
            Booking confirmed at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 4. CRM REMINDER TEMPLATES
export const createReminderTemplate = (data: EmailTemplateData & { reminder: ReminderData }) => {
  const { reminder } = data;
  
  const reminderConfig = {
    payment: {
      emoji: '💳',
      color: '#ef4444',
      title: 'PAYMENT REQUIRED',
      urgency: 'HIGH PRIORITY'
    },
    checkin: {
      emoji: '🏢',
      color: '#f59e0b',
      title: 'CHECK-IN APPROACHING',
      urgency: 'MISSION BRIEFING'
    },
    checkout: {
      emoji: '🎒',
      color: '#06b6d4',
      title: 'CHECK-OUT REMINDER',
      urgency: 'MISSION COMPLETE'
    },
    review: {
      emoji: '⭐',
      color: '#10b981',
      title: 'MISSION FEEDBACK',
      urgency: 'INTEL REQUESTED'
    },
    maintenance: {
      emoji: '🔧',
      color: '#6366f1',
      title: 'MAINTENANCE UPDATE',
      urgency: 'SYSTEM NOTIFICATION'
    }
  };
  
  const config = reminderConfig[reminder.type];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${config.urgency} - ${config.title}</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="${headerStyles.replace('#f59e0b', config.color)}">
          <h1 style="color: ${config.color}; font-size: 28px; margin: 0;">
            ${config.emoji} ${config.title}
          </h1>
          <p style="color: ${config.color}; margin: 10px 0 0 0; font-weight: 600;">${config.urgency}</p>
        </div>
        
        <!-- Content -->
        <div style="${contentStyles.replace('#f59e0b', config.color)}">
          <h2 style="color: #f59e0b; margin-top: 0;">Agent ${data.customerName}, Action Required 📋</h2>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${config.color};">
            <h3 style="color: ${config.color}; margin-top: 0;">${config.emoji} Mission Details:</h3>
            <ul style="color: #cccccc; padding-left: 20px;">
              <li><strong>Action Required:</strong> ${reminder.actionRequired}</li>
              <li><strong>Due Date:</strong> <span style="color: ${config.color};">${reminder.dueDate}</span></li>
              ${reminder.propertyName ? `<li><strong>Property:</strong> ${reminder.propertyName}</li>` : ''}
              ${reminder.amount ? `<li><strong>Amount:</strong> <span style="color: #10b981;">€${reminder.amount}</span></li>` : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="${buttonStyles.replace('#f59e0b', config.color).replace('#d97706', config.color)}">
              TAKE ACTION NOW
            </a>
          </div>
          
          <div style="background-color: #111; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: ${config.color}; margin: 0; font-weight: 600;">⏰ Time Sensitive:</p>
            <p style="margin: 5px 0 0 0; color: #ccc;">This reminder is part of our automated mission protocol. Immediate action ensures seamless operations.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals CRM | Automated Mission Control<br>
            This message was generated by our AI system at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 5. ADDITIONAL TEMPLATES

export const createMaintenanceNotificationTemplate = (data: EmailTemplateData & { 
  propertyName: string; 
  maintenanceType: string; 
  scheduledDate: string; 
  estimatedDuration: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>System Maintenance - ${data.propertyName}</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <div style="${headerStyles.replace('#f59e0b', '#6366f1')}">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">🔧 SYSTEM MAINTENANCE</h1>
          <p style="color: #6366f1; margin: 10px 0 0 0; font-weight: 600;">PROPERTY OPTIMIZATION</p>
        </div>
        
        <div style="${contentStyles.replace('#f59e0b', '#6366f1')}">
          <h2 style="color: #f59e0b; margin-top: 0;">Maintenance Update: ${data.propertyName}</h2>
          
          <p>Dear ${data.customerName},</p>
          
          <p>We're enhancing your property's systems to maintain our ultra-premium standards. Here are the details:</p>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6366f1;">
            <h3 style="color: #6366f1; margin-top: 0;">🔧 Maintenance Details:</h3>
            <ul style="color: #cccccc; padding-left: 20px;">
              <li><strong>Type:</strong> ${data.maintenanceType}</li>
              <li><strong>Scheduled:</strong> ${data.scheduledDate}</li>
              <li><strong>Duration:</strong> ${data.estimatedDuration}</li>
              <li><strong>Impact:</strong> Minimal disruption expected</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals Maintenance Team<br>
            Questions? Contact: maintenance@berlinluxerentals.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createPaymentConfirmationTemplate = (data: EmailTemplateData & {
  amount: number;
  currency: string;
  paymentMethod: string;
  bookingId: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Payment Secured - Transaction Complete</title>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <div style="${headerStyles.replace('#f59e0b', '#10b981')}">
          <h1 style="color: #10b981; font-size: 28px; margin: 0;">✅ PAYMENT SECURED</h1>
          <p style="color: #10b981; margin: 10px 0 0 0; font-weight: 600;">TRANSACTION COMPLETE</p>
        </div>
        
        <div style="${contentStyles.replace('#f59e0b', '#10b981')}">
          <h2 style="color: #f59e0b; margin-top: 0;">Payment Confirmed, ${data.customerName}! 💳</h2>
          
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">💰 Transaction Details</h3>
            
            <div style="background-color: #0a0a0a; padding: 15px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #ccc;">Amount:</span>
                <span style="color: #10b981; font-weight: 600; font-size: 24px;">${data.currency}${data.amount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #ccc;">Method:</span>
                <span style="color: #fff;">${data.paymentMethod}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">Booking ID:</span>
                <span style="color: #f59e0b;">#${data.bookingId}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${data.bookingId}" style="${buttonStyles.replace('#f59e0b', '#10b981').replace('#d97706', '#059669')}">
              VIEW BOOKING DETAILS
            </a>
          </div>
        </div>
        
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Berlin Luxe Rentals Payment Processing<br>
            Transaction ID: TXN-${Date.now()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
