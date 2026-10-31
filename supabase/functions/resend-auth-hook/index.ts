import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const getEmailTemplate = (title: string, message: string, buttonText?: string, buttonUrl?: string, token?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          
          <!-- Banner -->
          <tr>
            <td style="background-color: #c9a84c; padding: 16px 40px; text-align: center;">
              <p style="margin: 0; color: #1a1a1a; font-weight: 600; font-size: 15px;">Secure Authentication</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1a1a1a;">${title}</h2>
              <p style="margin: 0 0 32px; color: #555; font-size: 16px; line-height: 1.6;">${message}</p>
              
              ${buttonUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display: inline-block; background-color: #1a1a1a; color: #c9a84c; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${token ? `
              <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Or enter this code manually:</p>
              <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 4px; display: inline-block;">
                ${token}
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
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

serve(async (req) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const payload = await req.json()
        const { user, email_data } = payload

        if (!user || !user.email) {
            throw new Error("Invalid payload: missing user email")
        }

        const { email_action_type, token, token_hash, redirect_to, site_url, token_new, token_hash_new } = email_data

        // We build the Auth URL mimicking Supabase's default behavior.
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? site_url
        // ensure redirect_to is encoded if it exists
        const redirectParam = redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ''

        const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}${redirectParam}`
        const confirmationUrlNew = `${supabaseUrl}/auth/v1/verify?token=${token_hash_new}&type=${email_action_type}${redirectParam}`

        let subject = 'Notification from our app'
        let html = ''

        switch (email_action_type) {
            case 'signup':
                subject = 'Confirm your signup'
                html = getEmailTemplate(
                  'Welcome to SnpBrand!', 
                  'Please confirm your email address by clicking the button below. We are excited to have you on board.', 
                  'Confirm Email', 
                  confirmationUrl, 
                  token
                )
                break
            case 'magiclink':
                subject = 'Log in with this Magic Link'
                html = getEmailTemplate(
                  'Log Into Your Account', 
                  'Click the button below to securely log into your account.', 
                  'Log In', 
                  confirmationUrl, 
                  token
                )
                break
            case 'recovery':
                subject = 'Reset Your Password'
                html = getEmailTemplate(
                  'Password Reset Request', 
                  'Click the button below to securely reset your password. If you did not request this, you can ignore this email.', 
                  'Reset Password', 
                  confirmationUrl, 
                  token
                )
                break
            case 'invite':
                subject = 'You have been invited'
                html = getEmailTemplate(
                  'You Have Been Invited!', 
                  'You have been invited to join. Click the button below to accept your invitation.', 
                  'Accept Invite', 
                  confirmationUrl
                )
                break
            case 'email_change':
                subject = 'Confirm Email Change'
                html = getEmailTemplate(
                  'Email Change Request', 
                  'You requested an email change. Please confirm your new email address by clicking the button below.', 
                  'Confirm New Email', 
                  confirmationUrlNew, 
                  token_new
                )
                break
            default:
                html = getEmailTemplate(
                  'Notification', 
                  `Action: ${email_action_type}`,
                  undefined,
                  undefined,
                  token
                )
        }

        // 2. Call Resend API
        const resendPayload: any = {
            from: 'SnpBrand Security <noreply@orders.snpbrand.com>',
            to: [user.email],
            subject: subject,
            html: html
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(resendPayload),
        })

        if (!res.ok) {
            const errorData = await res.text()
            throw new Error(`Resend API error: ${errorData}`)
        }

        const data = await res.json()
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Auth Hook Error:', errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
