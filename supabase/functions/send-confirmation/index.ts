import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
// Using the newly verified domain!
const FROM_EMAIL = 'noreply@orders.snpbrand.com'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS just in case
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // A Supabase Database Webhook payload looks like: { type, table, record, old_record, schema }
    // A direct frontend invocation via supabase.functions.invoke sends a flat payload
    const payload = await req.json()
    
    let orderNumber, email, customerName, items, total, deliveryMethod, address, campus, estimatedDelivery

    // If payload contains 'record', it was invoked by a database trigger (Webhook)
    if (payload.record) {
      const record = payload.record
      orderNumber = record.order_number
      email = record.customer_info?.email
      customerName = record.customer_info?.Name || `${record.customer_info?.firstName || ''} ${record.customer_info?.lastName || ''}`.trim()
      items = record.items || []
      total = record.total_amount || 0
      deliveryMethod = record.customer_info?.deliveryMethod
      address = record.customer_info?.address || ''
      campus = record.customer_info?.campus
      estimatedDelivery = record.customer_info?.estimatedDelivery || '3-5 business days'
    } else {
      // It was invoked manually from the React Frontend
      ({ orderNumber, customerName, email, items, total, deliveryMethod, address, campus, estimatedDelivery } = payload)
    }

    if (!email) {
      console.error('No email found in order record structure')
      return new Response(JSON.stringify({ error: 'No email found' }), { status: 400 })
    }

    // Notice we check both selected_size (DB snapshot standard) and selectedSize
    const itemsHTML = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 500; color: #1a1a1a;">${item.name}</div>
          <div style="font-size: 13px; color: #888; margin-top: 2px;">
            Size: ${item.selected_size || item.selectedSize || 'N/A'} &nbsp;|&nbsp; Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #1a1a1a;">
          GH₵ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('')

    const deliveryHTML = deliveryMethod === 'pickup'
      ? `<p style="margin: 4px 0; color: #555;">📍 Campus Pickup: <strong>${campus === 'knust' ? 'KNUST Campus, Kumasi — Jubilee Mall' : 'University of Ghana, Legon — Main Gate'}</strong></p>`
      : `<p style="margin: 4px 0; color: #555;">📦 Delivery to: <strong>${address}</strong></p>`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation — SnpBrand</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #c9a84c; font-size: 28px; font-weight: 700; letter-spacing: 2px;">SNP BRAND</h1>
              <p style="margin: 8px 0 0; color: #888; font-size: 13px; letter-spacing: 1px;">PREMIUM FOOTWEAR</p>
            </td>
          </tr>

          <!-- Order confirmed banner -->
          <tr>
            <td style="background-color: #c9a84c; padding: 16px 40px; text-align: center;">
              <p style="margin: 0; color: #1a1a1a; font-weight: 600; font-size: 15px;">✓ &nbsp; Order Confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #1a1a1a;">Hi ${customerName},</p>
              <p style="margin: 0 0 32px; color: #555; font-size: 15px; line-height: 1.6;">
                Thank you for your order! We've received it and will begin processing right away.
                You'll hear from us when your order is on its way.
              </p>

              <!-- Order meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 6px 20px;">
                    <p style="margin: 4px 0; color: #888; font-size: 13px;">ORDER NUMBER</p>
                    <p style="margin: 4px 0; color: #1a1a1a; font-size: 18px; font-weight: 700; letter-spacing: 1px;">${orderNumber}</p>
                  </td>
                  <td style="padding: 6px 20px; border-left: 1px solid #eee;">
                    <p style="margin: 4px 0; color: #888; font-size: 13px;">ESTIMATED DELIVERY</p>
                    <p style="margin: 4px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${estimatedDelivery}</p>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHTML}
                <tr>
                  <td style="padding: 16px 0 4px; font-size: 16px; font-weight: 700; color: #1a1a1a;">Total Paid</td>
                  <td style="padding: 16px 0 4px; text-align: right; font-size: 18px; font-weight: 700; color: #c9a84c;">GH₵ ${total.toFixed(2)}</td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 32px 0;">

              <!-- Delivery info -->
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Delivery Details</p>
              ${deliveryHTML}
              <p style="margin: 8px 0 0; color: #555; font-size: 14px;">
                We'll send you an update when your order is on its way.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 32px 0;">

              <!-- Track order CTA (Commented out for now)
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://snpbrand.com/order-tracking/${orderNumber}"
                       style="display: inline-block; background-color: #1a1a1a; color: #c9a84c; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
              -->

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #888; font-size: 13px;">Questions? Reply to this email or contact us on WhatsApp.</p>
              <p style="margin: 0; color: #bbb; font-size: 12px;">© 2025 SnpBrand. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `SnpBrand Orders <${FROM_EMAIL}>`,
        to: [email],
        subject: `Order Confirmed — ${orderNumber}`,
        html
      })
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend error: ${error}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Email send failed:', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})