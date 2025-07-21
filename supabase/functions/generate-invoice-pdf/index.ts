import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoicePDFRequest {
    purchase_id: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
        const { purchase_id }: InvoicePDFRequest = await req.json()

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

        // Generate PDF using HTML to PDF service (like Puppeteer via API)
        // For this example, we'll return a simple PDF-like response
        // In production, you'd use a service like Puppeteer, jsPDF, or a PDF API

        const pdfData = await generateInvoicePDF(purchase, subtotal, gstAmount, total)

        return new Response(pdfData, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${purchase.id.slice(-8).toUpperCase()}.pdf"`
            }
        })

    } catch (error) {
        console.error('Error in generate-invoice-pdf function:', error)
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

async function generateInvoicePDF(purchase: any, subtotal: number, gstAmount: number, total: number): Promise<Uint8Array> {
    // For this demo, I'll create a simple text-based PDF
    // In production, you'd use a proper PDF library or service

    const orderDate = new Date(purchase.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    // Simple PDF content (in a real implementation, use jsPDF or similar)
    const pdfContent = `
INVOICE - BoostMySites
AI-Powered Digital Services

Invoice #: ${purchase.id.slice(-8).toUpperCase()}
Date: ${orderDate}
Customer: ${purchase.profiles.full_name || 'Valued Customer'}
Email: ${purchase.profiles.email}

ITEMS:
${purchase.purchase_items.map((item: any) =>
        `${item.item_name} - ₹${Number(item.item_price).toFixed(2)}`
    ).join('\n')}

TOTALS:
Subtotal: ₹${subtotal.toFixed(2)}
GST (18%): ₹${gstAmount.toFixed(2)}
TOTAL: ₹${total.toFixed(2)}

Payment Status: COMPLETED
Payment Method: ${purchase.payment_method || 'Razorpay'}

Thank you for choosing BoostMySites!
support@boostmysites.com | +91 XXX XXX XXXX
  `

    // Convert text to bytes (in real implementation, generate actual PDF)
    return new TextEncoder().encode(pdfContent)
}

// TODO: Replace with actual PDF generation
// Example using a PDF API service:
/*
async function generateInvoicePDF(purchase: any, subtotal: number, gstAmount: number, total: number): Promise<Uint8Array> {
  const htmlContent = generateInvoiceHTML(purchase, subtotal, gstAmount, total) // reuse from email function
  
  // Use a service like HTMLPDFClient or Puppeteer
  const pdfResponse = await fetch('https://api.html-pdf-service.com/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: htmlContent })
  })
  
  const pdfBuffer = await pdfResponse.arrayBuffer()
  return new Uint8Array(pdfBuffer)
}
*/ 