import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <motion.div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge */}
      {product.isNew && (
        <div className="absolute top-3 left-3 z-10 bg-white border border-gray-300 rounded-md px-3 py-1 text-xs font-medium text-gray-700">
          New
        </div>
      )}
      {product.isOnSale && product.discount && (
        <div className="absolute top-3 left-3 z-10 bg-accent-500 text-white rounded-md px-3 py-1 text-xs font-medium">
          -{product.discount}%
        </div>
      )}
      {!product.inStock && (
        <div className="absolute top-3 left-3 z-10 bg-gray-500 text-white rounded-md px-3 py-1 text-xs font-medium">
          Sold
        </div>
      )}

      {/* Product Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Quick Actions */}
        <motion.div
          className="absolute top-3 right-3 flex flex-col space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full transition-colors ${
              isInWishlist(product.id)
                ? 'bg-accent-500 text-white'
                : 'bg-white text-gray-600 hover:bg-accent-500 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-500 ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-primary-500">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 btn-cart disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`px-4 py-3 rounded-md border transition-colors ${
              isInWishlist(product.id)
                ? 'bg-accent-500 text-white border-accent-500'
                : 'border-gray-300 text-gray-600 hover:bg-accent-500 hover:text-white hover:border-accent-500'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
