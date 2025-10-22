import { motion } from 'framer-motion'
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../hooks/useWishlistSupabase'
import { useCart } from '../hooks/useCartSupabase'
import ProductCard from '../components/ProductCard'

const Wishlist = () => {
  const { items } = useWishlist()
  const { addToCart } = useCart()

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your wishlist</p>
            <Link to="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
          <h1 className="text-3xl font-chilanka font-normal text-gray-900">
            My Wishlist ({items.length} items)
          </h1>
        </motion.div>

        {/* Wishlist Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ProductCard product={item.product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => {
                items.forEach(item => addToCart(item.product))
              }}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add All to Cart</span>
            </button>
            <Link to="/shop" className="btn-outline-primary">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Wishlist
