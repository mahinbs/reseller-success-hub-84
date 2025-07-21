import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceEmailRequest {
    purchase_id: string;
    email_type?: 'confirmation' | 'manual'; // confirmation = auto, manual = user requested
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RESEND_API_KEY) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Email service not configured. Please use PDF download instead.',
                    message: 'Email functionality requires additional setup. PDF download is available.'
                }),
                {
                    status: 200, // Return 200 to prevent error UI 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
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
        const { purchase_id, email_type = 'manual' }: InvoiceEmailRequest = await req.json()

        if (!purchase_id) {
            return new Response(
                JSON.stringify({ error: 'Purchase ID is required' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Get purchase details with items and user profile
        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .select(`
        *,
        purchase_items(*),
        profiles(full_name, email)
      `)
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

        if (purchase.payment_status !== 'completed') {
            return new Response(
                JSON.stringify({ error: 'Payment not completed' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Calculate totals
        const subtotal = purchase.purchase_items.reduce((sum: number, item: any) => sum + Number(item.item_price), 0)
        const gstAmount = subtotal * 0.18
        const total = subtotal + gstAmount

        // Generate invoice HTML
        const invoiceHtml = generateInvoiceHTML(purchase, subtotal, gstAmount, total)

        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'BoostMySites <invoices@boostmysites.com>',
                to: [purchase.profiles.email],
                subject: `Invoice for Order #${purchase.id.slice(-8).toUpperCase()} - BoostMySites`,
                html: invoiceHtml,
                tags: [
                    { name: 'category', value: 'invoice' },
                    { name: 'purchase_id', value: purchase.id },
                    { name: 'email_type', value: email_type }
                ]
            }),
        })

        if (!emailResponse.ok) {
            const errorText = await emailResponse.text()
            console.error('Resend API error:', errorText)
            throw new Error('Failed to send email')
        }

        const emailResult = await emailResponse.json()

        // Log email sent (optional: save to database)
        console.log(`Invoice email sent for purchase ${purchase_id}:`, emailResult.id)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Invoice email sent successfully',
                email_id: emailResult.id
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error in send-invoice-email function:', error)
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

function generateInvoiceHTML(purchase: any, subtotal: number, gstAmount: number, total: number): string {
    const orderDate = new Date(purchase.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - BoostMySites</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
        .company-name { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 5px; }
        .company-tagline { color: #666; font-size: 14px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-info, .customer-info { width: 48%; }
        .section-title { font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-weight: bold; font-size: 18px; color: #4F46E5; border-top: 2px solid #4F46E5; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .payment-info { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">BoostMySites</div>
          <div class="company-tagline">AI-Powered Digital Services</div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="invoice-info">
            <div class="section-title">Invoice Details</div>
            <p><strong>Invoice #:</strong> ${purchase.id.slice(-8).toUpperCase()}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">Completed</span></p>
            <p><strong>Payment Method:</strong> ${purchase.payment_method || 'Razorpay'}</p>
          </div>
          
          <div class="customer-info">
            <div class="section-title">Customer Information</div>
            <p><strong>Name:</strong> ${purchase.profiles.full_name || 'Valued Customer'}</p>
            <p><strong>Email:</strong> ${purchase.profiles.email}</p>
            <p><strong>Customer ID:</strong> ${purchase.user_id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
          <p><strong>✅ Payment Confirmed</strong></p>
          <p>Your payment has been successfully processed and your services are being activated.</p>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Service/Bundle</th>
              <th>Type</th>
              <th>Billing</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${purchase.purchase_items.map((item: any) => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.service_id ? 'Service' : 'Bundle'}</td>
                <td>${item.billing_period || 'One-time'}</td>
                <td>₹${Number(item.item_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>GST (18%):</span>
            <span>₹${gstAmount.toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Amount:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Next Steps -->
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 30px 0;">
          <h3 style="color: #4F46E5; margin-bottom: 15px;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our team will contact you within 24 hours to initiate your services</li>
            <li>You'll receive access credentials and setup instructions</li>
            <li>Track your services and support tickets from your dashboard</li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>BoostMySites</strong> | AI-Powered Digital Services</p>
          <p>📧 support@boostmysites.com | 📞 +91 XXX XXX XXXX</p>
          <p>Thank you for choosing BoostMySites for your digital transformation!</p>
        </div>
      </div>
    </body>
    </html>
  `
} 