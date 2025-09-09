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
    console.log('Generating signed URL for slot signup file...');
    
    const { filePath, fileName } = await req.json();
    
    if (!filePath) {
      return corsError('File path is required', 400);
    }

    console.log('Requested file path:', filePath);

    // Generate a signed URL for the file (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('slot-submissions')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return corsError('Failed to generate file URL', 500);
    }

    if (!data?.signedUrl) {
      return corsError('Failed to generate signed URL', 500);
    }

    console.log('Signed URL generated successfully');

    return corsResponse({ 
      signedUrl: data.signedUrl,
      expiresIn: 3600
    });

  } catch (error) {
    console.error('Error in slot-signup-file-url function:', error);
    return corsError('Internal server error', 500);
  }
};

serve(handler);