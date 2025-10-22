import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// If Supabase is not configured, use mock mode
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl !== 'undefined' &&
  supabaseAnonKey !== 'undefined'

// Create Supabase client (will be null if not configured)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Force demo mode for development - set to false to enable Supabase
const FORCE_DEMO_MODE = false

// Export configuration status
export const isSupabaseEnabled = isSupabaseConfigured && !FORCE_DEMO_MODE

// Debug logging
console.log('Supabase Configuration:', {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
  isSupabaseEnabled,
  FORCE_DEMO_MODE
})

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          price: number
          original_price?: number
          description?: string
          category: string
          image_url: string
          rating: number
          reviews: number
          in_stock: boolean
          is_new: boolean
          is_on_sale: boolean
          discount: number
          sizes: string[]
          colors: string[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          original_price?: number
          description?: string
          category: string
          image_url: string
          rating?: number
          reviews?: number
          in_stock?: boolean
          is_new?: boolean
          is_on_sale?: boolean
          discount?: number
          sizes?: string[]
          colors?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          original_price?: number
          description?: string
          category?: string
          image_url?: string
          rating?: number
          reviews?: number
          in_stock?: boolean
          is_new?: boolean
          is_on_sale?: boolean
          discount?: number
          sizes?: string[]
          colors?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          role: 'customer' | 'admin'
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string
          role?: 'customer' | 'admin'
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'customer' | 'admin'
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          total_amount: number
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: 'paystack' | 'pay_on_delivery'
          shipping_address: any
          items: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          total_amount: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: 'paystack' | 'pay_on_delivery'
          shipping_address: any
          items: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method?: 'paystack' | 'pay_on_delivery'
          shipping_address?: any
          items?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
    }
  }
}

// Type-safe Supabase client
export type SupabaseClient = typeof supabase