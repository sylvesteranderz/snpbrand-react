import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShoppingBag } from 'lucide-react'
import { Product } from '../types'
import { formatPrice } from '../utils/currency'

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

const AddToCartModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  selectedSize,
  selectedColor
}: AddToCartModalProps) => {
  if (!product) return null

  const handleViewCart = () => {
    onClose()
    window.location.href = '/cart'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-sm mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <div className="p-5">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
                  className="flex justify-center mb-3"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
                  Added to Cart!
                </h2>
                <p className="text-center text-gray-600 text-sm mb-4">
                  Item successfully added to your shopping cart
                </p>

                {/* Product Info */}
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="space-y-0.5 text-xs text-gray-600">
                      {selectedSize && (
                        <p>
                          <span className="font-medium">Size:</span> {selectedSize}
                        </p>
                      )}
                      {selectedColor && (
                        <p>
                          <span className="font-medium">Color:</span> {selectedColor}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Qty:</span> {quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <p className="text-base font-bold text-primary-500 mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleViewCart}
                    className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AddToCartModal

