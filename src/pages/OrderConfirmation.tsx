import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/currency'

interface OrderConfirmationProps {
  orderNumber: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
    selectedSize?: string
    selectedColor?: string
  }>
  paymentMethod: 'paystack' | 'pay_on_delivery'
  total: number
  estimatedDelivery: string
}

const OrderConfirmation = ({ 
  orderNumber, 
  customerInfo, 
  items, 
  paymentMethod, 
  total,
  estimatedDelivery 
}: OrderConfirmationProps) => {
  const steps = [
    { 
      icon: CheckCircle, 
      title: 'Order Confirmed', 
      description: 'Your order has been received',
      completed: true 
    },
    { 
      icon: Package, 
      title: 'Processing', 
      description: 'We\'re preparing your order',
      completed: false 
    },
    { 
      icon: Truck, 
      title: 'Shipped', 
      description: 'Your order is on the way',
      completed: false 
    },
    { 
      icon: CheckCircle, 
      title: 'Delivered', 
      description: 'Order delivered successfully',
      completed: false 
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-chilanka font-normal text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-sm text-gray-500">
            Order Number: <span className="font-semibold text-primary-500">{orderNumber}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Tracking</h2>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          step.completed ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-16 h-0.5 bg-gray-300" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Delivery Address</h3>
                      <p className="text-sm text-gray-600">
                        {customerInfo.address}<br />
                        {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}<br />
                        {customerInfo.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Estimated Delivery</h3>
                      <p className="text-sm text-gray-600">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Number</h3>
                      <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-sm text-gray-600">{customerInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 border sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(total * 0.92)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {paymentMethod === 'pay_on_delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatPrice(500)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(total * 0.08)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {paymentMethod === 'paystack' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Paid Online</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Pay on Delivery</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  to={`/order-tracking/${orderNumber}`}
                  className="w-full btn-primary block text-center"
                >
                  Track Order
                </Link>
                <Link 
                  to="/shop"
                  className="w-full btn-outline-primary block text-center"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/account/orders"
                  className="w-full btn-outline-dark block text-center"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderConfirmation
