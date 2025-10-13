import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '../utils/currency'

interface OrderStatus {
  id: string
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered'
  timestamp: string
  location?: string
  description: string
}

interface OrderData {
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
  status: OrderStatus[]
  trackingNumber?: string
  carrier?: string
}

const OrderTracking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mock order data - in real app, this would come from API
  const mockOrderData: OrderData = {
    orderNumber: orderNumber || 'ORD-1234567890',
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    items: [
      {
        id: '1',
        name: 'Premium Leather Slippers',
        price: 8999,
        quantity: 1,
        image: '/api/placeholder/100/100',
        selectedSize: '42',
        selectedColor: 'Black'
      }
    ],
    paymentMethod: 'paystack',
    total: 9719,
    estimatedDelivery: 'December 25, 2024',
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
    status: [
      {
        id: '1',
        status: 'confirmed',
        timestamp: '2024-12-20T10:00:00Z',
        description: 'Order confirmed and payment received'
      },
      {
        id: '2',
        status: 'processing',
        timestamp: '2024-12-20T14:30:00Z',
        location: 'Warehouse A',
        description: 'Order is being prepared for shipment'
      },
      {
        id: '3',
        status: 'shipped',
        timestamp: '2024-12-21T09:15:00Z',
        location: 'Distribution Center',
        description: 'Order has been shipped'
      }
    ]
  }

  useEffect(() => {
    // Simulate API call
    const fetchOrder = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrder(mockOrderData)
      setLoading(false)
    }

    fetchOrder()
  }, [orderNumber])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle
      case 'processing':
        return Package
      case 'shipped':
        return Truck
      case 'delivered':
        return CheckCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600'
      case 'processing':
        return 'text-yellow-600'
      case 'shipped':
        return 'text-purple-600'
      case 'delivered':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCurrentStatus = () => {
    if (!order) return 'loading'
    return order.status[order.status.length - 1]?.status || 'confirmed'
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-16 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </motion.div>
    )
  }

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-16 flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 bg-gray-50"
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
              to="/account/orders"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-chilanka font-normal text-gray-900">
              Order Tracking
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-primary-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">Estimated Delivery: {order.estimatedDelivery}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.status.map((status, index) => {
                  const Icon = getStatusIcon(status.status)
                  const isLast = index === order.status.length - 1
                  const isCompleted = index < order.status.length - 1 || status.status === 'delivered'
                  
                  return (
                    <motion.div
                      key={status.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-medium capitalize ${
                            isCompleted ? 'text-green-600' : getStatusColor(status.status)
                          }`}>
                            {status.status}
                          </h3>
                          {isLast && (
                            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{status.description}</p>
                        {status.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {status.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(status.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!isLast && (
                        <div className="w-16 h-0.5 bg-gray-300 mt-5" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tracking Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tracking Number</h3>
                    <p className="text-lg font-mono text-primary-500">{order.trackingNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Carrier</h3>
                    <p className="text-lg text-gray-600">{order.carrier}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> You can track your package directly on the carrier's website using the tracking number above.
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
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
                  <span className="font-medium">{formatPrice(order.total * 0.92)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {order.paymentMethod === 'pay_on_delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatPrice(500)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(order.total * 0.08)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {order.paymentMethod === 'paystack' ? (
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
                  to="/shop"
                  className="w-full btn-primary block text-center"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/account/orders"
                  className="w-full btn-outline-primary block text-center"
                >
                  View All Orders
                </Link>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-full btn-outline-dark flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderTracking
