import { Product, BlogPost, Testimonial, Service } from '../types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Green Croc-Embedded SnP',
    price: 18.00,
    image: '/images/SnPimage.jpg',
    images: ['/images/SnPimage.jpg', '/images/SnPimage2.png'],
    description: 'Comfortable and stylish slippers with croc-embedded design',
    category: 'slippers',
    rating: 5.0,
    reviews: 24,
    inStock: true,
    isNew: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Green', 'Black', 'Brown'],
    tags: ['comfort', 'style', 'casual']
  },
  {
    id: '2',
    name: 'Grey Hoodie',
    price: 18.00,
    image: '/images/image2.png',
    images: ['/images/image2.png'],
    description: 'Soft and warm grey hoodie perfect for any season',
    category: 'apparel',
    rating: 5.0,
    reviews: 18,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Grey', 'Black', 'White'],
    tags: ['casual', 'warm', 'comfortable']
  },
  {
    id: '3',
    name: 'Premium Slippers',
    price: 18.00,
    originalPrice: 20.00,
    image: '/images/image3.png',
    images: ['/images/image3.png'],
    description: 'High-quality slippers with premium materials',
    category: 'slippers',
    rating: 5.0,
    reviews: 32,
    inStock: true,
    isOnSale: true,
    discount: 10,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Red', 'Black'],
    tags: ['premium', 'comfort', 'durable']
  },
  {
    id: '4',
    name: 'Classic T-Shirt',
    price: 15.00,
    image: '/images/item4.jpg',
    images: ['/images/item4.jpg'],
    description: 'Basic t-shirt made from 100% cotton',
    category: 'apparel',
    rating: 4.5,
    reviews: 15,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    tags: ['basic', 'cotton', 'casual']
  },
  {
    id: '5',
    name: 'Comfort Slippers',
    price: 22.00,
    image: '/images/item5.jpg',
    images: ['/images/item5.jpg'],
    description: 'Ultra-comfortable slippers for home use',
    category: 'slippers',
    rating: 4.8,
    reviews: 28,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Grey', 'Black'],
    tags: ['comfort', 'home', 'soft']
  },
  {
    id: '6',
    name: 'Sporty Hoodie',
    price: 25.00,
    image: '/images/item6.jpg',
    images: ['/images/item6.jpg'],
    description: 'Athletic hoodie perfect for workouts and casual wear',
    category: 'apparel',
    rating: 4.7,
    reviews: 21,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Grey', 'Blue'],
    tags: ['sporty', 'athletic', 'comfortable']
  },
  {
    id: '7',
    name: 'Luxury Slippers',
    price: 30.00,
    originalPrice: 35.00,
    image: '/images/item7.jpg',
    images: ['/images/item7.jpg'],
    description: 'Premium luxury slippers with elegant design',
    category: 'slippers',
    rating: 4.9,
    reviews: 35,
    inStock: true,
    isOnSale: true,
    discount: 14,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown', 'Tan'],
    tags: ['luxury', 'elegant', 'premium']
  },
  {
    id: '8',
    name: 'Cozy Sweater',
    price: 28.00,
    image: '/images/item8.jpg',
    images: ['/images/item8.jpg'],
    description: 'Warm and cozy sweater for cold weather',
    category: 'apparel',
    rating: 4.6,
    reviews: 19,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cream', 'Grey', 'Navy'],
    tags: ['warm', 'cozy', 'winter']
  }
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Reasons to be Helpful Towards Any Animals',
    excerpt: 'At the core of our practice is the idea that cities are the incubators of our greatest achievements, and the best hope for a sustainable future.',
    content: 'Full blog post content here...',
    image: '/images/blog1.jpg',
    author: 'SnP Team',
    date: '2024-02-20',
    category: 'Lifestyle',
    tags: ['animals', 'help', 'community']
  },
  {
    id: '2',
    title: 'How to Know Your Pet is Hungry',
    excerpt: 'At the core of our practice is the idea that cities are the incubators of our greatest achievements, and the best hope for a sustainable future.',
    content: 'Full blog post content here...',
    image: '/images/blog2.jpg',
    author: 'SnP Team',
    date: '2024-02-21',
    category: 'Pet Care',
    tags: ['pets', 'hunger', 'care']
  },
  {
    id: '3',
    title: 'Best Home for Your Pets',
    excerpt: 'At the core of our practice is the idea that cities are the incubators of our greatest achievements, and the best hope for a sustainable future.',
    content: 'Full blog post content here...',
    image: '/images/blog3.jpg',
    author: 'SnP Team',
    date: '2024-02-22',
    category: 'Pet Care',
    tags: ['home', 'pets', 'environment']
  }
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Joshima Lin',
    content: 'At the core of our practice is the idea that cities are the incubators of our greatest achievements, and the best hope for a sustainable future.',
    rating: 5,
    image: '/images/reviewer-1.jpg'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    content: 'The quality of SnP products is outstanding. I\'ve been a customer for years and always satisfied with my purchases.',
    rating: 5,
    image: '/images/reviewer-2.jpg'
  },
  {
    id: '3',
    name: 'Mike Chen',
    content: 'Great customer service and fast delivery. The slippers are incredibly comfortable and stylish.',
    rating: 5,
    image: '/images/reviewer-3.jpg'
  }
]

export const services: Service[] = [
  {
    id: '1',
    title: 'Free Delivery',
    description: 'Lorem ipsum dolor sit amet, consectetur adipi elit.',
    icon: 'shopping-cart'
  },
  {
    id: '2',
    title: '100% Secure Payment',
    description: 'Lorem ipsum dolor sit amet, consectetur adipi elit.',
    icon: 'user-check'
  },
  {
    id: '3',
    title: 'Daily Offer',
    description: 'Lorem ipsum dolor sit amet, consectetur adipi elit.',
    icon: 'tag'
  },
  {
    id: '4',
    title: 'Quality Guarantee',
    description: 'Lorem ipsum dolor sit amet, consectetur adipi elit.',
    icon: 'award'
  }
]

export const categories = [
  { id: 'all', name: 'All', count: products.length },
  { id: 'slippers', name: 'Slippers', count: products.filter(p => p.category === 'slippers').length },
  { id: 'apparel', name: 'Apparel', count: products.filter(p => p.category === 'apparel').length },
]

export const contactInfo = {
  phone: '+233535257601',
  email: 'snpslides@gmail.com',
  address: '123 Fashion Street, Style City, SC 12345',
  hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed'
}
