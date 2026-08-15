import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const validationError = (error: string, message: string, context?: Record<string, unknown>) => {
  console.warn('[validate-discount] rejected', JSON.stringify({ error, ...context }))
  return json({ valid: false, error, message })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Extract caller identity from the verified JWT — never trust user_id from the body
    const authHeader = req.headers.get('authorization') ?? ''
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { authorization: authHeader } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    const verified_user_id = user?.id ?? null
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const rateKey = verified_user_id ?? ip

    // Rate limiting: max 10 validation attempts per minute per user/IP
    const rateWindow = new Date(Date.now() - 60_000).toISOString()
    const { count: recentAttempts } = await supabaseAdmin
      .from('discount_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('rate_key', rateKey)
      .gte('attempted_at', rateWindow)

    if ((recentAttempts ?? 0) >= 10) {
      console.warn('[validate-discount] rate limited', JSON.stringify({ rate_key: rateKey }))
      return json({ valid: false, error: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' }, 429)
    }

    // Record this attempt (non-blocking — don't let a logging failure block the user)
    supabaseAdmin.from('discount_rate_limits').insert({
      rate_key: rateKey,
      user_id: verified_user_id,
      attempted_at: new Date().toISOString(),
    }).then(() => {})

    const { code, cart_total } = await req.json()

    if (!code || !cart_total) {
      return json({ valid: false, error: 'MISSING_PARAMS', message: 'Code and cart total are required.' }, 400)
    }

    const { data: dc, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', (code as string).toUpperCase().trim())
      .single()

    if (error || !dc) return validationError('INVALID_CODE', 'This discount code does not exist.', { code, user_id: verified_user_id })
    if (!dc.is_active) return validationError('INACTIVE_CODE', 'This discount code is no longer active.', { code, user_id: verified_user_id })
    if (dc.expires_at && new Date(dc.expires_at) < new Date()) return validationError('EXPIRED_CODE', 'This discount code has expired.', { code, user_id: verified_user_id })
    if (dc.max_uses !== null && dc.uses_count >= dc.max_uses) return validationError('MAX_USES_REACHED', 'This discount code has reached its maximum uses.', { code })
    if (cart_total < dc.min_order_value) return validationError('MIN_ORDER_NOT_MET', `Minimum order of GH₵${dc.min_order_value.toFixed(2)} required to use this code.`, { code, cart_total, min_order_value: dc.min_order_value })

    // Check per-user limit using the verified identity from JWT, never the body
    if (verified_user_id) {
      const { count } = await supabaseAdmin
        .from('discount_uses')
        .select('id', { count: 'exact', head: true })
        .eq('code_id', dc.id)
        .eq('user_id', verified_user_id)

      if ((count ?? 0) >= dc.per_user_limit) {
        return validationError('USER_LIMIT_REACHED', 'You have already used this discount code.', { code, user_id: verified_user_id })
      }
    }

    // Calculate discount amount server-side
    let discount_amount = 0
    if (dc.type === 'percentage') {
      discount_amount = parseFloat(((cart_total * dc.value) / 100).toFixed(2))
    } else {
      discount_amount = Math.min(dc.value, cart_total)
    }

    return json({
      valid: true,
      code_id: dc.id,
      discount_amount,
      min_order_value: dc.min_order_value,
      type: dc.type,
      value: dc.value,
      message: dc.type === 'percentage' ? `${dc.value}% off applied!` : `GH₵${dc.value.toFixed(2)} off applied!`,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    console.error('[validate-discount] error:', message)
    return json({ valid: false, error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }, 500)
  }
})
