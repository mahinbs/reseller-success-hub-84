import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceEmailRequest {
  purchase_id: string;
  email_type?: 'confirmation' | 'manual'; // confirmation = auto, manual = user requested
}

// Generate invoice HTML function
function generateInvoiceHTML(purchase: any, subtotal: number, couponDiscount: number, gstAmount: number, total: number): string {
  const orderDate = new Date(purchase.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const invoiceNumber = `BMS-${purchase.id.slice(-8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber} - BoostMySites</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                background-color: #f8fafc;
                padding: 20px;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            /* Header Section */
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
                position: relative;
            }
            
            .company-logo {
                font-size: 36px;
                font-weight: 800;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
            }
            
            .company-tagline {
                font-size: 16px;
                font-weight: 300;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .invoice-badge {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 14px;
                z-index: 1;
            }
            
            /* Main Content */
            .content {
                padding: 40px;
            }
            
            .invoice-meta {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
            }
            
            .meta-section h3 {
                color: #4F46E5;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .meta-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 4px 0;
            }
            
            .meta-label {
                font-weight: 500;
                color: #6b7280;
            }
            
            .meta-value {
                font-weight: 600;
                color: #111827;
            }
            
            .status-paid {
                background: #10b981;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            /* Items Table */
            .items-section {
                margin: 40px 0;
            }
            
            .section-title {
                color: #4F46E5;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }
            
            .section-title::before {
                content: '📋';
                margin-right: 10px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            
            .items-table th {
                background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
                color: #374151;
                font-weight: 600;
                padding: 16px;
                text-align: left;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .items-table td {
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
                vertical-align: top;
            }
            
            .items-table tbody tr:hover {
                background-color: #f9fafb;
            }
            
            .item-name {
                font-weight: 600;
                color: #111827;
            }
            
            .item-type {
                background: #ddd6fe;
                color: #5b21b6;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .item-billing {
                color: #6b7280;
                font-size: 14px;
            }
            
            .item-price {
                font-weight: 700;
                color: #059669;
                text-align: right;
            }
            
            /* Totals Section */
            .totals-section {
                margin-top: 40px;
                display: flex;
                justify-content: flex-end;
            }
            
            .totals-table {
                min-width: 350px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .total-row.subtotal {
                background: #f9fafb;
            }
            
            .total-row.discount {
                background: #ecfdf5;
                color: #059669;
                font-weight: 600;
            }
            
            .total-row.tax {
                background: #fef3c7;
                color: #d97706;
            }
            
            .total-row.final {
                background: linear-gradient(90deg, #4F46E5 0%, #7c3aed 100%);
                color: white;
                font-weight: 700;
                font-size: 18px;
                border: none;
                border-radius: 8px;
                margin-top: 8px;
            }
            
            /* Special Offers */
            .special-offer {
                background: linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%);
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            
            .special-offer h4 {
                color: #059669;
                font-size: 18px;
                margin-bottom: 8px;
            }
            
            /* Next Steps */
            .next-steps {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 12px;
                padding: 30px;
                margin: 40px 0;
            }
            
            .next-steps h3 {
                color: #0369a1;
                font-size: 20px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
            }
            
            .next-steps h3::before {
                content: '🚀';
                margin-right: 10px;
            }
            
            .next-steps ul {
                list-style: none;
                padding: 0;
            }
            
            .next-steps li {
                padding: 8px 0;
                padding-left: 24px;
                position: relative;
                color: #0c4a6e;
            }
            
            .next-steps li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #059669;
                font-weight: bold;
            }
            
            /* Footer */
            .footer {
                background: #1f2937;
                color: white;
                padding: 30px 40px;
                text-align: center;
            }
            
            .footer-content {
                max-width: 600px;
                margin: 0 auto;
            }
            
            .company-info {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
            }
            
            .contact-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin: 16px 0;
                font-size: 14px;
            }
            
            .footer-message {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #374151;
                font-style: italic;
                opacity: 0.8;
            }
            
            /* Responsive */
            @media (max-width: 600px) {
                .invoice-meta {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .contact-info {
                    grid-template-columns: 1fr;
                }
                
                .content {
                    padding: 20px;
                }
                
                .header {
                    padding: 20px;
                }
                
                .invoice-badge {
                    position: relative;
                    top: auto;
                    right: auto;
                    margin-top: 16px;
                    display: inline-block;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="invoice-badge">INVOICE</div>
                <div class="company-logo">BoostMySites</div>
                <div class="company-tagline">Payment Receipt</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Invoice Meta Information -->
                <div class="invoice-meta">
                    <div class="meta-section">
                        <h3>📄 Invoice Details</h3>
                        <div class="meta-item">
                            <span class="meta-label">Invoice Number:</span>
                            <span class="meta-value">${invoiceNumber}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Issue Date:</span>
                            <span class="meta-value">${currentDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Order Date:</span>
                            <span class="meta-value">${orderDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Payment Status:</span>
                            <span class="status-paid">PAID</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Payment Method:</span>
                            <span class="meta-value">${purchase.payment_method || 'Razorpay'}</span>
                        </div>
                    </div>
                    
                    <div class="meta-section">
                        <h3>👤 Customer Details</h3>
                        <div class="meta-item">
                            <span class="meta-label">Name:</span>
                            <span class="meta-value">${purchase.profiles.full_name || 'Valued Customer'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Email:</span>
                            <span class="meta-value">${purchase.profiles.email}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Customer ID:</span>
                            <span class="meta-value">${purchase.user_id.slice(-8).toUpperCase()}</span>
                        </div>
                        ${purchase.customer_gst_number ? `
                        <div class="meta-item">
                            <span class="meta-label">GST Number:</span>
                            <span class="meta-value">${purchase.customer_gst_number}</span>
                        </div>` : ''}
                        ${purchase.profiles.gst_number ? `
                        <div class="meta-item">
                            <span class="meta-label">Registered GST:</span>
                            <span class="meta-value">${purchase.profiles.gst_number}</span>
                        </div>` : ''}
                    </div>
                </div>
                
                <!-- Items Section -->
                <div class="items-section">
                    <h2 class="section-title">Order Items</h2>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Service/Product</th>
                                <th>Type</th>
                                <th>Billing Period</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchase.purchase_items.map((item: any) => `
                            <tr>
                                <td class="item-name">${item.item_name}</td>
                                <td><span class="item-type">${item.service_id ? 'Service' : item.bundle_id ? 'Bundle' : 'Add-on'}</span></td>
                                <td class="item-billing">${item.billing_period || 'One-time'}</td>
                                <td class="item-price">₹${Number(item.item_price).toFixed(2)}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Totals Section -->
                <div class="totals-section">
                    <div class="totals-table">
                        <div class="total-row subtotal">
                            <span>Subtotal:</span>
                            <span>₹${subtotal.toFixed(2)}</span>
                        </div>
                        ${couponDiscount > 0 ? `
                        <div class="total-row discount">
                            <span>Coupon Discount (${purchase.coupon_code}):</span>
                            <span>-₹${couponDiscount.toFixed(2)}</span>
                        </div>` : ''}
                        <div class="total-row tax">
                            <span>GST (18%):</span>
                            <span>₹${gstAmount.toFixed(2)}</span>
                        </div>
                        <div class="total-row final">
                            <span>Total Amount:</span>
                            <span>₹${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                ${purchase.coupon_free_months ? `
                <div class="special-offer">
                    <h4>🎉 Special Offer Applied</h4>
                    <p>You've received <strong>${purchase.coupon_free_months} free service months</strong> with this order!</p>
                </div>` : ''}
                
                <!-- Service Information -->
                <div class="next-steps">
                    <h3>Service Details</h3>
                    <ul>
                        <li>Dashboard access: Use your registered email</li>
                        <li>Support: support@boostmysites.com</li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-content">
                    <div class="company-info">BoostMySites</div>
                    <div class="contact-info">
                        <div>📧 support@boostmysites.com</div>
                        <div>📞 +91 XXX XXX XXXX</div>
                    </div>
                    <div class="footer-message">
                        Thank you for choosing BoostMySites for your digital transformation journey!
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151; font-size: 12px; color: #9CA3AF;">
                        <p>This is a transactional email regarding your purchase. No unsubscribe option is required.</p>
                        <p>If you have questions, reply to this email or contact support@boostmysites.com</p>
                        <p>© 2025 BoostMySites. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('send-invoice-email function called');

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Environment check:', {
      hasResendKey: !!RESEND_API_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    });

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found');
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
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.log('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User authenticated:', user.id);

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

    console.log('Fetching purchase:', purchase_id);

    // Get purchase details with items
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        purchase_items(*)
      `)
      .eq('id', purchase_id)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      console.log('Purchase not found:', purchaseError);
      return new Response(
        JSON.stringify({ error: 'Purchase not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user profile separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, gst_number')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Combine purchase and profile data
    purchase.profiles = profile

    if (purchase.payment_status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Purchase found, generating invoice...');

    // Calculate totals (accounting for coupon discount)
    const subtotal = purchase.purchase_items.reduce((sum: number, item: any) => sum + Number(item.item_price), 0)
    const couponDiscount = Number(purchase.coupon_discount || 0)
    const discountedSubtotal = subtotal - couponDiscount
    const gstAmount = discountedSubtotal * 0.18
    const total = discountedSubtotal + gstAmount

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHTML(purchase, subtotal, couponDiscount, gstAmount, total)

    console.log('Sending email via Resend...');

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BoostMySites Billing <noreply@baas.boostmysites.com>',
        to: [purchase.profiles.email],
        cc: ['admin@boostmysites.com'], // CC instead of multiple TO addresses
        subject: `Receipt #${purchase.id.slice(-8).toUpperCase()}`,
        reply_to: 'support@boostmysites.com',
        html: invoiceHtml,
        headers: {
          'X-Entity-Ref-ID': purchase.id,
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        },
        tags: [
          { name: 'category', value: 'invoice' },
          { name: 'purchase_id', value: purchase.id },
          { name: 'email_type', value: email_type }
        ]
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error('Failed to send email')
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id);

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