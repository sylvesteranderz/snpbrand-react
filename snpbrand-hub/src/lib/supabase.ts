import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. ' +
    'Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in snpbrand-hub/.env'
  );
}

// Fallback to placeholder values if env variables are not set yet to prevent runtime crash during initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Disable navigator.locks to prevent AbortError from auth lock contention.
      // Essential for React mobile environments and prevents concurrent token refresh issues.
      lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
    }
  }
)
