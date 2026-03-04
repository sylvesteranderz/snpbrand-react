import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product } from '../types'
import { ProductService } from '../services/supabaseService'

// Product Management Context
interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProduct: (id: string) => Product | undefined
  isLoading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
}

// Product Actions
type ProductAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Product Reducer
const productReducer = (state: { products: Product[]; isLoading: boolean; error: string | null }, action: ProductAction) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, isLoading: false, error: null }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload], isLoading: false, error: null }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, ...action.payload.updates }
            : product
        ),
        isLoading: false,
        error: null
      }
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
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

// Product Context
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Product Provider
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    isLoading: true,
    error: null
  })

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  // Load products
  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const products = await ProductService.getAllProducts()
      dispatch({ type: 'SET_PRODUCTS', payload: products })
    } catch (error) {
      console.error('Error loading products:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load products' })
    }
  }

  // Add product
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const newProduct = await ProductService.addProduct(productData)
      if (newProduct) {
        dispatch({ type: 'ADD_PRODUCT', payload: newProduct })
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add product' })
      throw error
    }
  }

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedProduct = await ProductService.updateProduct(id, updates)
      if (updatedProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates: updatedProduct } })
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update product' })
      throw error
    }
  }

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await ProductService.deleteProduct(id)
      dispatch({ type: 'DELETE_PRODUCT', payload: id })
    } catch (error) {
      console.error('Error deleting product:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete product' })
      throw error
    }
  }

  // Get single product
  const getProduct = (id: string): Product | undefined => {
    return state.products.find(product => product.id === id)
  }

  // Refresh products
  const refreshProducts = async () => {
    await loadProducts()
  }

  const value: ProductContextType = {
    products: state.products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    isLoading: state.isLoading,
    error: state.error,
    refreshProducts
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

// Hook to use product context
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}