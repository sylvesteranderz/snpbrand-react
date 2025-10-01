import { Product, BlogPost, Testimonial, Service } from '../types'

export const products: Product[] = [
  // SLIPPERS SECTION
  {
    id: '1',
    name: 'Green Croc-Embedded SnP',
    price: 18.00,
    image: '/images/SnPimage.jpg',
    images: ['/images/SnPimage.jpg', '/images/SnPimage2.png'],
    description: 'Comfortable and stylish slippers with croc-embedded design. Perfect for indoor and outdoor use.',
    category: 'slippers',
    subcategory: 'casual',
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
    name: 'Brown Croc-embossed Leather Slippers',
    price: 18.00,
    image: '/images/image2.png',
    images: ['/images/image2.png'],
    description: 'Premium leather slippers with croc-embossed pattern. Durable and comfortable for daily wear.',
    category: 'slippers',
    subcategory: 'leather',
    rating: 5.0,
    reviews: 18,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Brown', 'Black', 'Tan'],
    tags: ['leather', 'premium', 'durable']
  },
  {
    id: '3',
    name: 'Black Leather Slippers',
    price: 18.00,
    originalPrice: 20.00,
    image: '/images/image3.png',
    images: ['/images/image3.png'],
    description: 'High-quality black leather slippers with premium materials and elegant design.',
    category: 'slippers',
    subcategory: 'leather',
    rating: 5.0,
    reviews: 32,
    inStock: true,
    isOnSale: true,
    discount: 10,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown', 'Navy'],
    tags: ['premium', 'comfort', 'durable']
  },
  {
    id: '5',
    name: 'Comfort Slippers',
    price: 22.00,
    image: '/images/item5.jpg',
    images: ['/images/item5.jpg'],
    description: 'Ultra-comfortable slippers for home use with memory foam insole.',
    category: 'slippers',
    subcategory: 'comfort',
    rating: 4.8,
    reviews: 28,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Grey', 'Black'],
    tags: ['comfort', 'home', 'soft']
  },
  {
    id: '7',
    name: 'Luxury Slippers',
    price: 30.00,
    originalPrice: 35.00,
    image: '/images/item7.jpg',
    images: ['/images/item7.jpg'],
    description: 'Premium luxury slippers with elegant design and superior craftsmanship.',
    category: 'slippers',
    subcategory: 'luxury',
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
    id: '9',
    name: 'Fuzzy Winter Slippers',
    price: 25.00,
    image: '/images/item9.jpg',
    images: ['/images/item9.jpg'],
    description: 'Warm and cozy fuzzy slippers perfect for cold winter days.',
    category: 'slippers',
    subcategory: 'winter',
    rating: 4.7,
    reviews: 22,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Pink', 'Blue'],
    tags: ['warm', 'fuzzy', 'winter']
  },
  {
    id: '10',
    name: 'Sport Slippers',
    price: 20.00,
    image: '/images/item10.jpg',
    images: ['/images/item10.jpg'],
    description: 'Athletic-style slippers with breathable material and non-slip sole.',
    category: 'slippers',
    subcategory: 'sport',
    rating: 4.6,
    reviews: 16,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Grey'],
    tags: ['sport', 'breathable', 'athletic']
  },
  {
    id: '11',
    name: 'Classic Moccasin Slippers',
    price: 24.00,
    image: '/images/item11.jpg',
    images: ['/images/item11.jpg'],
    description: 'Traditional moccasin-style slippers with soft suede upper.',
    category: 'slippers',
    subcategory: 'classic',
    rating: 4.8,
    reviews: 31,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black', 'Tan'],
    tags: ['classic', 'moccasin', 'traditional']
  },

  // APPAREL SECTION
  {
    id: '4',
    name: 'Classic T-Shirt',
    price: 15.00,
    image: '/images/item4.jpg',
    images: ['/images/item4.jpg'],
    description: 'Basic t-shirt made from 100% cotton with comfortable fit.',
    category: 'apparel',
    subcategory: 'tops',
    rating: 4.5,
    reviews: 15,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    tags: ['basic', 'cotton', 'casual']
  },
  {
    id: '6',
    name: 'Sporty Hoodie',
    price: 25.00,
    image: '/images/item6.jpg',
    images: ['/images/item6.jpg'],
    description: 'Athletic hoodie perfect for workouts and casual wear with moisture-wicking fabric.',
    category: 'apparel',
    subcategory: 'hoodies',
    rating: 4.7,
    reviews: 21,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Grey', 'Blue'],
    tags: ['sporty', 'athletic', 'comfortable']
  },
  {
    id: '8',
    name: 'Cozy Sweater',
    price: 28.00,
    image: '/images/item8.jpg',
    images: ['/images/item8.jpg'],
    description: 'Warm and cozy sweater for cold weather made from premium wool blend.',
    category: 'apparel',
    subcategory: 'sweaters',
    rating: 4.6,
    reviews: 19,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cream', 'Grey', 'Navy'],
    tags: ['warm', 'cozy', 'winter']
  },
  {
    id: '12',
    name: 'Denim Jacket',
    price: 35.00,
    image: '/images/item12.jpg',
    images: ['/images/item12.jpg'],
    description: 'Classic denim jacket with vintage wash and modern fit.',
    category: 'apparel',
    subcategory: 'jackets',
    rating: 4.9,
    reviews: 28,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Light Blue'],
    tags: ['denim', 'vintage', 'classic']
  },
  {
    id: '13',
    name: 'Cargo Pants',
    price: 32.00,
    image: '/images/item13.jpg',
    images: ['/images/item13.jpg'],
    description: 'Durable cargo pants with multiple pockets and comfortable fit.',
    category: 'apparel',
    subcategory: 'pants',
    rating: 4.4,
    reviews: 17,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Khaki', 'Black', 'Olive'],
    tags: ['cargo', 'durable', 'practical']
  },
  {
    id: '14',
    name: 'Polo Shirt',
    price: 22.00,
    image: '/images/item14.jpg',
    images: ['/images/item14.jpg'],
    description: 'Classic polo shirt with pique cotton fabric and collar.',
    category: 'apparel',
    subcategory: 'tops',
    rating: 4.6,
    reviews: 23,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Red'],
    tags: ['polo', 'classic', 'professional']
  },
  {
    id: '15',
    name: 'Jogger Pants',
    price: 26.00,
    image: '/images/item15.jpg',
    images: ['/images/item15.jpg'],
    description: 'Comfortable jogger pants with elastic waistband and tapered fit.',
    category: 'apparel',
    subcategory: 'pants',
    rating: 4.5,
    reviews: 20,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Grey', 'Navy'],
    tags: ['jogger', 'comfortable', 'casual']
  },
  {
    id: '16',
    name: 'Tank Top',
    price: 12.00,
    image: '/images/item16.jpg',
    images: ['/images/item16.jpg'],
    description: 'Basic tank top made from soft cotton blend for everyday wear.',
    category: 'apparel',
    subcategory: 'tops',
    rating: 4.3,
    reviews: 14,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Grey'],
    tags: ['tank', 'basic', 'cotton']
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
  { 
    id: 'all', 
    name: 'All Products', 
    count: products.length,
    icon: 'grid',
    description: 'Browse all our products'
  },
  { 
    id: 'slippers', 
    name: 'Slippers', 
    count: products.filter(p => p.category === 'slippers').length,
    icon: 'footprints',
    description: 'Comfortable and stylish slippers for every occasion'
  },
  { 
    id: 'apparel', 
    name: 'Apparel', 
    count: products.filter(p => p.category === 'apparel').length,
    icon: 'shirt',
    description: 'Fashionable clothing for men and women'
  },
]

export const subcategories = {
  slippers: [
    { id: 'casual', name: 'Casual', count: products.filter(p => p.subcategory === 'casual').length },
    { id: 'leather', name: 'Leather', count: products.filter(p => p.subcategory === 'leather').length },
    { id: 'comfort', name: 'Comfort', count: products.filter(p => p.subcategory === 'comfort').length },
    { id: 'luxury', name: 'Luxury', count: products.filter(p => p.subcategory === 'luxury').length },
    { id: 'winter', name: 'Winter', count: products.filter(p => p.subcategory === 'winter').length },
    { id: 'sport', name: 'Sport', count: products.filter(p => p.subcategory === 'sport').length },
    { id: 'classic', name: 'Classic', count: products.filter(p => p.subcategory === 'classic').length },
  ],
  apparel: [
    { id: 'tops', name: 'Tops', count: products.filter(p => p.subcategory === 'tops').length },
    { id: 'hoodies', name: 'Hoodies', count: products.filter(p => p.subcategory === 'hoodies').length },
    { id: 'sweaters', name: 'Sweaters', count: products.filter(p => p.subcategory === 'sweaters').length },
    { id: 'jackets', name: 'Jackets', count: products.filter(p => p.subcategory === 'jackets').length },
    { id: 'pants', name: 'Pants', count: products.filter(p => p.subcategory === 'pants').length },
  ]
}

export const contactInfo = {
  phone: '+233535257601',
  email: 'snpslides@gmail.com',
  address: '123 Fashion Street, Style City, SC 12345',
  hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed'
}
