# Simple Razorpay Integration Setup (No Webhooks Required)

This guide shows you how to set up secure Razorpay payments with just **Key ID** and **Key Secret** - no webhooks needed!

## 🎯 **What You Need**
- Razorpay Key ID (`rzp_test_xxx` or `rzp_live_xxx`)
- Razorpay Key Secret
- Supabase project with CLI access

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Set Supabase Environment Variables**

1. Go to **Supabase Dashboard** → **Settings** → **Environment Variables**
2. Add these variables:

```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret_here
```

⚠️ **Important**: Replace with your actual Razorpay credentials

### **Step 2: Deploy Edge Functions**

```bash
# Deploy order creation function
supabase functions deploy create-razorpay-order

# Deploy payment verification function  
supabase functions deploy verify-razorpay-payment
```

### **Step 3: Set Client Environment**

Create `.env.local` in your project root:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
```

### **Step 4: Test the System**

1. **Start your app**: `npm run dev`
2. **Add items to cart**
3. **Go to checkout**
4. **Use Razorpay test cards**:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4111 1111 1111 1112`
   - **Any future date** for expiry
   - **Any 3-digit CVV**

## ✅ **How It Works (Without Webhooks)**

### **Payment Flow**:
1. **User clicks "Pay"** → Creates secure order via `create-razorpay-order`
2. **Razorpay checkout opens** → User completes payment
3. **Payment success** → Verified via `verify-razorpay-payment`
4. **Order completed** → User redirected to success page

### **Security Features**:
- ✅ Server-side order creation (prevents amount tampering)
- ✅ Server-side payment verification (HMAC signature validation)
- ✅ Secure API key storage (server-side only)
- ✅ User authentication required
- ✅ Database security (RLS enabled)

## 🧪 **Testing Checklist**

- [ ] Order creation works
- [ ] Payment processing works
- [ ] Success page shows correct details
- [ ] Failed payments handled properly
- [ ] Cart cleared after successful payment
- [ ] Database updated correctly

## 🔄 **When to Add Webhooks Later**

Consider adding webhooks when you need:
- **High transaction volume**
- **Critical payment reliability**
- **Real-time inventory management**
- **Automated email notifications**
- **Payment analytics**

## 🚀 **Going to Production**

### **For Live Payments**:

1. **Update Razorpay keys** to live keys:
```env
# Supabase Environment Variables
RAZORPAY_KEY_ID=rzp_live_your_live_key_here
RAZORPAY_KEY_SECRET=your_live_razorpay_secret_here

# Client .env.local
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_here
```

2. **Complete Razorpay KYC verification**
3. **Test with small amounts first**
4. **Monitor payment logs**

## 🐛 **Troubleshooting**

### **Common Issues**:

1. **"Function not found"**
   ```bash
   # Redeploy functions
   supabase functions deploy create-razorpay-order
   supabase functions deploy verify-razorpay-payment
   ```

2. **"Razorpay credentials not configured"**
   - Check environment variables in Supabase Dashboard
   - Ensure exact variable names: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

3. **"Payment verification failed"**
   - Verify Key Secret is correct
   - Check for typos in environment variables

4. **"Order creation failed"**
   - Check Supabase function logs: `supabase functions logs create-razorpay-order`
   - Verify user authentication

### **Debug Commands**:
```bash
# Check function logs
supabase functions logs create-razorpay-order
supabase functions logs verify-razorpay-payment

# Test functions locally
supabase functions serve
```

## 📊 **System Status**

Your payment system includes:
- ✅ **Secure Order Creation** (Server-side)
- ✅ **Payment Verification** (Server-side HMAC validation)
- ✅ **Real-time UI Updates** (Client-side status tracking)
- ✅ **GST Calculations** (18% automatic)
- ✅ **Cart Management** (Persistent storage)
- ✅ **Success/Failure Handling** (Professional pages)
- ✅ **Mobile Responsive** (Works on all devices)

## 🎉 **You're Ready!**

Your secure payment system is now live with:
- Server-side security
- Real-time processing
- Professional UI/UX
- Production-ready architecture

**Start processing payments immediately with just your Razorpay Key ID and Secret!**

---

💡 **Need webhooks later?** Refer to `SUPABASE_SETUP.md` for the complete webhook integration guide. 