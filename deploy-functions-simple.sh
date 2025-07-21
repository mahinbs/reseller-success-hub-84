#!/bin/bash

# Simple Supabase Edge Functions Deployment (No Webhooks)
# This script deploys only the essential payment functions

echo "🚀 Deploying Essential Razorpay Functions (No Webhooks)..."

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

echo ""
echo "🎉 Essential Functions Deployed Successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - RAZORPAY_KEY_ID=rzp_test_your_key_here"
echo "   - RAZORPAY_KEY_SECRET=your_secret_here"
echo ""
echo "2. Update your .env.local file:"
echo "   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here"
echo ""
echo "3. Test with Razorpay test cards:"
echo "   Success: 4111 1111 1111 1111"
echo "   Failure: 4111 1111 1111 1112"
echo ""
echo "🎯 Your payment system is ready! No webhooks needed."
echo "📖 See SIMPLE_SETUP.md for detailed instructions." 