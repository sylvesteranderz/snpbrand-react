import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product & { quantity?: number; selectedSize?: string; selectedColor?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CALCULATE_TOTAL' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.selectedSize === action.payload.selectedSize &&
        item.selectedColor === action.payload.selectedColor
      )

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        )
        return { ...state, items: updatedItems }
      } else {
        const newItem: CartItem = {
          ...action.payload,
          quantity: action.payload.quantity || 1,
          selectedSize: action.payload.selectedSize,
          selectedColor: action.payload.selectedColor,
        }
        return { ...state, items: [...state.items, newItem] }
      }
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return { ...state, items: updatedItems }
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)
      return { ...state, items: updatedItems }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 }

    case 'CALCULATE_TOTAL': {
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
      return { ...state, total, itemCount }
    }

    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Calculate total whenever items change
  React.useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTAL' })
  }, [state.items])

  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, quantity, selectedSize, selectedColor }
    })
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isInCart = (id: string) => {
    return state.items.some(item => item.id === id)
  }

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
