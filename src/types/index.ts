export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  description?: string
  category: string
  subcategory?: string
  rating: number
  reviews: number
  in_stock: boolean
  isNew?: boolean
  isOnSale?: boolean
  discount?: number
  sizes?: string[]
  colors?: string[]
  tags?: string[]
  imagePosition?: string
  size_stock?: Record<string, number>
  stockQuantity?: number
}

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  date: string
  category: string
  tags: string[]
}

export interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
  image?: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
}

export interface ContactInfo {
  phone: string
  email: string
  address: string
  hours: string
}

export interface NewsletterData {
  email: string
}

export interface FilterOptions {
  category: string
  priceRange: [number, number]
  rating: number
  in_stock: boolean
  sortBy: 'name' | 'price' | 'rating' | 'newest'
  sortOrder: 'asc' | 'desc'
}

export interface SearchParams {
  query: string
  category?: string
  filters?: Partial<FilterOptions>
}
