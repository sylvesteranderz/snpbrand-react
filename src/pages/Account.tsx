import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Package, Heart, Settings, MapPin, Calendar, Eye, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/currency'
import { useAuth } from '../hooks/useAuthSupabase'
import { OrderService, UserProfileService } from '../services/supabaseService'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
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
}

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  joinDate: string
  totalOrders: number
  totalSpent: number
}

const Account = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile' | 'addresses'>('overview')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true)
        try {
          // Fetch user profile
          const profileData = await UserProfileService.getUserProfile(user.id)
          if (profileData) {
            setUserProfile({
              firstName: profileData.name.split(' ')[0] || '',
              lastName: profileData.name.split(' ').slice(1).join(' ') || '',
              email: profileData.email,
              phone: profileData.phone || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              zipCode: profileData.zip_code || '',
              country: profileData.country || '',
              joinDate: profileData.created_at,
              totalOrders: 0, // Will be updated after fetching orders
              totalSpent: 0 // Will be updated after fetching orders
            })
          }

          // Fetch orders
          const ordersData = await OrderService.getUserOrders(user.id)
          const mappedOrders: Order[] = ordersData.map((order: any) => ({
            id: order.id,
            orderNumber: order.order_number,
            date: order.created_at,
            status: order.status,
            total: order.total_amount,
            paymentMethod: order.payment_method,
            items: order.items || []
          }))
          setOrders(mappedOrders)

          // Update stats
          if (profileData) {
            setUserProfile(prev => prev ? ({
              ...prev,
              totalOrders: mappedOrders.length,
              totalSpent: mappedOrders.reduce((sum, order) => sum + order.total, 0)
            }) : null)
          }

        } catch (error) {
          console.error('Error fetching account data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'shipped':
        return 'text-purple-600 bg-purple-100'
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'addresses', label: 'Addresses', icon: MapPin }
  ]

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
          className="mb-8"
        >
          <h1 className="text-3xl font-chilanka font-normal text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600">
            Welcome back, {userProfile?.firstName || 'User'}! Manage your orders and account settings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{userProfile?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Orders */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-xl font-semibold text-gray-900">{userProfile?.totalOrders || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Spent */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="text-xl font-semibold text-gray-900">{formatPrice(userProfile?.totalSpent || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={order.items[0].image}
                              alt={order.items[0].name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{order.items[0].name}</h3>
                              <p className="text-sm text-gray-500">
                                Order #{order.orderNumber} • {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                            <Link
                              to={`/order-tracking/${order.orderNumber}`}
                              className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link
                        to="/account/orders"
                        className="btn-outline-primary"
                      >
                        View All Orders
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                {item.selectedSize && (
                                  <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                                )}
                                {item.selectedColor && (
                                  <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                                )}
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {order.paymentMethod === 'paystack' ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm text-gray-500">Paid Online</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-sm text-gray-500">Pay on Delivery</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/order-tracking/${order.orderNumber}`}
                              className="btn-outline-primary text-sm"
                            >
                              Track Order
                            </Link>
                            <button className="btn-outline-dark text-sm flex items-center space-x-1">
                              <Download className="w-4 h-4" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                </div>
                <div className="p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={userProfile?.firstName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={userProfile?.lastName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={userProfile?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={userProfile?.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900">Default Address</h3>
                            <p className="text-gray-600">
                              {userProfile?.address}<br />
                              {userProfile?.city}, {userProfile?.state} {userProfile?.zipCode}<br />
                              {userProfile?.country}
                            </p>
                          </div>
                        </div>
                        <button className="btn-outline-primary text-sm">
                          Edit
                        </button>
                      </div>
                    </div>

                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>Add New Address</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Account
