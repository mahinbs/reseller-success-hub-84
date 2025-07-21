# Checkout System Setup Guide

This guide will help you set up the complete checkout system with Razorpay integration for your BoostMySites application.

## 🚀 Quick Start

### 1. Razorpay Account Setup

1. **Create a Razorpay Account**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up or log in to your account
   - Complete the KYC process for live payments

2. **Get API Keys**
   - Navigate to **Account & Settings** → **API Keys**
   - Generate **Test Keys** for development
   - Generate **Live Keys** for production
   - Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`)

### 2. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_here

# Optional: API Base URL
VITE_API_BASE_URL=http://localhost:3000

# Optional: Support Contact
VITE_SUPPORT_EMAIL=support@boostmysites.com
VITE_SUPPORT_PHONE=+91_XXX_XXX_XXXX
```

### 3. Update Configuration

The system uses the configuration from `src/lib/config.ts`. The Razorpay key will be automatically picked up from your environment variables.

## 🔧 Features

### ✅ Implemented Features

- **Complete Checkout Flow**
  - Order creation and management
  - Real-time payment processing
  - Payment success/failure handling
  - Order expiry management (15 minutes)

- **Payment Methods Supported**
  - Credit/Debit Cards
  - UPI (GPay, PhonePe, Paytm)
  - Net Banking
  - Digital Wallets
  - EMI Options
  - Pay Later services

- **Real-time Status Updates**
  - Payment status tracking
  - Automatic order expiry
  - Real-time UI updates

- **Security Features**
  - Payment verification
  - SSL encryption
  - Secure order management
  - User authentication required

- **User Experience**
  - Responsive design
  - Loading states
  - Error handling
  - Success confirmations
  - Retry functionality

### 🎯 Payment Flow

1. **Cart** → User adds items to cart
2. **Checkout** → User fills details and initiates payment
3. **Razorpay** → Payment processing via Razorpay
4. **Verification** → Payment verification and order completion
5. **Success/Failure** → Redirect to appropriate page

## 📱 Pages Added

### 1. Checkout Page (`/checkout`)
- **Protected Route**: Requires authentication
- **Features**:
  - Customer details form
  - Order summary with GST calculation
  - Payment processing with Razorpay
  - Order expiry countdown
  - Form validation
  - Real-time status updates

### 2. Payment Success Page (`/payment/success`)
- **Protected Route**: Requires authentication
- **Features**:
  - Order confirmation
  - Payment details
  - Invoice actions (download/email)
  - Next steps information
  - Support contact information

### 3. Payment Failure Page (`/payment/failure`)
- **Protected Route**: Requires authentication
- **Features**:
  - Error details and troubleshooting
  - Retry payment option
  - Alternative payment methods
  - Support contact information
  - Common solutions guide

## 🛠 Technical Implementation

### Database Schema
The system uses existing Supabase tables:
- `purchases` - Main purchase records
- `purchase_items` - Individual items in each purchase
- `cart_items` - Persistent cart storage

### Key Components

1. **Payment Utilities** (`src/lib/paymentUtils.ts`)
   - Order creation and management
   - Payment status updates
   - Purchase retrieval functions

2. **Payment Hook** (`src/hooks/usePayment.tsx`)
   - Razorpay integration
   - Payment processing logic
   - Real-time status tracking

3. **Configuration** (`src/lib/config.ts`)
   - Centralized configuration
   - Environment variable management
   - Feature flags

### Security Considerations

- ✅ Client-side payment verification
- ✅ Server-side order validation
- ✅ User authentication required
- ✅ Secure API endpoints
- ⚠️ **TODO**: Server-side payment verification for production

## 🔍 Testing

### Test Mode Setup
1. Use Razorpay test keys (starting with `rzp_test_`)
2. Use test card numbers:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4111 1111 1111 1112
3. Any future date for expiry
4. Any 3-digit CVV

### Test Scenarios
- ✅ Successful payment flow
- ✅ Payment failure handling
- ✅ Payment cancellation
- ✅ Order expiry
- ✅ Network error handling
- ✅ Form validation

## 🚀 Production Deployment

### Before Going Live:

1. **Replace Test Keys**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_here
   ```

2. **Complete Razorpay KYC**
   - Submit required documents
   - Wait for approval
   - Enable live mode

3. **Server-side Verification** (Recommended)
   - Implement webhook handling
   - Add server-side payment verification
   - Set up order status synchronization

4. **SSL Certificate**
   - Ensure HTTPS is enabled
   - Verify SSL certificate validity

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_RAZORPAY_KEY_ID` | ✅ Yes | Razorpay Key ID |
| `VITE_API_BASE_URL` | ❌ Optional | API base URL |
| `VITE_SUPPORT_EMAIL` | ❌ Optional | Support email |
| `VITE_SUPPORT_PHONE` | ❌ Optional | Support phone |

## 🎨 Customization

### Styling
- All components use Tailwind CSS
- Consistent with existing design system
- Responsive for all devices

### Configuration
- Update `src/lib/config.ts` for app-wide settings
- Modify theme colors in Razorpay config
- Adjust timeout and retry settings

## 🆘 Troubleshooting

### Common Issues

1. **"Razorpay script not loaded"**
   - Check internet connection
   - Ensure Razorpay script URL is accessible
   - Try refreshing the page

2. **"Payment verification failed"**
   - Check Razorpay key configuration
   - Verify network connectivity
   - Check browser console for errors

3. **"Order not found"**
   - Check database connectivity
   - Verify user authentication
   - Check order expiry status

### Debug Mode
Set `VITE_DEBUG_MODE=true` in your environment to enable detailed logging.

## 📞 Support

For technical support or questions about the implementation:

- **Email**: technical-support@boostmysites.com
- **Documentation**: Check Razorpay official docs
- **Issues**: Create an issue in the project repository

## 🔄 Future Enhancements

### Planned Features
- [ ] Server-side payment verification
- [ ] Webhook integration
- [ ] Invoice generation and emailing
- [ ] Payment analytics dashboard
- [ ] Subscription management
- [ ] International payment support
- [ ] Payment reminders
- [ ] Refund management

---

**✨ Your complete checkout system is now ready! Start testing with Razorpay test mode and go live when ready.** 