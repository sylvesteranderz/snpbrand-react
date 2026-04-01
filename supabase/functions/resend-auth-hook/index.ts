import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
        // SUPABASE_URL is automatically injected into Edge Functions by Supabase.
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? site_url
        // ensure redirect_to is encoded if it exists
        const redirectParam = redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ''

        const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}${redirectParam}`
        const confirmationUrlNew = `${supabaseUrl}/auth/v1/verify?token=${token_hash_new}&type=${email_action_type}${redirectParam}`

        let subject = 'Notification from our app'
        let html = `<p>Action: ${email_action_type}</p><p>Token: ${token}</p>`

        switch (email_action_type) {
            case 'signup':
                subject = 'Confirm your signup'
                html = `<h2>Welcome!</h2><p>Please confirm your email by clicking the link below:</p><p><a href="${confirmationUrl}">Confirm Email</a></p><p>Alternatively, enter this code manually: <strong>${token}</strong></p>`
                break
            case 'magiclink':
                subject = 'Log in with this Magic Link'
                html = `<h2>Log into your account</h2><p>Click the link below to get logged in:</p><p><a href="${confirmationUrl}">Log In</a></p><p>Alternatively, enter this code manually: <strong>${token}</strong></p>`
                break
            case 'recovery':
                subject = 'Reset Your Password'
                html = `<h2>Password Reset Request</h2><p>Click the link below to securely reset your password:</p><p><a href="${confirmationUrl}">Reset Password</a></p><p>Alternatively, enter this code manually: <strong>${token}</strong></p>`
                break
            case 'invite':
                subject = 'You have been invited'
                html = `<h2>You're invited!</h2><p>Click the link below to accept your invitation:</p><p><a href="${confirmationUrl}">Accept Invite</a></p>`
                break
            case 'email_change':
                subject = 'Confirm Email Change'
                html = `<h2>Email Change Request</h2><p>You requested an email change. Confirm it here:</p><p><a href="${confirmationUrlNew}">Confirm New Email</a></p><p>Alternatively, enter this code manually: <strong>${token_new}</strong></p>`
                break
        }

        // 2. Call Resend API
        const resendPayload: any = {
            from: 'Slippers Store Auth <orders@snpbrand.com>', // Verified domain in Resend
            to: [user.email],
            subject: subject,
        }

        if (email_action_type === 'signup') {
            resendPayload.template = {
                id: 'confirm-signup', // Specific ID provided by user
                variables: {
                    confirmationUrl: confirmationUrl,
                    token: token
                }
            }

            resendPayload.text = `Welcome! Confirm here: ${confirmationUrl}` // Fallback text
        } else {
            resendPayload.html = html
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
            console.error('RESEND API REJECTED THE EMAIL:', errorData)
            throw new Error(`Resend API error: ${errorData}`)
        }

        const data = await res.json()
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('EDGE FUNCTION CRASHED WITH:', errorMessage)
        
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
