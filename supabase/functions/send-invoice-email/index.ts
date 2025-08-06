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

// Helper function to convert number to words
function convertNumberToWords(num: number): string {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const thousands = ['', 'THOUSAND', 'LAKH', 'CRORE'];

  if (num === 0) return 'ZERO';

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  let result = '';
  let unitIndex = 0;

  while (num > 0) {
    if (unitIndex === 0) {
      if (num % 1000 !== 0) {
        result = convertHundreds(num % 1000) + thousands[unitIndex] + ' ' + result;
      }
      num = Math.floor(num / 1000);
    } else {
      if (num % 100 !== 0) {
        result = convertHundreds(num % 100) + thousands[unitIndex] + ' ' + result;
      }
      num = Math.floor(num / 100);
    }
    unitIndex++;
  }

  return result.trim();
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
  const invoiceNumber = purchase.id.slice(-4).toUpperCase();
  const currentDate = new Date().toLocaleDateString('en-GB');

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
                font-family: Arial, sans-serif;
                line-height: 1.4;
                color: #333;
                background-color: #f5f5f5;
                padding: 20px;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 1px solid #ddd;
            }
            
            /* Header */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 20px;
                border-bottom: 1px solid #ddd;
            }
            
            .header-left h1 {
                color: #8B5CF6;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .header-left p {
                color: #666;
                font-size: 14px;
                margin: 2px 0;
            }
            
            .header-right {
                text-align: right;
            }
            
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }
            
            .logo .boost { color: #333; }
            .logo .my { color: #333; }
            .logo .sites { color: #FF8C00; }
            
            /* Billing Section */
            .billing-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                padding: 30px 20px;
                border-bottom: 1px solid #ddd;
            }
            
            .billing-box {
                background: #F8F9FA;
                padding: 20px;
                border-radius: 8px;
            }
            
            .billing-title {
                color: #8B5CF6;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            
            .billing-content p {
                margin: 3px 0;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .billing-content strong {
                font-weight: 600;
            }
            
            /* Items Table */
            .items-section {
                padding: 0 20px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            .items-table th {
                background: #8B5CF6;
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-size: 12px;
                font-weight: bold;
            }
            
            .items-table td {
                padding: 12px 8px;
                border-bottom: 1px solid #eee;
                font-size: 14px;
            }
            
            .items-table tbody tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .item-number {
                width: 30px;
                text-align: center;
            }
            
            .amount-cell {
                text-align: right;
                font-family: monospace;
            }
            
            /* Totals Section */
            .totals-section {
                padding: 20px;
                border-top: 1px solid #ddd;
            }
            
            .totals-left {
                width: 60%;
                display: inline-block;
                vertical-align: top;
            }
            
            .amount-words {
                font-size: 12px;
                color: #666;
                margin-bottom: 20px;
            }
            
            .totals-right {
                width: 35%;
                display: inline-block;
                vertical-align: top;
                text-align: right;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 14px;
            }
            
            .total-row.final {
                border-top: 2px solid #333;
                font-weight: bold;
                font-size: 16px;
                padding-top: 8px;
                margin-top: 15px;
            }
            
            /* Terms */
            .terms-section {
                padding: 20px;
                border-top: 1px solid #ddd;
                background: #f9f9f9;
            }
            
            .terms-title {
                color: #8B5CF6;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .terms-content {
                font-size: 12px;
                color: #666;
            }
            
            .terms-content ol {
                margin-left: 20px;
            }
            
            .terms-content li {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="header-left">
                    <h1>INVOICE</h1>
                    <p><strong>Invoice No #</strong> ${invoiceNumber}</p>
                    <p><strong>Invoice Date</strong> ${currentDate}</p>
                </div>
                <div class="header-right">
                    <div class="logo">
                        <span class="boost">BOOST</span><span class="my">MY</span><span class="sites">SITES</span>
                    </div>
                </div>
            </div>
            
            <!-- Billing Information -->
            <div class="billing-section">
                <div class="billing-box">
                    <div class="billing-title">Billed By</div>
                    <div class="billing-content">
                        <p><strong>TRIPLE-SEVEN BOOSTMYSITES AI SOLUTIONS LLP</strong></p>
                        <p>House No: 137, 3rd Main,3rd Cross,4th Phase, Dollars</p>
                        <p>Colony,JP Nagar,Bangalore South,</p>
                        <p>Karnataka, India - 560078</p>
                        <p><strong>GSTIN:</strong> 29AAPFV2264G1ZQ</p>
                        <p><strong>PAN:</strong> AAPFV2264G</p>
                    </div>
                </div>
                <div class="billing-box">
                    <div class="billing-title">Billed To</div>
                    <div class="billing-content">
                        <p><strong>${purchase.profiles.full_name || 'Valued Customer'}</strong></p>
                        ${purchase.customer_address ? `<p>${purchase.customer_address}</p>` : ''}
                        <p>Email: ${purchase.profiles.email}</p>
                        ${purchase.customer_gst_number ? `<p><strong>GSTIN:</strong> ${purchase.customer_gst_number}</p>` : ''}
                        ${purchase.customer_business_name ? `<p><strong>Business:</strong> ${purchase.customer_business_name}</p>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <div class="items-section">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="item-number">Item</th>
                            <th>Description</th>
                            <th>GST Rate</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Taxable Amount</th>
                            <th>CGST</th>
                            <th>SGST</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchase.purchase_items.map((item: any, index: number) => {
    const itemPrice = Number(item.item_price);
    const discountForThisItem = couponDiscount > 0 && index === 0 ? couponDiscount : 0;
    const taxableAmount = itemPrice - discountForThisItem;
    const cgst = taxableAmount * 0.09; // 9% CGST
    const sgst = taxableAmount * 0.09; // 9% SGST
    const totalWithTax = taxableAmount + cgst + sgst;

    return `
                            <tr>
                                <td class="item-number">${index + 1}.</td>
                                <td>${item.item_name}</td>
                                <td>18%</td>
                                <td>1</td>
                                <td class="amount-cell">₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td class="amount-cell">₹${taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td class="amount-cell">₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td class="amount-cell">₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td class="amount-cell">₹${totalWithTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            `;
  }).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Totals -->
            <div class="totals-section">
                <div class="totals-left">
                    <div class="amount-words">
                        <strong>Total (in words) :</strong> ${convertNumberToWords(Math.round(total))} RUPEES ONLY
                    </div>
                </div>
                <div class="totals-right">
                    <div class="total-row">
                        <span>Taxable Amount</span>
                        <span>₹${(subtotal - couponDiscount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div class="total-row">
                        <span>CGST</span>
                        <span>₹${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div class="total-row">
                        <span>SGST</span>
                        <span>₹${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total (INR)</span>
                        <span>₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
            
            <!-- Terms and Conditions -->
            <div class="terms-section">
                <div class="terms-title">Terms and Conditions</div>
                <div class="terms-content">
                    <ol>
                        <li>Amount paid to the company is not refundable.</li>
                        <li>http://boostmysites.com/terms-and-conditions/</li>
                    </ol>
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
        subject: `Receipt #${purchase.id.slice(-4).toUpperCase()}`,
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