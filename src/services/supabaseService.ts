import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { Product } from '../types'

// Mock data fallback
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Slippers',
    price: 89.99,
    originalPrice: 120.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'slippers',
    description: 'Luxurious leather slippers with soft lining',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    isNew: true,
    isOnSale: true,
    discount: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black', 'Tan'],
    tags: ['luxury', 'leather', 'comfortable']
  },
  {
    id: '2',
    name: 'Casual Cotton T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'apparel',
    description: 'Soft cotton t-shirt perfect for everyday wear',
    rating: 4.5,
    reviews: 89,
    inStock: true,
    isNew: false,
    isOnSale: true,
    discount: 25,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    tags: ['casual', 'cotton', 'comfortable']
  },
  {
    id: '3',
    name: 'Designer Handbag',
    price: 199.99,
    originalPrice: 250.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'accessories',
    description: 'Elegant designer handbag for special occasions',
    rating: 4.9,
    reviews: 67,
    inStock: true,
    isNew: true,
    isOnSale: false,
    discount: 0,
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Red'],
    tags: ['designer', 'elegant', 'luxury']
  }
]

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Product Service
export class ProductService {
  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching products:', error)
          throw error
        }

        return data || []
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
        return this.getLocalProducts()
      }
    } else {
      console.log('Supabase not configured, using localStorage')
      return this.getLocalProducts()
    }
  }

  // Get products from localStorage
  private static getLocalProducts(): Product[] {
    const savedProducts = localStorage.getItem('snpbrand-products')
    if (savedProducts) {
      try {
        return JSON.parse(savedProducts)
      } catch (error) {
        console.error('Error parsing saved products:', error)
      }
    }
    return mockProducts
  }

  // Save products to localStorage
  private static saveLocalProducts(products: Product[]): void {
    localStorage.setItem('snpbrand-products', JSON.stringify(products))
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching product:', error)
          return null
        }

        return data
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    return products.find(product => product.id === id) || null
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching products by category:', error)
          throw error
        }

        return data || []
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    return products.filter(product => product.category === category)
  }

  // Add new product
  static async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single()

        if (error) {
          console.error('Error adding product:', error)
          throw error
        }

        return data
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      rating: productData.rating || 0,
      reviews: productData.reviews || 0,
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      isNew: productData.isNew || false,
      isOnSale: productData.isOnSale || false,
      discount: productData.discount || 0,
      sizes: productData.sizes || ['One Size'],
      colors: productData.colors || ['Default'],
      tags: productData.tags || []
    }
    
    products.unshift(newProduct)
    this.saveLocalProducts(products)
    return newProduct
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating product:', error)
          throw error
        }

        return data
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    const index = products.findIndex(product => product.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      this.saveLocalProducts(products)
      return products[index]
    }
    throw new Error('Product not found')
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting product:', error)
          throw error
        }
        return
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    const filteredProducts = products.filter(product => product.id !== id)
    this.saveLocalProducts(filteredProducts)
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error searching products:', error)
          throw error
        }

        return data || []
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
      }
    }
    
    const products = this.getLocalProducts()
    const queryLower = query.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(queryLower) ||
      product.description?.toLowerCase().includes(queryLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    )
  }
}

// Cart Service
export class CartService {
  static async getCart(userId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            products (*)
          `)
          .eq('user_id', userId)

        if (error) {
          console.error('Error fetching cart:', error)
          throw error
        }

        return data || []
      } catch (error) {
        console.error('Supabase cart error:', error)
        throw error
      }
    }
    return []
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1) {
    if (isSupabaseEnabled && supabase) {
      try {
        // Check if item already exists
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single()

        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)

          if (error) throw error
        } else {
          // Add new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: productId,
              quantity
            })

          if (error) throw error
        }

        return await this.getCart(userId)
      } catch (error) {
        console.error('Supabase add to cart error:', error)
        throw error
      }
    }
    return []
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    if (isSupabaseEnabled && supabase) {
      try {
        if (quantity <= 0) {
          await this.removeFromCart(userId, productId)
          return await this.getCart(userId)
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) throw error

        return await this.getCart(userId)
      } catch (error) {
        console.error('Supabase update cart quantity error:', error)
        throw error
      }
    }
    return []
  }

  static async removeFromCart(userId: string, productId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) throw error
      } catch (error) {
        console.error('Supabase remove from cart error:', error)
        throw error
      }
    }
  }

  static async clearCart(userId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
      } catch (error) {
        console.error('Supabase clear cart error:', error)
        throw error
      }
    }
  }
}

export class WishlistService {
  static async getWishlist(_userId: string) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return []
    }
    return []
  }

  static async addToWishlist(_userId: string, _productId: string) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return []
    }
    return []
  }

  static async removeFromWishlist(_userId: string, _productId: string) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
    }
  }

  static async isInWishlist(_userId: string, _productId: string): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return false
    }
    return false
  }
}

export class OrderService {
  static async createOrder(_orderData: any) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return {}
    }
    return {}
  }

  static async getUserOrders(_userId: string) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return []
    }
    return []
  }

  static async getAllOrders() {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return []
    }
    return []
  }

  static async updateOrderStatus(_orderId: string, _status: string) {
    if (isSupabaseEnabled && supabase) {
      // Supabase implementation would go here
      return {}
    }
    return {}
  }
}

export class UserProfileService {
  static async getUserProfile(userId: string) {
    console.log('UserProfileService.getUserProfile called with:', userId)
    console.log('isSupabaseEnabled:', isSupabaseEnabled, 'supabase:', !!supabase)
    
    if (isSupabaseEnabled && supabase) {
      try {
        console.log('Attempting to fetch user profile from Supabase...')
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        console.log('Supabase response - data:', data, 'error:', error)

        if (error) {
          console.error('Error fetching user profile:', error)
          return null
        }

        return data
      } catch (error) {
        console.error('Supabase user profile error:', error)
        return null
      }
    }
    console.log('Supabase not enabled or not available')
    return null
  }

  static async createUserProfile(profileData: any) {
    console.log('UserProfileService.createUserProfile called with:', profileData)
    if (isSupabaseEnabled && supabase) {
      try {
        console.log('Attempting to create user profile in Supabase...')
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single()

        console.log('Supabase create response - data:', data, 'error:', error)

        if (error) {
          console.error('Error creating user profile:', error)
          throw error
        }

        return data
      } catch (error) {
        console.error('Supabase create user profile error:', error)
        throw error
      }
    }
    console.log('Supabase not enabled, returning profile data as-is')
    return profileData
  }

  static async updateUserProfile(userId: string, updates: any) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single()

        if (error) {
          console.error('Error updating user profile:', error)
          throw error
        }

        return data
      } catch (error) {
        console.error('Supabase update user profile error:', error)
        throw error
      }
    }
    return { id: userId, ...updates }
  }
}