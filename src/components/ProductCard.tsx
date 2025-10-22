import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '../types'
import { useCart } from '../hooks/useCartSupabase'
import { useWishlist } from '../hooks/useWishlistSupabase'
import { formatPrice } from '../utils/currency'

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [showSizes, setShowSizes] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const status = await isInWishlist(product.id)
      setInWishlist(status)
    }
    checkWishlistStatus()
  }, [isInWishlist, product.id])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    const inWishlistStatus = await isInWishlist(product.id)
    if (inWishlistStatus) {
      removeFromWishlist(product.id)
      setInWishlist(false)
    } else {
      addToWishlist(product)
      setInWishlist(true)
    }
  }

  const handleSizeToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowSizes(!showSizes)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <motion.div
      className={`group relative ${className} bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge */}
      {product.isNew && (
        <div className="absolute top-2 left-2 z-10 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700">
          New
        </div>
      )}
      {product.isOnSale && product.discount && (
        <div className="absolute top-2 left-2 z-10 bg-accent-500 text-white rounded-md px-2 py-1 text-xs font-medium">
          -{product.discount}%
        </div>
      )}
      {!product.inStock && (
        <div className="absolute top-2 left-2 z-10 bg-gray-500 text-white rounded-md px-2 py-1 text-xs font-medium">
          Sold
        </div>
      )}
      
      {/* Category Label */}
      <div className="absolute top-2 right-2 z-10 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700 capitalize">
        {product.category}
      </div>

      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 sm:h-44 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Quick Actions */}
        <motion.div
          className="absolute top-12 right-2 flex flex-col space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleWishlistToggle}
            className={`p-1.5 sm:p-2 rounded-full transition-colors ${
              inWishlist
                ? 'bg-accent-500 text-white'
                : 'bg-white text-gray-600 hover:bg-accent-500 hover:text-white'
            }`}
          >
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </motion.div>
      </div>

  {/* Product Info */}
  <div className="mt-3 space-y-2 px-3 pb-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-base sm:text-lg font-semibold text-primary-500">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Size Toggle Button */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2">
            <button
              onClick={handleSizeToggle}
              className="text-xs text-gray-500 hover:text-primary-500 transition-colors"
            >
              {showSizes ? 'Hide Sizes' : `Sizes (${product.sizes.length})`}
            </button>
            
            {/* Size Buttons - Only show when clicked */}
            {showSizes && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-primary-500 hover:text-primary-500 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 btn-cart disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`px-2 sm:px-4 py-3 rounded-md border transition-colors ${
              inWishlist
                ? 'bg-accent-500 text-white border-accent-500'
                : 'border-gray-300 text-gray-600 hover:bg-accent-500 hover:text-white hover:border-accent-500'
            }`}
          >
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
