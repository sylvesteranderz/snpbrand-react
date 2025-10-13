import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/currency'

const Orders = () => {
  // Mock orders data - in real app, this would come from Supabase
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 89.99,
      items: [
        {
          id: '1',
          name: 'Premium Leather Slippers',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
          quantity: 1,
          price: 89.99
        }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 129.98,
      items: [
        {
          id: '2',
          name: 'Casual Cotton T-Shirt',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
          quantity: 2,
          price: 29.99
        },
        {
          id: '3',
          name: 'Designer Handbag',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
          quantity: 1,
          price: 199.99
        }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'processing',
      total: 59.98,
      items: [
        {
          id: '4',
          name: 'Running Shoes',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
          quantity: 1,
          price: 59.98
        }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered'
      case 'shipped':
        return 'Shipped'
      case 'processing':
        return 'Processing'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500'
      case 'shipped':
        return 'text-blue-500'
      case 'processing':
        return 'text-yellow-500'
      case 'cancelled':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8"
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
              to="/account"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Account</span>
            </Link>
          </div>
          <h1 className="text-3xl font-chilanka font-normal text-gray-900">
            My Orders
          </h1>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-12"
            >
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
              <Link to="/shop" className="btn-primary">
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(order.status)}
                      <span className={`font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex space-x-3">
                    <Link
                      to={`/order-tracking/${order.id}`}
                      className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Track Order
                    </Link>
                    <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                      Reorder
                    </button>
                  </div>
                  {order.status === 'delivered' && (
                    <button className="btn-outline-primary text-sm">
                      Leave Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Orders
