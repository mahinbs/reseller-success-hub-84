import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

// Helper function to verify webhook signature
async function verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string
): Promise<boolean> {
    try {
        const expectedSignature = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        ).then(key =>
            crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
        ).then(signature =>
            Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
        );

        return expectedSignature === signature;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RAZORPAY_WEBHOOK_SECRET) {
            console.error('Razorpay webhook secret not configured')
            return new Response('Webhook secret not configured', { status: 500 })
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Supabase credentials not configured')
            return new Response('Supabase not configured', { status: 500 })
        }

        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Get webhook signature
        const signature = req.headers.get('x-razorpay-signature')
        if (!signature) {
            console.error('Missing webhook signature')
            return new Response('Unauthorized', { status: 401 })
        }

        // Get request body
        const body = await req.text()

        // Verify webhook signature
        const isValidSignature = await verifyWebhookSignature(
            body,
            signature,
            RAZORPAY_WEBHOOK_SECRET
        )

        if (!isValidSignature) {
            console.error('Invalid webhook signature')
            return new Response('Unauthorized', { status: 401 })
        }

        // Parse webhook payload
        const payload = JSON.parse(body)
        const event = payload.event
        const paymentEntity = payload.payload.payment.entity
        const orderEntity = payload.payload.order?.entity

        console.log(`Received webhook: ${event}`)

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(supabase, paymentEntity, orderEntity)
                break

            case 'payment.failed':
                await handlePaymentFailed(supabase, paymentEntity, orderEntity)
                break

            case 'payment.authorized':
                await handlePaymentAuthorized(supabase, paymentEntity, orderEntity)
                break

            case 'order.paid':
                await handleOrderPaid(supabase, orderEntity)
                break

            case 'payment_link.paid':
                await handlePaymentLinkPaid(supabase, payload.payload.payment_link.entity, paymentEntity)
                break

            default:
                console.log(`Unhandled webhook event: ${event}`)
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Error processing webhook:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
})

// Handle payment captured event
async function handlePaymentCaptured(supabase: any, payment: any, order: any) {
    try {
        console.log(`Processing payment.captured for payment: ${payment.id}`)

        // Find purchase by order ID
        const { data: purchase, error: findError } = await supabase
            .from('purchases')
            .select('*')
            .eq('razorpay_order_id', payment.order_id)
            .single()

        if (findError || !purchase) {
            console.error('Purchase not found for order:', payment.order_id)
            return
        }

        // Update purchase status
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_status: 'completed',
                razorpay_payment_id: payment.id,
                payment_method: payment.method,
                updated_at: new Date().toISOString()
            })
            .eq('id', purchase.id)

        if (updateError) {
            console.error('Error updating purchase:', updateError)
            return
        }

        // Clear user's cart
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', purchase.user_id)

        console.log(`Successfully processed payment.captured for purchase: ${purchase.id}`)

        // TODO: Send confirmation email
        // TODO: Trigger post-purchase workflows

    } catch (error) {
        console.error('Error handling payment.captured:', error)
    }
}

// Handle payment failed event
async function handlePaymentFailed(supabase: any, payment: any, order: any) {
    try {
        console.log(`Processing payment.failed for payment: ${payment.id}`)

        // Find purchase by order ID
        const { data: purchase, error: findError } = await supabase
            .from('purchases')
            .select('*')
            .eq('razorpay_order_id', payment.order_id)
            .single()

        if (findError || !purchase) {
            console.error('Purchase not found for order:', payment.order_id)
            return
        }

        // Update purchase status
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_status: 'failed',
                razorpay_payment_id: payment.id,
                payment_method: payment.method,
                updated_at: new Date().toISOString()
            })
            .eq('id', purchase.id)

        if (updateError) {
            console.error('Error updating purchase:', updateError)
            return
        }

        console.log(`Successfully processed payment.failed for purchase: ${purchase.id}`)

    } catch (error) {
        console.error('Error handling payment.failed:', error)
    }
}

// Handle payment authorized event
async function handlePaymentAuthorized(supabase: any, payment: any, order: any) {
    try {
        console.log(`Processing payment.authorized for payment: ${payment.id}`)

        // Find purchase by order ID
        const { data: purchase, error: findError } = await supabase
            .from('purchases')
            .select('*')
            .eq('razorpay_order_id', payment.order_id)
            .single()

        if (findError || !purchase) {
            console.error('Purchase not found for order:', payment.order_id)
            return
        }

        // Update purchase status to processing (waiting for capture)
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_status: 'processing',
                razorpay_payment_id: payment.id,
                payment_method: payment.method,
                updated_at: new Date().toISOString()
            })
            .eq('id', purchase.id)

        if (updateError) {
            console.error('Error updating purchase:', updateError)
            return
        }

        console.log(`Successfully processed payment.authorized for purchase: ${purchase.id}`)

    } catch (error) {
        console.error('Error handling payment.authorized:', error)
    }
}

// Handle order paid event
async function handleOrderPaid(supabase: any, order: any) {
    try {
        console.log(`Processing order.paid for order: ${order.id}`)

        // Find purchase by order ID
        const { data: purchase, error: findError } = await supabase
            .from('purchases')
            .select('*')
            .eq('razorpay_order_id', order.id)
            .single()

        if (findError || !purchase) {
            console.error('Purchase not found for order:', order.id)
            return
        }

        // Ensure purchase is marked as completed
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', purchase.id)

        if (updateError) {
            console.error('Error updating purchase:', updateError)
            return
        }

        console.log(`Successfully processed order.paid for purchase: ${purchase.id}`)

    } catch (error) {
        console.error('Error handling order.paid:', error)
    }
}

// Handle payment link paid event
async function handlePaymentLinkPaid(supabase: any, paymentLink: any, payment: any) {
    try {
        console.log(`Processing payment_link.paid for payment link: ${paymentLink.id}`)

        // Check if this is the fee hike policy payment link
        if (paymentLink.short_url !== 'https://rzp.io/rzp/0xZSXed') {
            console.log('Not a fee hike policy payment link, skipping')
            return
        }

        // Insert policy payment record
        const { error: insertError } = await supabase
            .from('policy_payments')
            .insert({
                email: paymentLink.customer?.email || payment.email,
                phone: paymentLink.customer?.contact || payment.contact,
                amount: paymentLink.amount_paid / 100, // Convert from paise to rupees
                currency: paymentLink.currency,
                status: 'paid',
                rzp_payment_id: payment.id,
                rzp_payment_link_id: paymentLink.id,
                rzp_short_url: paymentLink.short_url,
                raw_payload: { paymentLink, payment }
            })

        if (insertError) {
            console.error('Error inserting policy payment record:', insertError)
            throw insertError
        }

        console.log(`Successfully processed payment_link.paid for payment link: ${paymentLink.id}`)

    } catch (error) {
        console.error('Error handling payment_link.paid:', error)
        throw error
    }
}