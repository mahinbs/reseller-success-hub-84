#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys all payment-related Edge Functions to Supabase

echo "🚀 Deploying Supabase Edge Functions for Razorpay Integration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're linked to a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not linked to a Supabase project. Please run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📦 Deploying create-razorpay-order function..."
supabase functions deploy create-razorpay-order
if [ $? -eq 0 ]; then
    echo "✅ create-razorpay-order deployed successfully"
else
    echo "❌ Failed to deploy create-razorpay-order"
    exit 1
fi

echo "📦 Deploying verify-razorpay-payment function..."
supabase functions deploy verify-razorpay-payment
if [ $? -eq 0 ]; then
    echo "✅ verify-razorpay-payment deployed successfully"
else
    echo "❌ Failed to deploy verify-razorpay-payment"
    exit 1
fi

echo "📦 Deploying razorpay-webhook function..."
supabase functions deploy razorpay-webhook
if [ $? -eq 0 ]; then
    echo "✅ razorpay-webhook deployed successfully"
else
    echo "❌ Failed to deploy razorpay-webhook"
    exit 1
fi

echo "📦 Deploying send-invoice-email function..."
supabase functions deploy send-invoice-email
if [ $? -eq 0 ]; then
    echo "✅ send-invoice-email deployed successfully"
else
    echo "❌ Failed to deploy send-invoice-email"
    exit 1
fi

echo "📦 Deploying generate-invoice-pdf function..."
supabase functions deploy generate-invoice-pdf
if [ $? -eq 0 ]; then
    echo "✅ generate-invoice-pdf deployed successfully"
else
    echo "❌ Failed to deploy generate-invoice-pdf"
    exit 1
fi

echo ""
echo "🎉 All Edge Functions deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - RAZORPAY_KEY_ID"
echo "   - RAZORPAY_KEY_SECRET"
echo "   - RAZORPAY_WEBHOOK_SECRET"
echo "   - RESEND_API_KEY (for email invoices)"
echo ""
echo "2. Configure webhook in Razorpay Dashboard:"
echo "   URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook"
echo "   Events: payment.captured, payment.failed, payment.authorized, order.paid"
echo ""
echo "3. Update your .env.local file:"
echo "   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id"
echo ""
echo "🔧 For detailed setup instructions, see SUPABASE_SETUP.md" 

echo ""
echo "🎉 All Edge Functions deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - RAZORPAY_KEY_ID"
echo "   - RAZORPAY_KEY_SECRET"
echo "   - RAZORPAY_WEBHOOK_SECRET"
echo "   - RESEND_API_KEY (for email invoices)"
echo ""
echo "2. Configure webhook in Razorpay Dashboard:"
echo "   URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook"
echo "   Events: payment.captured, payment.failed, payment.authorized, order.paid"
echo ""
echo "3. Update your .env.local file:"
echo "   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id"
echo ""
echo "🔧 For detailed setup instructions, see SUPABASE_SETUP.md" 