import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return corsError('Method not allowed', 405);
  }

  try {
    console.log('Processing slot signup submission...');
    
    const formData = await req.formData();
    
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const paymentProofFile = formData.get('paymentProof') as File;
    const signatureFile = formData.get('signature') as File;

    // Validate required fields
    if (!fullName || !email || !phone || !city) {
      return corsError('Missing required fields', 400);
    }

    console.log('Form data received:', { fullName, email, phone, city });

    let paymentProofUrl = null;
    let signatureUrl = null;

    // Upload payment proof if provided
    if (paymentProofFile && paymentProofFile.size > 0) {
      const paymentProofName = `payment-proof-${Date.now()}-${paymentProofFile.name}`;
      const paymentProofArrayBuffer = await paymentProofFile.arrayBuffer();
      
      const { data: paymentData, error: paymentError } = await supabase.storage
        .from('slot-submissions')
        .upload(paymentProofName, paymentProofArrayBuffer, {
          contentType: paymentProofFile.type,
        });

      if (paymentError) {
        console.error('Payment proof upload error:', paymentError);
        return corsError('Failed to upload payment proof', 500);
      }

      paymentProofUrl = `${supabaseUrl}/storage/v1/object/public/slot-submissions/${paymentData.path}`;
      console.log('Payment proof uploaded:', paymentProofUrl);
    }

    // Upload signature if provided
    if (signatureFile && signatureFile.size > 0) {
      const signatureName = `signature-${Date.now()}-${signatureFile.name}`;
      const signatureArrayBuffer = await signatureFile.arrayBuffer();
      
      const { data: signatureData, error: signatureError } = await supabase.storage
        .from('slot-submissions')
        .upload(signatureName, signatureArrayBuffer, {
          contentType: signatureFile.type,
        });

      if (signatureError) {
        console.error('Signature upload error:', signatureError);
        return corsError('Failed to upload signature', 500);
      }

      signatureUrl = `${supabaseUrl}/storage/v1/object/public/slot-submissions/${signatureData.path}`;
      console.log('Signature uploaded:', signatureUrl);
    }

    // Insert into database
    const { data, error } = await supabase
      .from('slot_signups')
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        city: city,
        payment_proof_url: paymentProofUrl,
        signature_url: signatureUrl,
      })
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return corsError('Failed to save signup data', 500);
    }

    console.log('Slot signup created successfully:', data[0]);

    return corsResponse({ 
      success: true, 
      message: 'Slot signup submitted successfully',
      id: data[0].id 
    });

  } catch (error) {
    console.error('Error in slot-signup-submit function:', error);
    return corsError('Internal server error', 500);
  }
};

serve(handler);