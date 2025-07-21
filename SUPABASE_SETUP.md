# Supabase Edge Functions Setup for Razorpay Integration

This guide will help you set up the server-side Supabase Edge Functions for secure Razorpay payment processing.

## 🚀 Prerequisites

1. **Supabase CLI Installed**
   ```bash
   npm install -g supabase
   ```

2. **Razorpay Account**
   - Test/Live API Keys
   - Webhook Secret (for real-time updates)

3. **Supabase Project**
   - Project URL and Service Role Key

## 🔧 Setup Steps

### 1. Initialize Supabase (if not already done)

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Start local development (optional)
supabase start
```

### 2. Set Environment Variables in Supabase

Go to your Supabase Dashboard → Settings → Environment Variables and add:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**⚠️ Important**: 
- Use **test keys** for development
- Use **live keys** for production
- Keep the **Key Secret** secure - never expose it on client-side

### 3. Deploy Edge Functions

Deploy all three functions to Supabase:

```bash
# Deploy order creation function
supabase functions deploy create-razorpay-order

# Deploy payment verification function
supabase functions deploy verify-razorpay-payment

# Deploy webhook handler
supabase functions deploy razorpay-webhook
```

### 4. Configure Webhooks in Razorpay

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. Set URL to: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`
4. Select these events:
   - `payment.captured`
   - `payment.failed`
   - `payment.authorized`
   - `order.paid`
5. Set the **Webhook Secret** (save this for environment variables)

## 📁 Edge Functions Overview

### 1. `create-razorpay-order`
**Purpose**: Securely create Razorpay orders with proper amount verification

**Endpoint**: `POST /functions/v1/create-razorpay-order`

**Request Body**:
```json
{
  "cart_items": [
    {
      "id": "service_or_bundle_id",
      "name": "Service Name",
      "price": 1000,
      "type": "service",
      "billing_period": "monthly"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "purchase_id": "uuid",
  "razorpay_order_id": "order_xyz",
  "amount": 118000,
  "currency": "INR",
  "key": "rzp_test_xyz"
}
```

### 2. `verify-razorpay-payment`
**Purpose**: Server-side payment signature verification

**Endpoint**: `POST /functions/v1/verify-razorpay-payment`

**Request Body**:
```json
{
  "razorpay_payment_id": "pay_xyz",
  "razorpay_order_id": "order_xyz",
  "razorpay_signature": "signature_xyz",
  "purchase_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "purchase_id": "uuid",
  "payment_status": "completed"
}
```

### 3. `razorpay-webhook`
**Purpose**: Handle real-time payment status updates from Razorpay

**Endpoint**: `POST /functions/v1/razorpay-webhook`

**Handles Events**:
- `payment.captured` → Mark order as completed
- `payment.failed` → Mark order as failed
- `payment.authorized` → Mark as processing
- `order.paid` → Ensure completion

## 🔒 Security Features

### ✅ Implemented Security
- **Server-side Order Creation**: Prevents amount tampering
- **Payment Signature Verification**: Using HMAC SHA-256
- **Webhook Signature Verification**: Validates incoming webhooks
- **User Authentication**: All functions require valid JWT
- **Database RLS**: Row Level Security on all tables
- **Environment Variables**: Secure storage of API keys

### 🛡️ Security Best Practices
- API secrets stored in Supabase (server-side only)
- All amounts verified on server-side
- Webhook signatures validated
- User authorization checked for each request

## 🧪 Testing

### Test with Curl

1. **Create Order**:
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-razorpay-order' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "cart_items": [
      {
        "id": "test_service_1",
        "name": "Test Service",
        "price": 1000,
        "type": "service"
      }
    ]
  }'
```

2. **Verify Payment**:
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/verify-razorpay-payment' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "razorpay_payment_id": "pay_test_123",
    "razorpay_order_id": "order_test_123",
    "razorpay_signature": "test_signature",
    "purchase_id": "your_purchase_uuid"
  }'
```

## 🚀 Client-Side Integration

The client-side code has been updated to use these Edge Functions:

### Updated Functions:
- `createPurchaseOrder()` → Calls `create-razorpay-order` function
- `verifyPayment()` → Calls `verify-razorpay-payment` function
- Real-time status updates via webhooks

### Environment Variables (Client):
```env
# .env.local
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

## 🔧 Local Development

### 1. Start Supabase Locally
```bash
supabase start
```

### 2. Set Local Environment Variables
Create `supabase/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Serve Functions Locally
```bash
supabase functions serve
```

Functions will be available at:
- `http://localhost:54321/functions/v1/create-razorpay-order`
- `http://localhost:54321/functions/v1/verify-razorpay-payment`
- `http://localhost:54321/functions/v1/razorpay-webhook`

## 🐛 Troubleshooting

### Common Issues:

1. **"Function not found"**
   - Ensure functions are deployed: `supabase functions deploy FUNCTION_NAME`
   - Check function name matches exactly

2. **"Authorization failed"**
   - Verify JWT token is valid
   - Check user authentication in your app

3. **"Razorpay credentials not configured"**
   - Set environment variables in Supabase Dashboard
   - Redeploy functions after setting variables

4. **"Payment verification failed"**
   - Check Razorpay Key Secret is correct
   - Verify signature format from Razorpay

5. **"Webhook signature invalid"**
   - Verify webhook secret matches Razorpay dashboard
   - Check webhook URL is correct

### Debug Mode:
Check Supabase Functions logs:
```bash
supabase functions logs FUNCTION_NAME
```

## 📋 Production Checklist

### Before Going Live:

- [ ] Replace test Razorpay keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Test complete payment flow end-to-end
- [ ] Verify webhook events are received
- [ ] Test payment failure scenarios
- [ ] Ensure SSL certificates are valid
- [ ] Set up monitoring and alerting

### Environment Variables (Production):
```env
RAZORPAY_KEY_ID=rzp_live_your_live_key_here
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

## 🔄 Payment Flow Summary

1. **Client**: User clicks "Pay Now" → Calls `create-razorpay-order`
2. **Server**: Creates order in DB → Creates Razorpay order → Returns order details
3. **Client**: Opens Razorpay checkout with order details
4. **User**: Completes payment in Razorpay interface
5. **Client**: Receives payment response → Calls `verify-razorpay-payment`
6. **Server**: Verifies signature → Updates order status → Clears cart
7. **Webhook**: Razorpay sends real-time updates → Processed by webhook handler
8. **Client**: Redirected to success/failure page

## 📞 Support

For issues with the Edge Functions setup:

1. Check Supabase Functions logs
2. Verify environment variables
3. Test with curl commands
4. Review Razorpay webhook logs

---

**✨ Your secure server-side payment processing is now ready!** 