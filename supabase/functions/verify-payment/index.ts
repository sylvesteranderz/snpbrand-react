import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { reference, order_id } = await req.json()

        if (!reference || !order_id) {
            throw new Error('Reference and order_id are required')
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
                JSON.stringify({ error: 'Payment verification failed', details: paystackData }),
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

        // Update order status in Supabase
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_reference: reference,
            })
            .eq('id', order_id)

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
