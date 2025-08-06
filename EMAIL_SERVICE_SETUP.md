# 📧 Email Service Setup Guide

## Overview

Your invoice system needs an email service to send invoices to customers and your company. The system is configured to use **Resend** (resend.com) - a modern, developer-friendly email API.

## 🚀 Quick Setup with Resend

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Free tier includes **100 emails/day** (perfect for starting)

### Step 2: Get Your API Key

1. Go to **API Keys** in your Resend dashboard
2. Click **Create API Key**
3. Give it a name like "BoostMySites Invoices"
4. Copy the API key (starts with `re_`)

### Step 3: Configure Domain (Optional but Recommended)

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `boostmysites.com`)
3. Follow DNS setup instructions
4. Or use Resend's shared domain for testing

### Step 4: Add to Supabase Environment

1. Go to **Supabase Dashboard** → **Settings** → **Environment Variables**
2. Add this variable:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 5: Update Email Addresses

In your invoice email function, update the company email:

```typescript
// In supabase/functions/send-invoice-email/index.ts
to: [purchase.profiles.email, 'your-company@yourdomain.com']
```

## 📋 Default Coupon Codes

Here are some default coupon codes you can create:

### 1. FREEMONTH - One Month Free
- **Code**: `FREEMONTH`
- **Type**: Free Months
- **Value**: 1 month
- **Description**: "Get one month free on any service"

### 2. WELCOME20 - 20% Off
- **Code**: `WELCOME20`
- **Type**: Percentage
- **Value**: 20%
- **Description**: "Welcome discount - 20% off your first order"

### 3. SAVE500 - Fixed Discount
- **Code**: `SAVE500`
- **Type**: Fixed Amount
- **Value**: ₹500
- **Description**: "Save ₹500 on any order above ₹2000"

## 🎯 How to Create Coupons

1. **Admin Login**: Log in as admin user
2. **Navigate**: Go to `/admin/coupons`
3. **Create**: Click "Create Coupon"
4. **Fill Details**:
   - Coupon Code (e.g., FREEMONTH)
   - Discount Type (percentage/fixed/free_months)
   - Value or free months
   - Valid dates
   - Usage limits (optional)
5. **Save**: Click "Create Coupon"

## 🔍 How Customers Use Coupons

1. **Checkout Page**: Customer enters coupon code
2. **Click Apply**: System validates the coupon
3. **Instant Discount**: Price updates immediately
4. **Order Completion**: Coupon usage is tracked
5. **Invoice Shows**: Discount appears on invoice

## ✅ Testing Email System

### Test Invoice Email (Without Resend)
If you haven't set up Resend yet, the system will:
- Show a user-friendly message
- Allow PDF download instead
- Not break the payment flow

### Test with Resend
1. Set up Resend API key
2. Make a test purchase
3. Check email delivery
4. Verify invoice formatting

## 🎨 Email Template Features

Your invoice emails include:
- ✅ Professional HTML design
- ✅ Company branding
- ✅ Complete order details
- ✅ GST breakdown
- ✅ Coupon discounts shown
- ✅ Customer GST numbers
- ✅ Payment confirmation
- ✅ Next steps guidance

## 💡 Alternative Email Services

If you prefer other services, you can modify the code:

### SendGrid
```typescript
// Change API endpoint and headers
const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}` }
})
```

### Amazon SES
```typescript
// Use AWS SDK
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
```

### Gmail SMTP
```typescript
// Use nodemailer with Gmail
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: 'your-email', pass: 'app-password' }
});
```

## 🔧 Troubleshooting

### Email Not Sending
1. Check RESEND_API_KEY in Supabase
2. Verify domain setup in Resend
3. Check function logs in Supabase

### Emails Going to Spam
1. Set up SPF, DKIM, DMARC records
2. Use verified domain in Resend
3. Avoid spam-trigger words

### Wrong Email Addresses
1. Update company email in the function
2. Test with your actual email addresses

## 🎉 What You Get

✅ **Automatic Invoices** - Sent when payment completes  
✅ **Dual Delivery** - Customer + company receive copies  
✅ **Professional Design** - Clean, branded email template  
✅ **Complete Details** - Items, pricing, taxes, discounts  
✅ **GST Support** - Shows customer GST numbers  
✅ **Coupon Tracking** - Displays applied discounts  
✅ **Manual Resend** - Users can request email again  

Your customers will receive professional invoices automatically! 🚀