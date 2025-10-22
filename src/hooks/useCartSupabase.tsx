import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product } from '../types'
import { CartService } from '../services/supabaseService'
import { useAuth } from './useAuthSupabase'

interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartState {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  isLoading: boolean
  error: string | null
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  const calculateTotals = (items: CartItem[]) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    return { itemCount, totalPrice }
  }

  switch (action.type) {
    case 'SET_CART':
      const totals = calculateTotals(action.payload)
      return {
        ...state,
        items: action.payload,
        ...totals,
        isLoading: false,
        error: null
      }
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload]
      const newTotals = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        ...newTotals,
        isLoading: false,
        error: null
      }
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.productId || item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
      const updatedTotals = calculateTotals(updatedItems)
      return {
        ...state,
        items: updatedItems,
        ...updatedTotals,
        isLoading: false,
        error: null
      }
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload && item.product.id !== action.payload)
      const filteredTotals = calculateTotals(filteredItems)
      return {
        ...state,
        items: filteredItems,
        ...filteredTotals,
        isLoading: false,
        error: null
      }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemCount: 0,
        totalPrice: 0,
        isLoading: false,
        error: null
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    default:
      return state
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    totalPrice: 0,
    isLoading: false,
    error: null
  })

  // Load cart when user logs in or on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart()
    } else {
      // Load from localStorage for non-authenticated users
      loadLocalCart()
    }
  }, [isAuthenticated, user])

  // Load cart from localStorage
  const loadLocalCart = () => {
    try {
      const savedCart = localStorage.getItem('snpbrand-cart')
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart)
        dispatch({ type: 'SET_CART', payload: cartItems })
      }
    } catch (error) {
      console.error('Error loading local cart:', error)
    }
  }

  // Save cart to localStorage
  const saveLocalCart = (items: CartItem[]) => {
    try {
      localStorage.setItem('snpbrand-cart', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving local cart:', error)
    }
  }

  // Load cart from Supabase or localStorage
  const loadCart = async () => {
    if (!user) {
      loadLocalCart()
      return
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cartData = await CartService.getCart(user.id)
      
      const cartItems: CartItem[] = cartData.map((item: any) => ({
        id: item.id,
        product: item.products || item.product,
        quantity: item.quantity
      }))

      dispatch({ type: 'SET_CART', payload: cartItems })
    } catch (error) {
      console.error('Error loading cart:', error)
      // Fallback to localStorage
      loadLocalCart()
    }
  }

  // Add item to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (user) {
        // Try Supabase first
        try {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity
            await CartService.updateCartItemQuantity(user.id, product.id, newQuantity)
            dispatch({ type: 'UPDATE_ITEM', payload: { productId: existingItem.id, quantity: newQuantity } })
          } else {
            await CartService.addToCart(user.id, product.id, quantity)
            const newItem: CartItem = {
              id: `${user.id}-${product.id}`,
              product,
              quantity
            }
            dispatch({ type: 'ADD_ITEM', payload: newItem })
          }
        } catch (error) {
          console.error('Supabase cart error, falling back to localStorage:', error)
          // Fallback to localStorage
          addToLocalCart(product, quantity)
        }
      } else {
        // Use localStorage
        addToLocalCart(product, quantity)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' })
    }
  }

  // Add to local cart
  const addToLocalCart = (product: Product, quantity: number) => {
    const existingItem = state.items.find(item => item.product.id === product.id)
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      dispatch({ type: 'UPDATE_ITEM', payload: { productId: existingItem.id, quantity: newQuantity } })
    } else {
      const newItem: CartItem = {
        id: `local-${product.id}`,
        product,
        quantity
      }
      dispatch({ type: 'ADD_ITEM', payload: newItem })
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Find the actual product ID from the cart item
      const cartItem = state.items.find(item => item.id === productId || item.product.id === productId)
      const actualProductId = cartItem?.product.id || productId
      
      if (user && actualProductId) {
        try {
          await CartService.removeFromCart(user.id, actualProductId)
        } catch (error) {
          console.error('Supabase remove error, using localStorage:', error)
        }
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: productId })
    } catch (error) {
      console.error('Error removing from cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' })
    }
  }

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      // Find the actual product ID from the cart item
      const cartItem = state.items.find(item => item.id === productId || item.product.id === productId)
      const actualProductId = cartItem?.product.id || productId

      if (user && actualProductId) {
        try {
          await CartService.updateCartItemQuantity(user.id, actualProductId, quantity)
        } catch (error) {
          console.error('Supabase update error, using localStorage:', error)
        }
      }
      
      dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } })
    } catch (error) {
      console.error('Error updating quantity:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' })
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (user) {
        try {
          await CartService.clearCart(user.id)
        } catch (error) {
          console.error('Supabase clear error, using localStorage:', error)
        }
      }
      
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      console.error('Error clearing cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' })
    }
  }

  // Refresh cart
  const refreshCart = async () => {
    await loadCart()
  }

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (state.items.length > 0) {
      saveLocalCart(state.items)
    }
  }, [state.items])

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    console.error('useCart must be used within a CartProvider')
    // Return a fallback context to prevent crashes
    return {
      items: [],
      itemCount: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,
      addToCart: async () => {},
      removeFromCart: async () => {},
      updateQuantity: async () => {},
      clearCart: async () => {},
      refreshCart: async () => {}
    }
  }
  return context
}