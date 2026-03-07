import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";

serve(async (req) => {
    try {
        const rawBody = await req.text()
        const signature = req.headers.get('x-paystack-signature')

        if (!signature) {
            return new Response('No signature header', { status: 401 })
        }

        const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')
        if (!paystackKey) {
            throw new Error('PAYSTACK_SECRET_KEY is not set')
        }

        // Verify Paystack Signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(paystackKey),
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["sign", "verify"]
        );
        const expectedSignatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(rawBody)
        );
        const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        if (signature !== expectedSignatureHex) {
            return new Response('Invalid signature', { status: 401 })
        }

        const body = JSON.parse(rawBody)

        // Handle charge.success event
        if (body.event === 'charge.success') {
            const data = body.data
            const reference = data.reference

            // Look for order_number in metadata
            const custom_fields = data.metadata?.custom_fields || []
            const orderNumberField = custom_fields.find((f: any) => f.variable_name === 'order_number')
            const order_number = orderNumberField ? orderNumberField.value : null

            if (order_number) {
                // Initialize Supabase Client
                const supabaseUrl = Deno.env.get('SUPABASE_URL')
                const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

                if (supabaseUrl && supabaseServiceKey) {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey)

                    // Update DB record
                    await supabase
                        .from('orders')
                        .update({
                            payment_status: 'paid',
                            payment_reference: reference,
                        })
                        .eq('order_number', order_number)

                    console.log(`Order ${order_number} marked as paid successfully via webhook`)
                } else {
                    console.error("Supabase config missing for webhook")
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (err) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
