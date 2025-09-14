import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Product } from '../types'

interface WishlistState {
  items: Product[]
}

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }

const WishlistContext = createContext<{
  state: WishlistState
  dispatch: React.Dispatch<WishlistAction>
  addToWishlist: (product: Product) => void
  removeFromWishlist: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
} | null>(null)

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return state
      }
      return { ...state, items: [...state.items, action.payload] }
    }

    case 'REMOVE_FROM_WISHLIST': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return { ...state, items: updatedItems }
    }

    case 'CLEAR_WISHLIST':
      return { items: [] }

    default:
      return state
  }
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
  })

  const addToWishlist = (product: Product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product })
  }

  const removeFromWishlist = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id })
  }

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }

  const isInWishlist = (id: string) => {
    return state.items.some(item => item.id === id)
  }

  return (
    <WishlistContext.Provider value={{
      state,
      dispatch,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
