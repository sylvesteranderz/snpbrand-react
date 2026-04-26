import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Search,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  XCircle
} from 'lucide-react'
import { formatPrice } from '@/utils/currency'
import { useProducts } from '@/features/products/hooks/useProductsSupabase'
import AddProductForm from '@/features/products/components/AddProductForm'
import { OrderService, UserProfileService } from '@/services/supabaseService'
import { useEffect, useMemo } from 'react'
import { Product } from '@/types'

const getProductStatusInfo = (product: Product) => {
  const sizeStock = product.size_stock || {};
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : Object.keys(sizeStock);

  if (sizes.length === 0) {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (product.stockQuantity && product.stockQuantity <= 3) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };
  }

  let totalQty = 0;
  let hasLow = false;

  sizes.forEach(size => {
    const qty = sizeStock[size] || 0;
    totalQty += qty;
    if (qty <= 3) hasLow = true;
  });

  if (totalQty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200', totalQty };
  if (hasLow) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200', totalQty };
  
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', totalQty };
}

const AddStockModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  const { updateProduct } = useProducts()
  const [additions, setAdditions] = useState<Record<string, number | ''>>({})
  const [isSaving, setIsSaving] = useState(false)
  
  const sizes = Array.from(new Set([...(product.sizes || []), ...Object.keys(product.size_stock || {})]))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const currentSizeStock = product.size_stock || {};
      const newSizeStock = { ...currentSizeStock };
      
      let hasChanges = false;
      Object.entries(additions).forEach(([size, addQty]) => {
        const qty = Number(addQty);
        if (!isNaN(qty) && qty > 0) {
          newSizeStock[size] = (newSizeStock[size] ?? 0) + qty;
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        onClose();
        return;
      }

      // DB trigger auto-updates stock_quantity and in_stock, only update size_stock!
      await updateProduct(product.id, { size_stock: newSizeStock })
      onClose()
    } catch (error) {
      alert("Failed to update stock.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Add Stock: {product.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {sizes.length > 0 ? (
            sizes.map(size => (
              <div key={size} className="flex items-center justify-between gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">Size {size}</span>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Current: {product.size_stock?.[size] ?? 0}</span>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Add qty"
                  value={additions[size] ?? ''}
                  onChange={e => setAdditions(prev => ({ ...prev, [size]: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="w-24 px-3 py-1.5 border rounded-md text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm ml-auto"
                />
              </div>
            ))
          ) : (
             <p className="text-gray-500 italic">No sizes mapped for this product.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{isSaving ? 'Saving...' : 'Add Stock'}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: string
  total: number
  items: Array<{
    id?: string
    product_id?: string
    name: string
    quantity: number
    price: number
    image?: string
    selected_size?: string
  }>
  paymentMethod: 'paystack' | 'pay_on_delivery'
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive'
}

const AdminDashboard = () => {
  const { products } = useProducts()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [orderTab, setOrderTab] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all')

  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])

  const productMetrics = useMemo(() => {
    const metrics = { total: products.length, inStock: 0, lowStock: 0, outOfStock: 0 };
    products.forEach(p => {
      const status = getProductStatusInfo(p).label;
      if (status === 'Out of Stock') metrics.outOfStock++;
      else if (status === 'Low Stock') metrics.lowStock++;
      else metrics.inStock++;
    });
    return metrics;
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersData = await OrderService.getAllOrders()
        const mappedOrders: Order[] = ordersData.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_info?.Name || (order.customer_info?.firstName ? `${order.customer_info.firstName} ${order.customer_info.lastName}`.trim() : order.user_profiles?.name) || 'Unknown',
          customerEmail: order.customer_info?.email || order.user_profiles?.email || 'Unknown',
          customerPhone: order.customer_info?.phone || order.user_profiles?.phone || 'Unknown',
          customerAddress: order.customer_info?.address && order.customer_info?.city
            ? `${order.customer_info.address}, ${order.customer_info.city}`
            : typeof order.shipping_address === 'string'
              ? order.shipping_address
              : order.shipping_address?.address ? `${order.shipping_address.address}, ${order.shipping_address.city}` : 'No address provided',
          date: order.created_at,
          status: order.status || 'pending',
          paymentStatus: order.payment_status || 'completed',
          total: order.total_amount,
          items: order.items || [],
          paymentMethod: order.payment_method
        }))
        setOrders(mappedOrders)

        // Fetch users
        const usersData = await UserProfileService.getAllProfiles()
        const mappedUsers: User[] = usersData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          joinDate: user.created_at,
          totalOrders: 0, // TODO: Calculate this
          totalSpent: 0, // TODO: Calculate this
          status: 'active' // Default to active
        }))
        setUsers(mappedUsers)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-primary-600 bg-primary-100'
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'processing':
        return 'text-purple-600 bg-purple-100'
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100'
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleToggleStatus = async (orderId: string, currentStatus: string) => {
    // Optimistic UI update
    const newStatus = currentStatus === 'delivered' ? 'pending' : 'delivered'
    
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus as any } : o
    ))
    
    try {
      await OrderService.updateOrderStatus(orderId, newStatus)
    } catch (err) {
      // Revert if error
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: currentStatus as any } : o
      ))
      console.error("Failed to update status")
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      (order.customerPhone || '').toLowerCase().includes(searchLower)
    
    let matchesTab = true;
    if (orderTab !== 'all') {
      matchesTab = order.status === orderTab
    }
    
    return matchesSearch && matchesTab
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ]

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    lowStockProducts: products.filter(p => !p.in_stock).length
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 overflow-x-hidden"
    >
      <div className="mobile-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-8"
        >
          <h1 className="text-3xl font-chilanka font-normal text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your e-commerce store efficiently
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
                <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-500">Store Management</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatPrice(stats.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Low Stock</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.lowStockProducts}</p>
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
                      {orders.slice(0, 5).map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
                              <p className="text-sm text-gray-500">{order.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                            <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Orders Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Total Orders</span>
                    <span className="text-2xl font-bold text-gray-900 mt-2">{orders.length}</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Pending Count</span>
                    <span className="text-2xl font-bold text-orange-600 mt-2">
                      {orders.filter(o => o.status === 'pending').length}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Delivered Count</span>
                    <span className="text-2xl font-bold text-green-600 mt-2">
                      {orders.filter(o => o.status === 'delivered').length}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Total Revenue (GH₵)</span>
                    <span className="text-2xl font-bold text-gray-900 mt-2">
                      {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                    </span>
                  </div>
                </div>

                {/* Filters & Header */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto w-full md:w-auto overflow-x-auto">
                      {(['all', 'pending', 'delivered', 'cancelled'] as const).map(tab => {
                        const count = tab === 'all' 
                          ? orders.length 
                          : orders.filter(o => o.status === tab).length;
                          
                        return (
                          <button
                            key={tab}
                            onClick={() => setOrderTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
                              orderTab === tab 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            <span className="capitalize">{tab}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              orderTab === tab ? 'bg-gray-100 text-gray-900' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-auto min-w-[280px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, order # or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white border rounded-lg p-12 flex flex-col items-center justify-center text-center">
                      <Package className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                      <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                    </div>
                  ) : (
                    filteredOrders.map(order => {
                      const isDelivered = order.status === 'delivered';

                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={order.id}
                          className={`bg-white border rounded-lg overflow-hidden transition-all duration-300 ${isDelivered ? 'border-green-200 shadow-sm opacity-90' : 'shadow-md border-gray-200'}`}
                        >
                          {/* Card Header */}
                          <div className={`px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4 ${isDelivered ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                              <h3 className="text-lg font-bold text-gray-900">
                                {order.orderNumber}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                                <Clock className="w-4 h-4" />
                                {new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-green-100 text-green-700 border-green-200">
                                Payment: {order.paymentStatus === 'pending' && order.paymentMethod === 'paystack' ? 'Paystack (Pending)' : order.paymentStatus || order.paymentMethod || 'completed'}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                Status: {order.status}
                              </span>
                              <div className="text-lg font-bold text-gray-900 ml-2">
                                {formatPrice(order.total)}
                              </div>
                            </div>
                          </div>

                          {/* Card Body - 3 Columns */}
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Column 1: Customer */}
                            <div className="flex flex-col gap-3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer</h4>
                              <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-semibold text-gray-900">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700 font-medium">{order.customerPhone}</div>
                              </div>
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700 leading-relaxed">{order.customerAddress}</div>
                              </div>
                            </div>

                            {/* Column 2: Products */}
                            <div className="flex flex-col gap-3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Products ({order.items.length})</h4>
                              <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-md shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="w-6 h-6 text-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 border bg-white px-1.5 rounded">{item.selected_size || 'N/A'}</span>
                                        <span className="text-xs font-semibold text-gray-700">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Column 3: Actions */}
                            <div className="flex flex-col justify-start gap-4">
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Actions</h4>
                              
                              <a 
                                href={`tel:${order.customerPhone}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 shadow-sm bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition"
                              >
                                <Phone className="w-4 h-4 text-blue-500" />
                                Call Customer
                              </a>

                              <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className={`text-sm font-medium ${isDelivered ? 'text-green-700' : 'text-gray-700'}`}>
                                  Mark as Delivered
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(order.id, order.status)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                    isDelivered ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isDelivered ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                              
                              {order.status === 'cancelled' && (
                                <div className="mt-auto bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm flex items-start gap-2">
                                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>Order was cancelled.</span>
                                </div>
                              )}
                            </div>

                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Total Products</span>
                    <span className="text-2xl font-bold text-gray-900 mt-2">{productMetrics.total}</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">In Stock</span>
                    <span className="text-2xl font-bold text-green-600 mt-2">{productMetrics.inStock}</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Low Stock</span>
                    <span className="text-2xl font-bold text-amber-600 mt-2">{productMetrics.lowStock}</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Out of Stock</span>
                    <span className="text-2xl font-bold text-red-600 mt-2">{productMetrics.outOfStock}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
                      <button onClick={() => setShowAddProductForm(true)} className="btn-primary flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock by Size</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => {
                          const statusInfo = getProductStatusInfo(product)
                          const sizeStock = product.size_stock || {}
                          const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : Object.keys(sizeStock)

                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="hover:bg-gray-50 group"
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center space-x-4">
                                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                                  <div>
                                    <div className="font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                      <span className="capitalize">{product.category}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span className="font-medium">{formatPrice(product.price)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-wrap gap-2 max-w-[280px]">
                                  {sizes.map(size => {
                                    const qty = sizeStock[size] || 0
                                    let chipColor = 'bg-green-50 text-green-700 border-green-200'
                                    if (qty === 0) chipColor = 'bg-red-50 text-red-500 border-red-200 line-through opacity-70'
                                    else if (qty <= 3) chipColor = 'bg-amber-50 text-amber-700 border-amber-200'
                                    
                                    return (
                                      <span key={size} className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${chipColor}`}>
                                        {size} <span className="mx-1 opacity-50">·</span> {qty}
                                      </span>
                                    )
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`text-sm font-bold ${statusInfo.label === 'Out of Stock' ? 'text-red-600' : 'text-gray-900'}`}>
                                  {statusInfo.totalQty || 0}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setStockModalProduct(product)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" /> Stock
                                  </button>
                                  <button onClick={() => {}} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(user.totalSpent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-primary-600 hover:text-primary-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Analytics</h2>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-500">Detailed analytics and reporting features will be available soon.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Product Form Modal */}
      {showAddProductForm && (
        <AddProductForm onClose={() => setShowAddProductForm(false)} />
      )}
      
      {stockModalProduct && (
        <AddStockModal product={stockModalProduct} onClose={() => setStockModalProduct(null)} />
      )}
    </motion.div>
  )
}

export default AdminDashboard
