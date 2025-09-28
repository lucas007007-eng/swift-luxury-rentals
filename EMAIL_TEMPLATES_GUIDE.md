# 🎯 Email Templates System - Berlin Luxe Rentals

Ultra-premium email templates with spy-tech precision for your luxury rental platform.

## 📧 Available Templates

### 1. **Welcome Email** - Customer Signup
Sent when new customers register for your platform.

**Features:**
- VIP access messaging
- Feature highlights (AI concierge, luxury transport, etc.)
- Call-to-action to explore properties
- "Ghost Protocol" exclusive tip

**Usage:**
```typescript
import { emailService } from '@/lib/email-service'

await emailService.sendWelcomeEmail('customer@email.com', 'John Doe')
```

**API Endpoint:**
```bash
POST /api/emails/welcome
{
  "email": "customer@email.com",
  "customerName": "John Doe"
}
```

### 2. **Password Reset** - Security Alert
Secure password reset with spy-tech styling.

**Features:**
- Security-focused messaging
- Expiring reset links
- Warning about unauthorized access
- Professional security styling

**Usage:**
```typescript
await emailService.sendPasswordResetEmail(
  'customer@email.com', 
  'John Doe', 
  'https://your-site.com/reset?token=abc123'
)
```

**API Endpoint:**
```bash
POST /api/emails/password-reset
{
  "email": "customer@email.com",
  "customerName": "John Doe",
  "resetToken": "secure_token_here"
}
```

### 3. **Booking Confirmation** - Mission Confirmed
Comprehensive booking confirmation with all details.

**Features:**
- Military-style "Mission Confirmed" messaging
- Detailed booking information card
- Property guide access
- Special instructions section
- Professional booking layout

**Usage:**
```typescript
import { BookingData } from '@/lib/email-templates'

const booking: BookingData = {
  bookingId: 'BLR-2024-001',
  propertyName: 'Luxury Penthouse Suite',
  checkIn: 'March 15, 2024',
  checkOut: 'March 20, 2024',
  totalAmount: 2500,
  currency: '€',
  guestCount: 2,
  specialInstructions: 'Late check-in requested'
}

await emailService.sendBookingConfirmationEmail('customer@email.com', 'John Doe', booking)
```

**API Endpoint:**
```bash
POST /api/emails/booking-confirmation
{
  "email": "customer@email.com",
  "customerName": "John Doe",
  "booking": {
    "bookingId": "BLR-2024-001",
    "propertyName": "Luxury Penthouse Suite",
    "checkIn": "March 15, 2024",
    "checkOut": "March 20, 2024",
    "totalAmount": 2500,
    "currency": "€",
    "guestCount": 2,
    "specialInstructions": "Late check-in requested"
  }
}
```

### 4. **CRM Reminders** - Mission Control
Automated reminders for various customer actions.

**Types Available:**
- **Payment** (`payment`) - Payment due reminders
- **Check-in** (`checkin`) - Pre-arrival instructions
- **Check-out** (`checkout`) - Departure reminders
- **Review** (`review`) - Post-stay feedback requests
- **Maintenance** (`maintenance`) - Property update notifications

**Usage:**
```typescript
import { ReminderData } from '@/lib/email-templates'

const reminder: ReminderData = {
  type: 'payment',
  dueDate: 'March 10, 2024',
  amount: 500,
  propertyName: 'Luxury Penthouse Suite',
  actionRequired: 'Complete payment for your upcoming stay'
}

await emailService.sendPaymentReminderEmail('customer@email.com', 'John Doe', reminder)
```

**API Endpoint:**
```bash
POST /api/emails/reminder
{
  "email": "customer@email.com",
  "customerName": "John Doe",
  "reminder": {
    "type": "payment",
    "dueDate": "March 10, 2024",
    "amount": 500,
    "propertyName": "Luxury Penthouse Suite",
    "actionRequired": "Complete payment for your upcoming stay"
  }
}
```

### 5. **Check-in Instructions** - Mission Briefing
Sent 24 hours before arrival with access codes.

**Features:**
- Spy-tech "Mission Briefing" styling
- Secure access credentials
- Property address and codes
- Emergency contact information
- Link to full property guide

**Usage:**
```typescript
const instructions = {
  propertyAddress: 'Unter den Linden 77, 10117 Berlin',
  accessCode: 'ALPHA2024',
  contactInfo: '+49 (30) 1234-5678',
  specialNotes: 'Building entrance is on the left side'
}

await emailService.sendCheckinInstructionsEmail(
  'customer@email.com',
  'John Doe',
  booking,
  instructions
)
```

### 6. **Payment Confirmation** - Transaction Secured
Professional payment confirmation emails.

**Usage:**
```typescript
await emailService.sendPaymentConfirmationEmail(
  'customer@email.com',
  'John Doe',
  2500,
  '€',
  'Credit Card ****1234',
  'BLR-2024-001'
)
```

### 7. **Maintenance Notification** - System Updates
Property maintenance and upgrade notifications.

**Usage:**
```typescript
await emailService.sendMaintenanceNotificationEmail(
  'customer@email.com',
  'John Doe',
  'Luxury Penthouse Suite',
  'HVAC System Upgrade',
  'March 12, 2024 - 10:00 AM',
  '2 hours'
)
```

## 🚀 Advanced Features

### **Bulk Email Sending**
For newsletters and announcements:

```typescript
const recipients = ['user1@email.com', 'user2@email.com', 'user3@email.com']
const subject = '🎉 New Property Launch - Exclusive Preview'
const html = '<your custom HTML here>'

const result = await emailService.sendBulkEmail(recipients, subject, html)
console.log(`Sent: ${result.successful}, Failed: ${result.failed}`)
```

### **Custom Email Templates**
Send completely custom emails:

```typescript
await emailService.sendCustomEmail(
  'recipient@email.com',
  'Custom Subject',
  '<your custom HTML template>'
)
```

## 🎨 Design System

All templates use your brand's design system:

### **Colors:**
- **Primary Gold:** `#f59e0b` (Amber-500)
- **Success Green:** `#10b981` (Emerald-500)
- **Warning Red:** `#ef4444` (Red-500)
- **Info Blue:** `#06b6d4` (Cyan-500)
- **Tech Purple:** `#6366f1` (Indigo-500)

### **Typography:**
- **Font:** Sora (headings), System fonts (body)
- **Styling:** Spy-tech themed with premium luxury feel

### **Layout:**
- **Responsive:** Mobile-first design
- **Dark Theme:** Black/dark gray backgrounds
- **Premium Effects:** Gradients, shadows, and glows

## 🔧 Configuration

### **Environment Variables Required:**
```bash
# In your .env.local file
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@phantomproperties.dev
RESEND_TO_EMAIL=info@phantomproperties.dev
RESEND_REPLY_TO=support@phantomproperties.dev
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### **Setup Steps:**
1. ✅ Install Resend: `npm install resend`
2. ✅ Add environment variables to `.env.local`
3. ✅ Configure your domain in Resend dashboard
4. ✅ Test with the contact form or API endpoints

## 📱 Testing Your Templates

### **Test Contact Form:**
Go to `/contact` on your site and submit a form to test the system.

### **Test API Endpoints:**
```bash
# Test Welcome Email
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","customerName":"Test User"}'

# Test Booking Confirmation
curl -X POST http://localhost:3000/api/emails/booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "customerName":"Test User",
    "booking":{
      "bookingId":"TEST-001",
      "propertyName":"Test Property",
      "checkIn":"Tomorrow",
      "checkOut":"Next Week",
      "totalAmount":100,
      "currency":"€",
      "guestCount":2
    }
  }'
```

## 🤖 Automation Ideas

### **Customer Journey Automation:**
1. **Signup** → Welcome Email
2. **Booking Made** → Confirmation Email
3. **24h Before** → Check-in Instructions
4. **Payment Due** → Payment Reminder
5. **After Stay** → Review Request
6. **Maintenance** → Property Update

### **CRM Integration:**
```typescript
// Example: Automated payment reminders
const sendPaymentReminders = async () => {
  const duePayments = await getDuePayments() // Your database query
  
  for (const payment of duePayments) {
    await emailService.sendPaymentReminderEmail(
      payment.customerEmail,
      payment.customerName,
      {
        type: 'payment',
        dueDate: payment.dueDate,
        amount: payment.amount,
        actionRequired: 'Complete your payment to secure your booking'
      }
    )
  }
}
```

## 🛡️ Security Features

- **Secure Templates:** No user-generated content in templates
- **Validation:** All inputs validated before sending
- **Rate Limiting:** Consider adding rate limits for production
- **Logging:** All emails logged for tracking
- **Error Handling:** Comprehensive error handling and recovery

## 📊 Monitoring & Analytics

Track email performance:
```typescript
// Example tracking
console.log('Email sent:', {
  type: 'welcome',
  recipient: email,
  timestamp: new Date().toISOString(),
  emailId: result.id
})
```

Your email system is now ready for ultra-premium customer communications! 🎯✨
