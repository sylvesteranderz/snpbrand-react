import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { Product } from '../types'

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
        console.error('Supabase error:', error)
        return []
      }
    }
    return []
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
        console.error('Supabase error:', error)
        return null
      }
    }
    return null
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
        console.error('Supabase error:', error)
        return []
      }
    }
    return []
  }

  // Add new product
  static async addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
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
        console.error('Supabase error:', error)
        return null
      }
    }
    return null
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
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
        console.error('Supabase error:', error)
        return null
      }
    }
    return null
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
        console.error('Supabase error:', error)
      }
    }
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
        console.error('Supabase error:', error)
        return []
      }
    }
    return []
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

// Wishlist Service
export class WishlistService {
  static async getWishlist(userId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('*, products (*)')
          .eq('user_id', userId)
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase wishlist error:', error)
        return []
      }
    }
    return []
  }

  static async addToWishlist(userId: string, productId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({ user_id: userId, product_id: productId })
        if (error) throw error
        return await this.getWishlist(userId)
      } catch (error) {
        console.error('Supabase add to wishlist error:', error)
        throw error
      }
    }
    return []
  }

  static async removeFromWishlist(userId: string, productId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
        if (error) throw error
        return await this.getWishlist(userId)
      } catch (error) {
        console.error('Supabase remove from wishlist error:', error)
        throw error
      }
    }
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        return !!data
      } catch (error) {
        return false
      }
    }
    return false
  }
}

// Order Service
export class OrderService {
  static async createOrder(orderData: any) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single()
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase create order error:', error)
        throw error
      }
    }
    return {}
  }

  static async getUserOrders(userId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase get user orders error:', error)
        return []
      }
    }
    return []
  }

  static async getAllOrders() {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            user_profiles (
              name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase get all orders error:', error)
        return []
      }
    }
    return []
  }

  static async updateOrderStatus(orderId: string, status: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase update order status error:', error)
        throw error
      }
    }
    return {}
  }

  static async getOrderById(orderId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        // Try to find by ID first
        let { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            user_profiles (
              name,
              email,
              phone,
              address,
              city,
              state,
              zip_code,
              country
            )
          `)
          .eq('id', orderId)
          .single()

        // If not found by ID, try order_number
        if (!data) {
           const result = await supabase
            .from('orders')
            .select(`
              *,
              user_profiles (
                name,
                email,
                phone,
                address,
                city,
                state,
                zip_code,
                country
              )
            `)
            .eq('order_number', orderId)
            .single()
           
           data = result.data
           error = result.error
        }

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase get order by id error:', error)
        return null
      }
    }
    return null
  }
}

// User Profile Service
export class UserProfileService {
  static async getAllProfiles() {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase get all profiles error:', error)
        return []
      }
    }
    return []
  }

  static async getUserProfile(userId: string) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

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
    return null
  }

  static async createUserProfile(profileData: any) {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single()

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