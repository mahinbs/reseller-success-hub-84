export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

export function corsResponse(data: any, status: number = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    )
}

export function corsError(error: string, status: number = 500) {
    return new Response(
        JSON.stringify({ error }),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    )
} 