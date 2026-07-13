import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"


// ---------------------------------------------------------------------------
// Background handler — runs after 200 is returned to Paystack
// ---------------------------------------------------------------------------
async function handleChargeSuccess(order_number: string, reference: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[webhook] Supabase env vars missing — cannot process charge.success')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Mark order as paid and fetch full record in one round-trip
  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', payment_reference: reference })
    .eq('order_number', order_number)
    .select('*')
    .single()

  if (updateError) {
    console.error(`[webhook] Failed to update order ${order_number}:`, updateError.message)
    return
  }

  console.log(`[webhook] Order ${order_number} marked as paid`)

  // Log transactions to ensure stock is decremented and finance records created
  if (order?.id) {
    const today = new Date().toISOString().slice(0, 10)

    // 1. Log the sale into financial_transactions
    const { error: finErr } = await supabase
      .from('financial_transactions')
      .insert({
        type:         'sale',
        amount:       order.total_amount,
        description:  `Order #${order_number}`,
        reference_id: order.id,
        date:         today,
      })
    if (finErr) {
      console.error('[webhook] financial_transactions insert failed:', finErr.message)
    }

    // 2. Log each line item into inventory_transactions with size
    const items: any[] = Array.isArray(order.items) ? order.items : []
    if (items.length > 0) {
      const invRows = items.map((item: any) => ({
        product_id: item.product_id,
        type:       'sale',
        size:       item.selected_size || item.selectedSize || 'unknown',
        quantity:   -(item.quantity ?? 1),
        unit_cost:  null,
        note:       `Order #${order_number}`,
        created_at: new Date().toISOString(),
      }))
      const { error: invErr } = await supabase
        .from('inventory_transactions')
        .insert(invRows)
      if (invErr) {
        console.error('[webhook] inventory_transactions insert failed:', invErr.message)
      }
    }
  }

  // Build confirmation email payload from stored order data
  const customerInfo = order.customer_info || {}
  const email = customerInfo.email
  if (!email) {
    console.error(`[webhook] No email on order ${order_number} — skipping confirmation`)
    return
  }

  const customerName =
    customerInfo.Name ||
    `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() ||
    'Customer'

  const estimatedDelivery = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    return d.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  })()

  const emailPayload = {
    orderNumber: order.order_number,
    customerName,
    email,
    items: order.items || [],
    total: order.total_amount,
    deliveryMethod: customerInfo.deliveryMethod,
    address: customerInfo.deliveryMethod === 'delivery'
      ? `${customerInfo.address || ''}, ${customerInfo.city || ''}`.replace(/^,\s*|,\s*$/, '').trim()
      : null,
    campus: customerInfo.deliveryMethod === 'pickup' ? customerInfo.campus : null,
    estimatedDelivery,
  }

  const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
    body: JSON.stringify(emailPayload),
  })

  if (!emailRes.ok) {
    console.error(`[webhook] Confirmation email failed for ${order_number}:`, await emailRes.text())
  } else {
    console.log(`[webhook] Confirmation email sent for order ${order_number}`)
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
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

    // Verify HMAC-SHA512 signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(paystackKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign", "verify"]
    )
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    )
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignatureHex) {
      return new Response('Invalid signature', { status: 401 })
    }

    const body = JSON.parse(rawBody)

    if (body.event === 'charge.success') {
      const data = body.data
      const reference = data.reference
      const custom_fields = data.metadata?.custom_fields || []
      const orderNumberField = custom_fields.find((f: any) => f.variable_name === 'order_number')
      const order_number = orderNumberField?.value ?? null

      if (order_number) {
        // Schedule background work — respond to Paystack immediately
        EdgeRuntime.waitUntil(handleChargeSuccess(order_number, reference))
      } else {
        console.warn('[webhook] charge.success received but no order_number in metadata')
      }
    }

    // Return 200 fast so Paystack does not retry
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error(`[webhook] Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
