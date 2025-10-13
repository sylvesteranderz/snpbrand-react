import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Product } from '../types'

// Product Management Context
interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  isLoading: boolean
}

// Product Actions
type ProductAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

// Product Reducer
const productReducer = (state: Product[], action: ProductAction): Product[] => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return action.payload
    case 'ADD_PRODUCT':
      return [...state, action.payload]
    case 'UPDATE_PRODUCT':
      return state.map(product =>
        product.id === action.payload.id
          ? { ...product, ...action.payload.updates }
          : product
      )
    case 'DELETE_PRODUCT':
      return state.filter(product => product.id !== action.payload)
    default:
      return state
  }
}

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Default products (fallback)
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Slippers',
    price: 89.99,
    originalPrice: 120.00,
    image: '/images/products/slipper-1.jpg',
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
    image: '/images/products/tshirt-1.jpg',
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
    image: '/images/products/handbag-1.jpg',
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

// Product Context
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Product Provider
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, dispatch] = useReducer(productReducer, defaultProducts)
  const [isLoading, setIsLoading] = React.useState(false)

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('snpbrand-products')
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts)
        dispatch({ type: 'SET_PRODUCTS', payload: parsedProducts })
      } catch (error) {
        console.error('Error loading products from localStorage:', error)
      }
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('snpbrand-products', JSON.stringify(products))
  }, [products])

  // Add product
  const addProduct = (productData: Omit<Product, 'id'>) => {
    setIsLoading(true)
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
    
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct })
    setIsLoading(false)
  }

  // Update product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setIsLoading(true)
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } })
    setIsLoading(false)
  }

  // Delete product
  const deleteProduct = (id: string) => {
    setIsLoading(true)
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
    setIsLoading(false)
  }

  // Get single product
  const getProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id)
  }

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    isLoading
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
