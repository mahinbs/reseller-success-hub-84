import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderRequest {
    cart_items: Array<{
        id: string;
        name: string;
        price: number;
        type: 'service' | 'bundle' | 'addon';
        billing_period?: string;
    }>;
    coupon_code?: string;
    customer_gst_number?: string;
    business_info?: {
        businessName?: string;
        businessAddress?: string;
        businessGstNumber?: string;
    };
}

interface RazorpayOrderResponse {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Get user from JWT token
        const authHeader = req.headers.get('authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Parse request body
        const { cart_items, coupon_code, customer_gst_number, business_info }: OrderRequest = await req.json()

        if (!cart_items || cart_items.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Cart is empty' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Calculate subtotal
        const subtotal = cart_items.reduce((sum, item) => sum + item.price, 0)

        // Apply coupon discount if provided
        let couponDiscount = 0
        let appliedCoupon: any = null

        if (coupon_code) {
            const { data: coupon, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', coupon_code)
                .eq('is_active', true)
                .single()

            if (coupon && !couponError) {
                // Check if coupon is still valid (dates)
                const now = new Date()
                const validFrom = new Date(coupon.valid_from)
                const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

                if (now >= validFrom && (!validUntil || now <= validUntil)) {
                    // Check if user has already used this coupon
                    const { data: usage } = await supabase
                        .from('coupon_usage')
                        .select('id')
                        .eq('coupon_id', coupon.id)
                        .eq('user_id', user.id)
                        .single()

                    if (!usage) {
                        // Check usage limits
                        if (!coupon.max_uses || coupon.current_uses < coupon.max_uses) {
                            // For multiple items in cart, apply discount only to the lowest price item
                            const lowestPriceItem = Math.min(...cart_items.map(item => item.price))

                            // Apply discount
                            if (coupon.discount_type === 'percentage') {
                                if (cart_items.length > 1) {
                                    // Apply percentage only to lowest price item
                                    couponDiscount = (lowestPriceItem * coupon.discount_value) / 100
                                } else {
                                    // Apply to full subtotal if only one item
                                    couponDiscount = (subtotal * coupon.discount_value) / 100
                                }
                            } else if (coupon.discount_type === 'fixed') {
                                if (cart_items.length > 1) {
                                    // Apply fixed discount only to lowest price item (don't exceed item price)
                                    couponDiscount = Math.min(coupon.discount_value, lowestPriceItem)
                                } else {
                                    // Apply to full subtotal if only one item
                                    couponDiscount = coupon.discount_value
                                }
                            } else if (coupon.discount_type === 'service_one_dollar') {
                                // Find the lowest price service item (not bundle or addon)
                                const serviceItems = cart_items.filter(item => item.type === 'service')
                                if (serviceItems.length > 0) {
                                    const lowestPriceService = Math.min(...serviceItems.map(item => item.price))
                                    // Set discount to make the service cost ₹84 (discount = original_price - 84)
                                    couponDiscount = Math.max(0, lowestPriceService - 84)
                                }
                            } else if (coupon.discount_type === 'free_months') {
                                // For free months, always apply only to the lowest price item
                                const lowestPriceMonthly = cart_items.find(item =>
                                    item.price === lowestPriceItem &&
                                    (item.billing_period === 'monthly' || item.billing_period === 'month')
                                )

                                if (lowestPriceMonthly) {
                                    couponDiscount = lowestPriceMonthly.price * (coupon.free_months || 1)
                                } else {
                                    // If lowest price item is not monthly, estimate monthly equivalent
                                    // Assume annual service, so divide by 12 to get monthly equivalent
                                    const estimatedMonthly = lowestPriceItem / 12
                                    couponDiscount = estimatedMonthly * (coupon.free_months || 1)
                                }

                                // Don't exceed the actual item price
                                couponDiscount = Math.min(couponDiscount, lowestPriceItem)
                            }

                            couponDiscount = Math.min(couponDiscount, subtotal) // Don't discount more than subtotal
                            appliedCoupon = coupon
                        }
                    }
                }
            }
        }

        // Calculate final amounts
        const discountedSubtotal = subtotal - couponDiscount
        const gstAmount = discountedSubtotal * 0.18
        let totalAmount = discountedSubtotal + gstAmount

        // Ensure minimum amount of ₹1 for Razorpay (even for 100% discount coupons)
        const minimumAmount = 1.00
        if (totalAmount < minimumAmount) {
            totalAmount = minimumAmount
        }

        const amountInPaise = Math.round(totalAmount * 100) // Convert to paise

        // Note: We no longer handle zero-amount orders here since we ensure minimum ₹1

        // Create purchase record in database first
        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                user_id: user.id,
                total_amount: totalAmount,
                payment_status: 'pending',
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
                coupon_code: appliedCoupon?.code || null,
                coupon_discount: couponDiscount || null,
                coupon_free_months: appliedCoupon?.free_months || null,
                customer_gst_number: customer_gst_number || null,
                customer_business_name: business_info?.businessName || null,
                customer_address: business_info?.businessAddress || (business_info?.businessName ? business_info.businessAddress : null),
            })
            .select()
            .single()

        if (purchaseError) {
            console.error('Error creating purchase:', purchaseError)
            return new Response(
                JSON.stringify({ error: 'Failed to create purchase record' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Create purchase items
        const purchaseItems = cart_items.map(item => ({
            purchase_id: purchase.id,
            service_id: item.type === 'service' ? item.id : null,
            bundle_id: item.type === 'bundle' ? item.id : null,
            addon_id: item.type === 'addon' ? item.id : null,
            item_name: item.name,
            item_price: item.price,
            billing_period: item.billing_period || null,
        }))

        const { error: itemsError } = await supabase
            .from('purchase_items')
            .insert(purchaseItems)

        if (itemsError) {
            console.error('Error creating purchase items:', itemsError)
            // Clean up the purchase record
            await supabase.from('purchases').delete().eq('id', purchase.id)
            return new Response(
                JSON.stringify({ error: 'Failed to create purchase items' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Note: Coupon usage will be recorded only after successful payment verification

        // Create Razorpay order
        // Note: Receipt must be ≤ 40 characters for Razorpay
        const shortId = purchase.id.replace(/-/g, '').substring(0, 32); // Remove hyphens and shorten
        const razorpayOrder = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `ord_${shortId}`, // 4 + 32 = 36 characters (under 40 limit)
            notes: {
                purchase_id: purchase.id,
                user_id: user.id,
                item_count: cart_items.length.toString()
            }
        }

        // Make request to Razorpay API
        const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${razorpayAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(razorpayOrder),
        })

        if (!razorpayResponse.ok) {
            const errorText = await razorpayResponse.text()
            console.error('Razorpay API error:', errorText)

            // Clean up the purchase record
            await supabase.from('purchases').delete().eq('id', purchase.id)

            return new Response(
                JSON.stringify({ error: 'Failed to create Razorpay order' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const razorpayOrderData: RazorpayOrderResponse = await razorpayResponse.json()

        // Update purchase with Razorpay order ID
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                razorpay_order_id: razorpayOrderData.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', purchase.id)

        if (updateError) {
            console.error('Error updating purchase with Razorpay order ID:', updateError)
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                purchase_id: purchase.id,
                razorpay_order_id: razorpayOrderData.id,
                amount: amountInPaise,
                currency: razorpayOrderData.currency,
                key: RAZORPAY_KEY_ID,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error in create-razorpay-order function:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
}) 