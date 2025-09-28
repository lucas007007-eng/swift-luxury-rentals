# 🎯 Email Template CMS - Admin Guide

Your comprehensive email template management system with spy-tech precision for Berlin Luxe Rentals.

## 📧 Accessing the Email Template CMS

Navigate to: **`/admin/emailtemplates`**

## 🏠 Dashboard Overview

### **Stats Cards**
- **Total Templates** - Number of templates in system
- **Active Templates** - Currently enabled templates  
- **Categories** - Unique template categories
- **Last Updated** - Most recent template modification

### **Template Grid**
Visual cards showing:
- Template name and description
- Category badge with color coding
- Active/inactive status
- Last modified date
- Subject line preview
- Available variables
- Action buttons

## 🎨 Template Categories

### **Customer** 👤 (Blue)
- Welcome emails
- Account notifications
- Profile updates

### **Booking** 🏢 (Green)  
- Booking confirmations
- Check-in instructions
- Booking modifications

### **Payment** 💳 (Yellow)
- Payment confirmations
- Receipt emails
- Refund notifications

### **Reminder** ⏰ (Red)
- Payment reminders
- Check-in/check-out alerts
- Review requests

### **System** ⚙️ (Purple)
- Maintenance notifications
- System updates
- Technical alerts

## ✏️ Template Editor

### **Content Tab**
Edit core template content:

#### **Basic Settings**
- **Template Name** - Internal identifier
- **Description** - What this template is for
- **Category** - Select from available categories  
- **Active Template** - Enable/disable template

#### **Email Settings**
- **Subject Line** - Use `{{variableName}}` for dynamic content
- **Preheader Text** - Preview text in email clients

#### **Content Sections**
- **Header** - Title, subtitle, icon configuration
- **Body** - Greeting, main message, content sections
- **Footer** - Company info, contact details, disclaimers

### **Variables Tab** 
Manage dynamic template variables:

#### **Variable Types**
- **Text** - Simple text strings
- **Email** - Email addresses with validation
- **Number** - Numeric values
- **Date** - Date fields
- **Currency** - Money amounts
- **Boolean** - True/false values

#### **Variable Configuration**
- **Variable Key** - Used in templates as `{{keyName}}`
- **Label** - Human-readable name
- **Type** - Data type for validation
- **Required** - Must be provided when sending
- **Placeholder** - Default example text
- **Description** - Help text for users

### **Styling Tab**
Customize template appearance:

#### **Colors**
- **Primary Color** - Main brand color (amber by default)
- **Secondary Color** - Success/accent color (green)
- **Accent Color** - Warning/error color (red)

#### **Layout**
- **Spacing** - Compact, Normal, or Spacious
- **Border Radius** - Corner rounding (0px to 16px)

### **Preview Tab**
Live template preview:

#### **Preview Data Controls**
- Set sample values for all variables
- Interactive form for each variable type
- Real-time preview updates

#### **Email Preview**
- Full-rendered email appearance
- Variable substitution applied
- Brand styling applied
- Mobile-responsive preview

## 🔧 Template Actions

### **Primary Actions**
- **Preview** 👁️ - View rendered template
- **Edit** ✏️ - Open full editor
- **Copy** 📄 - Duplicate template
- **Enable/Disable** ⚡ - Toggle active status

### **Dangerous Actions**
- **Delete** 🗑️ - Permanently remove template (with confirmation)

## 🔍 Search & Filtering

### **Search**
- Search by template name
- Search by description
- Real-time filtering

### **Category Filter**
- Filter by specific category
- "All Templates" shows everything
- Dynamic template counts

## 🚀 Using Templates in Code

### **Import Email Service**
```typescript
import { emailService } from '@/lib/email-service'
```

### **Send Template-Based Email**
```typescript
// Welcome email
await emailService.sendWelcomeEmail('customer@email.com', 'John Doe')

// Booking confirmation with data
await emailService.sendBookingConfirmationEmail(
  'customer@email.com', 
  'John Doe', 
  {
    bookingId: 'BLR-2024-001',
    propertyName: 'Luxury Penthouse',
    checkIn: 'March 15, 2024',
    checkOut: 'March 20, 2024',
    totalAmount: 2500,
    currency: '€',
    guestCount: 2
  }
)

// Custom reminder
await emailService.sendPaymentReminderEmail(
  'customer@email.com',
  'John Doe',
  {
    type: 'payment',
    dueDate: 'March 10, 2024',
    amount: 500,
    actionRequired: 'Complete payment for booking'
  }
)
```

### **API Endpoints**
```bash
# Get all templates
GET /api/admin/email-templates

# Get templates by category
GET /api/admin/email-templates?category=booking

# Get only active templates  
GET /api/admin/email-templates?active=true

# Create new template
POST /api/admin/email-templates

# Update template
PUT /api/admin/email-templates

# Delete template
DELETE /api/admin/email-templates?id=template-id
```

## 📱 Template Variables Guide

### **Common Variables**
```typescript
// Customer variables
{{customerName}}    // Customer's full name
{{customerEmail}}   // Customer's email address

// Booking variables  
{{bookingId}}       // Unique booking identifier
{{propertyName}}    // Name of rented property
{{checkIn}}         // Check-in date
{{checkOut}}        // Check-out date
{{totalAmount}}     // Total booking cost
{{currency}}        // Currency symbol (€, $, etc.)
{{guestCount}}      // Number of guests

// System variables
{{timestamp}}       // Current date/time
{{companyName}}     // Your company name
{{supportEmail}}    // Support contact email
{{websiteUrl}}      // Your website URL
```

### **Variable Usage in Templates**
```html
<!-- In subject line -->
✅ Booking Confirmed - {{propertyName}} | {{bookingId}}

<!-- In email body -->
<h2>Welcome {{customerName}}!</h2>
<p>Your booking for {{propertyName}} is confirmed.</p>
<p>Check-in: {{checkIn}}</p>
<p>Total: {{currency}}{{totalAmount}}</p>

<!-- In conditional sections -->
{{#if specialInstructions}}
<div class="special-notes">
  <p>{{specialInstructions}}</p>
</div>
{{/if}}
```

## 🎨 Styling System

### **Color Scheme**
- **Primary (#f59e0b)** - Amber gold for headers and CTAs
- **Secondary (#10b981)** - Emerald green for success states
- **Accent (#ef4444)** - Red for warnings and urgent items
- **Background (#000000)** - Black for premium feel
- **Text (#ffffff)** - White text for contrast

### **Spacing System**
- **Compact** - Minimal spacing for dense content
- **Normal** - Standard spacing for readability  
- **Spacious** - Extra spacing for luxury feel

### **Border Radius**
- **Square (0px)** - Sharp, technical feel
- **Small (4px)** - Subtle rounding
- **Medium (8px)** - Standard rounding (default)
- **Large (12px)** - Friendly rounding
- **Extra Large (16px)** - Very rounded corners

## 🔒 Security & Best Practices

### **Template Security**
- All variables are automatically escaped
- No user-generated content in templates
- Validation on all variable types
- Safe HTML rendering

### **Performance**
- Templates cached after first load
- Minimal inline CSS for fast loading
- Responsive images and layouts
- Fallback fonts for compatibility

### **Maintenance**
- Regular template testing recommended
- Keep variables up to date
- Monitor email delivery rates
- A/B test subject lines and content

## 🚨 Troubleshooting

### **Template Not Sending**
1. Check if template is **Active**
2. Verify all **required variables** are provided
3. Check **Resend API key** in environment
4. Verify **domain configuration** in Resend

### **Variables Not Showing**
1. Ensure variable key matches exactly `{{variableName}}`
2. Check variable is provided in send function
3. Verify variable type matches expected format
4. Check for typos in variable names

### **Styling Issues**
1. Some email clients strip CSS - use inline styles
2. Test across multiple email clients
3. Keep layouts simple for compatibility
4. Use web-safe fonts as fallbacks

### **Preview Not Working**
1. Refresh preview data
2. Check all variables have sample values
3. Verify template content is saved
4. Clear browser cache if needed

## 📊 Template Analytics (Future)

Coming soon:
- Email open rates per template
- Click-through rates on CTAs  
- Template performance comparisons
- A/B testing results
- Delivery success rates

## 🎯 Best Practices

### **Content Writing**
- Keep subject lines under 50 characters
- Use clear, action-oriented CTAs
- Include unsubscribe options where required
- Test content with different variable values

### **Design Principles**
- Mobile-first responsive design
- High contrast for accessibility
- Consistent brand colors and fonts
- Clear visual hierarchy

### **Variable Management**
- Use descriptive variable names
- Document variable purpose
- Set sensible default values
- Group related variables together

Your email template CMS is now ready for professional email communications! 🎯✨
