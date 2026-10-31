import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ProductOption {
  id: string
  name: string
  price: number
}

export interface VariantOption {
  size: string
  quantity: number
}

/**
 * Fetches active products for a given category.
 * Only runs when `enabled` is true — keeps the query lazy until the card is selected.
 */
export function useProductCatalog(category: string, enabled: boolean) {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !supabase) return
    let cancelled = false
    setLoading(true)

    supabase
      .from('products')
      .select('id, name, price')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (!cancelled) {
          setProducts((data as ProductOption[]) ?? [])
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [category, enabled])

  return { products, loading }
}

/**
 * Fetches size variants for a specific product.
 * Resets to [] when productId is null (i.e. no product selected yet).
 */
export function useProductVariants(productId: string | null) {
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId || !supabase) {
      setVariants([])
      return
    }
    let cancelled = false
    setLoading(true)

    supabase
      .from('product_variants')
      .select('size, quantity')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setVariants((data as VariantOption[]) ?? [])
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [productId])

  return { variants, loading }
}
