import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'SnpBrand <noreply@orders.snpbrand.com>'
const SHOP_URL = 'https://snpbrand.com/shop'

const getWelcomeEmailHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SnpBrand</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 36px 40px; text-align: center;">
              <h1 style="margin: 0; color: #c9a84c; font-size: 30px; font-weight: 700; letter-spacing: 3px;">SNP BRAND</h1>
              <p style="margin: 8px 0 0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Footwear</p>
            </td>
          </tr>

          <!-- Gold Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #c9a84c, #e8c96a, #c9a84c); padding: 14px 40px; text-align: center;">
              <p style="margin: 0; color: #1a1a1a; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Welcome to the Family 🎉</p>
            </td>
          </tr>

          <!-- Hero Body -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background-color: #ffffff;">
              <h2 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #1a1a1a;">
                Hey ${name.split(' ')[0]}, welcome aboard!
              </h2>
              <p style="margin: 0 0 12px; color: #555; font-size: 16px; line-height: 1.7;">
                Your SnpBrand account is now set up and ready to go.
              </p>
              <p style="margin: 0 0 36px; color: #555; font-size: 16px; line-height: 1.7;">
                We craft premium footwear that combines bold style with everyday comfort — 
                and we're thrilled to have you with us. Browse our latest collection below.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                <tr>
                  <td align="center">
                    <a href="${SHOP_URL}"
                       style="display: inline-block; background-color: #1a1a1a; color: #c9a84c; text-decoration: none;
                              padding: 16px 44px; border-radius: 8px; font-weight: 700; font-size: 15px;
                              letter-spacing: 1px; text-transform: uppercase;">
                      Shop the Collection
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Feature Row -->
          <tr>
            <td style="background-color: #fafafa; padding: 32px 40px; border-top: 1px solid #eee;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align: center; padding: 0 12px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">👟</div>
                    <div style="font-weight: 600; color: #1a1a1a; font-size: 13px; margin-bottom: 4px;">Premium Quality</div>
                    <div style="color: #888; font-size: 12px; line-height: 1.5;">Handpicked materials for lasting comfort</div>
                  </td>
                  <td width="33%" style="text-align: center; padding: 0 12px; border-left: 1px solid #eee; border-right: 1px solid #eee;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🚀</div>
                    <div style="font-weight: 600; color: #1a1a1a; font-size: 13px; margin-bottom: 4px;">Fast Shipping</div>
                    <div style="color: #888; font-size: 12px; line-height: 1.5;">Delivered to your door with care</div>
                  </td>
                  <td width="33%" style="text-align: center; padding: 0 12px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🔒</div>
                    <div style="font-weight: 600; color: #1a1a1a; font-size: 13px; margin-bottom: 4px;">Secure Checkout</div>
                    <div style="color: #888; font-size: 12px; line-height: 1.5;">Safe & easy payments, always</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: #c9a84c; font-size: 16px; font-weight: 600; letter-spacing: 2px;">SNP BRAND</p>
              <p style="margin: 0 0 12px; color: #666; font-size: 12px;">© ${new Date().getFullYear()} SnpBrand. All rights reserved.</p>
              <p style="margin: 0; color: #555; font-size: 11px;">
                You received this email because you created an account at snpbrand.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
    })
  }

  try {
    const { email, name } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const displayName = name || email.split('@')[0] || 'there'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Welcome to SnpBrand, ${displayName.split(' ')[0]}! 👟`,
        html: getWelcomeEmailHtml(displayName),
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(`Resend API error: ${errorData}`)
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-welcome error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
