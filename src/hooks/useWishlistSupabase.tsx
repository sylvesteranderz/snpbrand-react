import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product } from '../types'
import { WishlistService } from '../services/supabaseService'
import { useAuth } from './useAuthSupabase'

interface WishlistItem {
  id: string
  product: Product
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => Promise<boolean>
  refreshWishlist: () => Promise<void>
}

type WishlistAction =
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        error: null
      }
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        isLoading: false,
        error: null
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload),
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

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    isLoading: false,
    error: null
  })

  // Load wishlist when user logs in or on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist()
    } else {
      // Load from localStorage for non-authenticated users
      loadLocalWishlist()
    }
  }, [isAuthenticated, user])

  // Load wishlist from localStorage
  const loadLocalWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('snpbrand-wishlist')
      if (savedWishlist) {
        const wishlistItems: WishlistItem[] = JSON.parse(savedWishlist)
        dispatch({ type: 'SET_WISHLIST', payload: wishlistItems })
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error)
    }
  }

  // Save wishlist to localStorage
  const saveLocalWishlist = (items: WishlistItem[]) => {
    try {
      localStorage.setItem('snpbrand-wishlist', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving local wishlist:', error)
    }
  }

  // Load wishlist from Supabase or localStorage
  const loadWishlist = async () => {
    if (!user) {
      loadLocalWishlist()
      return
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const wishlistData = await WishlistService.getWishlist(user.id)
      
      const wishlistItems: WishlistItem[] = wishlistData.map((item: any) => ({
        id: item.id,
        product: item.products
      }))

      dispatch({ type: 'SET_WISHLIST', payload: wishlistItems })
    } catch (error) {
      console.error('Error loading wishlist:', error)
      // Fallback to localStorage
      loadLocalWishlist()
    }
  }

  // Add item to wishlist
  const addToWishlist = async (product: Product) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check if item already exists in wishlist
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        dispatch({ type: 'SET_ERROR', payload: 'Item already in wishlist' })
        return
      }

      if (user) {
        try {
          await WishlistService.addToWishlist(user.id, product.id)
        } catch (error) {
          console.error('Supabase wishlist error, falling back to localStorage:', error)
        }
      }
      
      const newItem: WishlistItem = {
        id: `local-${product.id}`,
        product
      }
      dispatch({ type: 'ADD_ITEM', payload: newItem })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to wishlist' })
    }
  }

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (user) {
        try {
          await WishlistService.removeFromWishlist(user.id, productId)
        } catch (error) {
          console.error('Supabase remove error, using localStorage:', error)
        }
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: productId })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from wishlist' })
    }
  }

  // Check if item is in wishlist
  const isInWishlist = async (productId: string): Promise<boolean> => {
    return Promise.resolve(state.items.some(item => item.product.id === productId))
  }

  // Refresh wishlist
  const refreshWishlist = async () => {
    await loadWishlist()
  }

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (state.items.length > 0) {
      saveLocalWishlist(state.items)
    }
  }, [state.items])

  const value: WishlistContextType = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    console.error('useWishlist must be used within a WishlistProvider')
    // Return a fallback context to prevent crashes
    return {
      items: [],
      isLoading: false,
      error: null,
      addToWishlist: async () => {},
      removeFromWishlist: async () => {},
      isInWishlist: async () => Promise.resolve(false),
      refreshWishlist: async () => {}
    }
  }
  return context
}