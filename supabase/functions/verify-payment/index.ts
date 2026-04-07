import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const ALLOWED_ORIGINS = [
    'https://snpbrand.com',
    'https://www.snpbrand.com',
    'https://snpbrand.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
]

const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('Origin') ?? ''
    // Only echo back origins we explicitly allow — never fall back to production
    // for an unknown origin, as that would silently bypass CORS protection.
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ''
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req)

    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { reference, order_number } = await req.json()

        if (!reference || !order_number) {
            throw new Error('Reference and order_number are required')
        }

        // Verify transaction with Paystack
        const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')
        if (!paystackKey) {
            throw new Error('PAYSTACK_SECRET_KEY is not set')
        }

        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackKey}`,
            },
        })

        const paystackData = await paystackRes.json()

        if (!paystackData.status || paystackData.data.status !== 'success') {
            return new Response(
                JSON.stringify({ error: 'Payment verification failed' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Amount comes in subunits (pesewas).
        // The amount paid should be verified against the DB total if possible,
        // but here we mark it as paid if Paystack says it's a success for this reference.

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase environment variables are missing')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update order status in Supabase — query by order_number (a stable,
        // unique string) rather than the DB-generated UUID id, since guest
        // checkout does not return the UUID from the insert (RLS blocks read-back).
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_reference: reference,
            })
            .eq('order_number', order_number)

        if (updateError) {
            throw updateError
        }

        return new Response(
            JSON.stringify({ message: 'Payment verified successfully', reference }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
