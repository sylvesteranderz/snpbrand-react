import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import { useWishlist } from '@/features/wishlist/hooks/useWishlistSupabase'
import { formatPrice } from '@/utils/currency'

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const [inWishlist, setInWishlist] = useState(false)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const status = await isInWishlist(product.id)
      setInWishlist(status)
    }
    checkWishlistStatus()
  }, [isInWishlist, product.id])

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const inWishlistStatus = await isInWishlist(product.id)
    if (inWishlistStatus) {
      removeFromWishlist(product.id)
      setInWishlist(false)
    } else {
      addToWishlist(product)
      setInWishlist(true)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? 'text-primary-400 fill-current' : 'text-gray-300'
          }`}
      />
    ))
  }

  const isActuallyOutOfStock = product.in_stock === false;

  return (
    <motion.div
      className={`group relative ${className} bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 w-full ${isActuallyOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}
      whileHover={isActuallyOutOfStock ? {} : { y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badges - Top Left */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <div className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700">
            New
          </div>
        )}
        {product.isOnSale && product.discount && (
          <div className="bg-accent-500 text-white rounded-md px-2 py-1 text-xs font-medium">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.id}`} tabIndex={isActuallyOutOfStock ? -1 : 0}>
        <div className="relative overflow-hidden bg-gray-100 ">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : product.image}
            alt={product.name}
            className="w-full h-40 sm:h-44 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {isActuallyOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-30">
               <span className="bg-black/80 text-white px-4 py-2 rounded-md font-bold text-sm tracking-widest uppercase shadow-xl">
                 Out of Stock
               </span>
            </div>
          )}

          {/* Wishlist Icon */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 z-20 p-2 rounded-full transition-all shadow-md ${inWishlist
              ? 'bg-accent-500 text-white'
              : 'bg-white text-gray-600 hover:bg-accent-500 hover:text-white'
              }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Arrow Icon - Click to view details indicator */}
          <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm group-hover:bg-black transition-all">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </Link>

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
          <span className="text-base sm:text-lg font-semibold text-price-500">{formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Size Info */}

        <div className="text-xs text-gray-500">
          {isActuallyOutOfStock
            ? 'Out of stock'
            : product.sizes && product.sizes.length > 0
              ? `Sizes: ${product.sizes.join(', ')}`
              : null
          }
        </div>

      </div>
    </motion.div>
  )
}

export default ProductCard
