import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  purchase_id: string;
}

// Helper function to verify Razorpay payment signature
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const body = orderId + "|" + paymentId;
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
    console.error('Error verifying signature:', error);
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
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured')
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
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      purchase_id
    }: PaymentVerificationRequest = await req.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !purchase_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment verification data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get purchase from database
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchase_id)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return new Response(
        JSON.stringify({ error: 'Purchase not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if purchase is already completed
    if (purchase.payment_status === 'completed') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment already verified',
          purchase_id: purchase.id,
          payment_status: 'completed'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify that the order ID matches
    if (purchase.razorpay_order_id !== razorpay_order_id) {
      return new Response(
        JSON.stringify({ error: 'Order ID mismatch' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify payment signature with Razorpay
    const isValidSignature = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    )

    if (!isValidSignature) {
      // Update purchase status to failed
      await supabase
        .from('purchases')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase_id)

      return new Response(
        JSON.stringify({ error: 'Payment signature verification failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch payment details from Razorpay to double-check
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
      },
    })

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment from Razorpay')
      return new Response(
        JSON.stringify({ error: 'Failed to verify payment with Razorpay' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paymentData = await paymentResponse.json()

    // Verify payment status and amount
    if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
      return new Response(
        JSON.stringify({ error: 'Payment not successful' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify amount matches (in paise)
    const expectedAmount = Math.round(purchase.total_amount * 100)
    if (paymentData.amount !== expectedAmount) {
      return new Response(
        JSON.stringify({ error: 'Payment amount mismatch' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update purchase as completed
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        payment_method: paymentData.method || 'razorpay',
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase_id)

    if (updateError) {
      console.error('Error updating purchase status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update purchase status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Clear user's cart items
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    // Send confirmation email automatically (optional - won't break payment if fails)
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          purchase_id: purchase.id,
          email_type: 'confirmation'
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      if (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the payment verification if email fails
      } else if (emailData && emailData.success) {
        console.log('Confirmation email sent successfully for purchase:', purchase.id)
      } else {
        console.log('Email service not configured - skipping confirmation email for purchase:', purchase.id)
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the payment verification if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        purchase_id: purchase.id,
        payment_status: 'completed',
        payment_id: razorpay_payment_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in verify-razorpay-payment function:', error)
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