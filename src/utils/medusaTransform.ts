import type { StoreProduct } from '@medusajs/types'
import type { Product } from '../types'

/**
 * Transform Medusa product to our app's Product interface
 */
export function transformMedusaProduct(medusaProduct: StoreProduct): Product {
  // Get the first variant's price (Medusa uses variants for pricing)
  const firstVariant = medusaProduct.variants?.[0]
  const price = firstVariant?.calculated_price?.calculated_amount || 0
  const originalPrice = firstVariant?.calculated_price?.original_amount || undefined
  
  // Extract unique sizes and colors from variants
  const sizes = new Set<string>()
  const colors = new Set<string>()
  
  medusaProduct.variants?.forEach((variant) => {
    variant.options?.forEach((option) => {
      if (option.option?.title?.toLowerCase() === 'size') {
        sizes.add(option.value || '')
      }
      if (option.option?.title?.toLowerCase() === 'color') {
        colors.add(option.value || '')
      }
    })
  })
  
  // Transform images
  const images = medusaProduct.images?.map(img => img.url) || []
  const mainImage = medusaProduct.thumbnail || images[0] || '/images/placeholder.png'
  
  // Get category (take first category if multiple)
  const category = medusaProduct.categories?.[0]?.name || 'Uncategorized'
  
  // Check if product is on sale (has original price different from current price)
  const isOnSale = !!(originalPrice && originalPrice > price)
  const discount = isOnSale && originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined
  
  return {
    id: medusaProduct.id || '',
    name: medusaProduct.title || '',
    price: price / 100, // Medusa stores prices in cents
    originalPrice: originalPrice ? originalPrice / 100 : undefined,
    image: mainImage,
    images: images,
    description: medusaProduct.description || undefined,
    category: category,
    subcategory: medusaProduct.categories?.[1]?.name,
    rating: 4.5, // Default rating since Medusa doesn't have built-in ratings
    reviews: 0, // Default reviews count
    inStock: medusaProduct.variants && medusaProduct.variants.length > 0 
      ? medusaProduct.variants.some(v => v.inventory_quantity && v.inventory_quantity > 0) 
      : true,
    isNew: false, // Could be determined by created_at date
    isOnSale: isOnSale,
    discount: discount,
    sizes: sizes.size > 0 ? Array.from(sizes) : undefined,
    colors: colors.size > 0 ? Array.from(colors) : undefined,
    tags: medusaProduct.tags?.map(tag => tag.value || '') || undefined,
  }
}

/**
 * Transform array of Medusa products
 */
export function transformMedusaProducts(medusaProducts: StoreProduct[]): Product[] {
  return medusaProducts.map(transformMedusaProduct)
}

/**
 * Get variant ID based on selected options
 */
export function findMedusaVariant(
  product: StoreProduct,
  selectedSize?: string,
  selectedColor?: string
): string | null {
  if (!product.variants || product.variants.length === 0) {
    return null
  }
  
  // If no options selected, return first variant
  if (!selectedSize && !selectedColor) {
    return product.variants[0]?.id || null
  }
  
  // Find matching variant
  const matchingVariant = product.variants.find((variant) => {
    const variantOptions = variant.options || []
    
    const sizeMatch = !selectedSize || variantOptions.some(
      (opt) => opt.option?.title?.toLowerCase() === 'size' && opt.value === selectedSize
    )
    
    const colorMatch = !selectedColor || variantOptions.some(
      (opt) => opt.option?.title?.toLowerCase() === 'color' && opt.value === selectedColor
    )
    
    return sizeMatch && colorMatch
  })
  
  return matchingVariant?.id || product.variants[0]?.id || null
}

/**
 * Get price for a specific variant
 */
export function getVariantPrice(variant: any): number {
  return (variant?.calculated_price?.calculated_amount || 0) / 100
}

