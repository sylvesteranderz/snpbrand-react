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

        // Map database fields to React Product type
        const mappedProducts: Product[] = (data || []).map((dbProduct: any) => ({
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
          originalPrice: dbProduct.original_price,
          description: dbProduct.description,
          category: dbProduct.category,
          image: dbProduct.image_url,
          rating: dbProduct.rating,
          reviews: dbProduct.reviews,
          inStock: dbProduct.in_stock,
          isNew: dbProduct.is_new,
          isOnSale: dbProduct.is_on_sale,
          discount: dbProduct.discount,
          sizes: dbProduct.sizes || [],
          colors: dbProduct.colors || [],
          tags: dbProduct.tags || []
        }))

        return mappedProducts
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

        // Map database fields to React Product type
        const mappedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          originalPrice: data.original_price,
          description: data.description,
          category: data.category,
          image: data.image_url,
          rating: data.rating,
          reviews: data.reviews,
          inStock: data.in_stock,
          isNew: data.is_new,
          isOnSale: data.is_on_sale,
          discount: data.discount,
          sizes: data.sizes || [],
          colors: data.colors || [],
          tags: data.tags || []
        }

        return mappedProduct
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

        // Map database fields to React Product type
        const mappedProducts: Product[] = (data || []).map((dbProduct: any) => ({
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
          originalPrice: dbProduct.original_price,
          description: dbProduct.description,
          category: dbProduct.category,
          image: dbProduct.image_url,
          rating: dbProduct.rating,
          reviews: dbProduct.reviews,
          inStock: dbProduct.in_stock,
          isNew: dbProduct.is_new,
          isOnSale: dbProduct.is_on_sale,
          discount: dbProduct.discount,
          sizes: dbProduct.sizes || [],
          colors: dbProduct.colors || [],
          tags: dbProduct.tags || []
        }))

        return mappedProducts
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
        // Map React Product fields to database fields
        const dbProductData = {
          name: productData.name,
          price: productData.price,
          original_price: productData.originalPrice,
          description: productData.description,
          category: productData.category,
          image_url: productData.image,
          rating: productData.rating || 0,
          reviews: productData.reviews || 0,
          in_stock: productData.inStock !== undefined ? productData.inStock : true,
          is_new: productData.isNew || false,
          is_on_sale: productData.isOnSale || false,
          discount: productData.discount || 0,
          sizes: productData.sizes || [],
          colors: productData.colors || [],
          tags: productData.tags || []
        }

        const { data, error } = await supabase
          .from('products')
          .insert([dbProductData])
          .select()
          .single()

        if (error) {
          console.error('Error adding product:', error)
          throw error
        }

        // Map database response back to React Product type
        const mappedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          originalPrice: data.original_price,
          description: data.description,
          category: data.category,
          image: data.image_url,
          rating: data.rating,
          reviews: data.reviews,
          inStock: data.in_stock,
          isNew: data.is_new,
          isOnSale: data.is_on_sale,
          discount: data.discount,
          sizes: data.sizes || [],
          colors: data.colors || [],
          tags: data.tags || []
        }

        return mappedProduct
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
        // Map React Product fields to database fields
        const dbUpdates: any = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.price !== undefined) dbUpdates.price = updates.price
        if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.image !== undefined) dbUpdates.image_url = updates.image
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating
        if (updates.reviews !== undefined) dbUpdates.reviews = updates.reviews
        if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock
        if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew
        if (updates.isOnSale !== undefined) dbUpdates.is_on_sale = updates.isOnSale
        if (updates.discount !== undefined) dbUpdates.discount = updates.discount
        if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
        if (updates.colors !== undefined) dbUpdates.colors = updates.colors
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags

        const { data, error } = await supabase
          .from('products')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating product:', error)
          throw error
        }

        // Map database response back to React Product type
        const mappedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          originalPrice: data.original_price,
          description: data.description,
          category: data.category,
          image: data.image_url,
          rating: data.rating,
          reviews: data.reviews,
          inStock: data.in_stock,
          isNew: data.is_new,
          isOnSale: data.is_on_sale,
          discount: data.discount,
          sizes: data.sizes || [],
          colors: data.colors || [],
          tags: data.tags || []
        }

        return mappedProduct
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

        // Map database fields to React Product type
        const mappedProducts: Product[] = (data || []).map((dbProduct: any) => ({
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
          originalPrice: dbProduct.original_price,
          description: dbProduct.description,
          category: dbProduct.category,
          image: dbProduct.image_url,
          rating: dbProduct.rating,
          reviews: dbProduct.reviews,
          inStock: dbProduct.in_stock,
          isNew: dbProduct.is_new,
          isOnSale: dbProduct.is_on_sale,
          discount: dbProduct.discount,
          sizes: dbProduct.sizes || [],
          colors: dbProduct.colors || [],
          tags: dbProduct.tags || []
        }))

        return mappedProducts
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
      // Fetch cart items for the user from Supabase
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return data
    }
    return []
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1) {
    if (isSupabaseEnabled && supabase) {
      // Upsert (insert or update) cart item for the user
      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          [{ user_id: userId, product_id: productId, quantity }],
          { onConflict: 'user_id,product_id' }
        )
      if (error) throw error
      return data
    }
    return []
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)
      if (error) throw error
      return data
    }
    return []
  }

  static async removeFromCart(userId: string, productId: string) {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      if (error) throw error
    }
  }

  static async clearCart(userId: string) {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
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