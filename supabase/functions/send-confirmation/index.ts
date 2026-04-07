import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
// Using the newly verified domain!
const FROM_EMAIL = 'noreply@orders.snpbrand.com'
const ADMIN_EMAIL = 'Sylvesteranderson726t@gmail.com'

const ALLOWED_ORIGINS = [
  'https://snpbrand.com',
  'https://www.snpbrand.com',
  'https://snpbrand.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ''
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

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

    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.5; color: #333; }
    .box { border: 1px solid #eee; padding: 16px; border-radius: 8px; margin-bottom: 16px; background: #fff; }
    .label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
    .val { font-size: 16px; font-weight: 600; margin-top: 0; }
  </style>
</head>
<body style="background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1a1a1a; margin-top: 0;">🚀 New Order Received!</h2>
    <div class="box">
      <div class="label">Order Number</div>
      <p class="val">${orderNumber}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">
      
      <div class="label">Customer Info</div>
      <p style="margin:0 0 4px;"><strong>Name:</strong> ${customerName}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">

      <div class="label">Delivery Method</div>
      <p style="margin:0;">${deliveryMethod === 'pickup' ? `📍 Campus Pickup: ${campus}` : `📦 Home Delivery: ${address}`}</p>
    </div>

    <div class="box">
      <div class="label">Items Ordered</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        ${items.map((item: any) => `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <strong>${item.quantity}x ${item.name}</strong><br/>
              <span style="font-size:13px; color:#666;">Size: ${item.selected_size || item.selectedSize || 'N/A'}</span>
            </td>
            <td style="text-align: right; font-weight: 600; padding: 10px 0; border-bottom: 1px solid #eee;">
              GH₵ ${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        `).join('')}
      </table>
      <div style="text-align: right; font-size: 18px;">
        <span style="color: #888; font-size: 14px; margin-right: 8px;">Total Value:</span><strong style="color: #1a1a1a;">GH₵ ${total.toFixed(2)}</strong>
      </div>
    </div>
    
    <p style="font-size: 13px; color: #888; text-align: center;">View full details in the Supabase Dashboard.</p>
  </div>
</body>
</html>
    `

    const [customerRes, adminRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `SnpBrand Orders <${FROM_EMAIL}>`,
          to: [email],
          subject: `Order Confirmed — ${orderNumber}`,
          html: html
        })
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `SnpBrand System <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          subject: `🚨 NEW ORDER: ${orderNumber} - GH₵ ${total.toFixed(2)}`,
          html: adminHtml
        })
      })
    ])

    if (!customerRes.ok || !adminRes.ok) {
      const errorMsg = !customerRes.ok ? await customerRes.text() : await adminRes.text()
      throw new Error(`Resend error: ${errorMsg}`)
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