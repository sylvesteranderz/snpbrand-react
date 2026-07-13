import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  XCircle,
  Tag,
  ClipboardList,
  Warehouse,
  LineChart,
  SlidersHorizontal,
} from 'lucide-react'
import { formatPrice } from '@/utils/currency'
import { supabase } from '@/lib/supabase'
import { useProducts } from '@/features/products/hooks/useProductsSupabase'
import AddProductForm from '@/features/products/components/AddProductForm'
import { OrderService, UserProfileService } from '@/services/supabaseService'
import { useEffect, useMemo, useCallback } from 'react'
import { Product } from '@/types'
import DiscountCodesTab from '@/features/admin/components/DiscountCodesTab'
import RestockModal     from '@/features/admin/components/RestockModal'
import AdjustStockModal from '@/features/admin/components/AdjustStockModal'
import InventoryLog     from '@/features/admin/components/InventoryLog'
import ExpenseLogger    from '@/features/admin/components/ExpenseLogger'
import ProfitLoss       from '@/features/admin/components/ProfitLoss'
import OrderDetailDrawer from '@/components/admin/OrderDetailDrawer'
import AdminBottomTabBar from '@/features/admin/components/AdminBottomTabBar'
import MetricGrid from '@/features/admin/components/MetricGrid'

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
  const [additions, setAdditions] = useState<Record<string, number | ''>>({})
  const [isSaving, setIsSaving]   = useState(false)
  const [error, setError]         = useState('')  // pre-submit validation only
  // TODO: location picker once hub UI exists
  const [kumasiId, setKumasiId]   = useState<string | null>(null)
  // Current stock per size read directly from stock_levels (single source of truth)
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({})
  const [loadingStock, setLoadingStock] = useState(true)
  // Per-size results shown after the submit loop completes
  const [sizeResults, setSizeResults] = useState<{ size: string; success: boolean; error?: string }[]>([])

  const sizes = Array.from(new Set([...(product.sizes || []), ...Object.keys(product.size_stock || {})]))

  // Fetch Kumasi location id + current stock_levels on mount
  useEffect(() => {
    const load = async () => {
      setLoadingStock(true)
      // TODO: location picker once hub UI exists
      const { data: loc } = await supabase!
        .from('locations')
        .select('id')
        .eq('name', 'Kumasi')
        .single()
      if (loc?.id) setKumasiId(loc.id)

      const { data: levels } = await supabase!
        .from('stock_levels')
        .select('size, quantity')
        .eq('product_id', product.id)
        .eq('location_id', loc?.id ?? '')
      const map: Record<string, number> = {}
      ;(levels ?? []).forEach((r: any) => { map[r.size] = r.quantity })
      setStockLevels(map)
      setLoadingStock(false)
    }
    load()
  }, [product.id])

  const handleSave = async () => {
    setError('')
    setSizeResults([])
    if (!kumasiId) { setError('Could not resolve location. Please try again.'); return }

    const toAdd = Object.entries(additions)
      .map(([size, qty]) => ({ size, qty: Number(qty) }))
      .filter(({ qty }) => !isNaN(qty) && qty > 0)

    if (toAdd.length === 0) { onClose(); return }

    setIsSaving(true)

    const results: { size: string; success: boolean; error?: string }[] = []

    for (const { size, qty } of toAdd) {
      try {
        const { error: rpcErr } = await supabase!
          .rpc('apply_stock_change', {
            p_product_id:  product.id,
            p_size:        size,
            p_location_id: kumasiId,
            p_delta:       qty,        // positive — stock IN
            p_type:        'restock',
            p_note:        null,
          })
        if (rpcErr) throw new Error(rpcErr.message)
        // Success: patch local stockLevels immediately so re-opens see real number
        setStockLevels(prev => ({ ...prev, [size]: (prev[size] ?? 0) + qty }))
        // Clear input for this size to prevent double-submitting on retry
        setAdditions(prev => ({ ...prev, [size]: '' }))
        results.push({ size, success: true })
      } catch (err: any) {
        // Do NOT abort — continue to next size
        results.push({ size, success: false, error: err?.message ?? 'Unknown error' })
      }
    }

    setSizeResults(results)
    setIsSaving(false)

    // Only auto-close if every size succeeded
    if (results.every(r => r.success)) {
      onClose()
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
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                  {loadingStock ? '…' : `Current: ${stockLevels[size] ?? 0}`}
                </span>
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

        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSaving || loadingStock || !kumasiId}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Add Stock'}
          </button>
        </div>

        {/* Per-size results shown after the loop completes */}
        {sizeResults.length > 0 && (
          <div className="mt-3 space-y-1">
            {sizeResults.map(r => (
              <div
                key={r.size}
                className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${
                  r.success
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <span className="font-bold shrink-0">
                  {r.success ? '✓' : '✗'} Size {r.size}
                </span>
                {!r.success && (
                  <span className="break-words">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

const formatWhatsAppPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('233')) return digits
  if (digits.startsWith('0')) return '233' + digits.slice(1)
  return '233' + digits
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'expired'
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

const timeAgo = (dateStr: string): string => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
};



const AdminDashboard = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, refreshProducts } = useProducts()

  // activeTab is driven by the URL ?tab= param so the bottom bar stays in sync
  type AdminTab = 'overview' | 'orders' | 'products' | 'users' | 'analytics' | 'discounts' | 'inventory' | 'finance'
  const VALID_TABS: AdminTab[] = ['overview', 'orders', 'products', 'users', 'analytics', 'discounts', 'inventory', 'finance']
  const rawTab = searchParams.get('tab')
  const activeTab: AdminTab = (rawTab && VALID_TABS.includes(rawTab as AdminTab))
    ? (rawTab as AdminTab)
    : 'overview'

  // Update URL param — Finance still navigates to its own page
  const handleSetTab = (tab: AdminTab) => {
    if (tab === 'finance') {
      navigate('/admin/finance')
    } else if (tab === 'overview') {
      // Remove ?tab param entirely for a clean /admin URL
      setSearchParams({})
    } else {
      setSearchParams({ tab })
    }
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [orderTab, setOrderTab] = useState<'fulfil' | 'processing' | 'fulfilled' | 'abandoned'>('fulfil')

  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null)
  const [restockModalProduct, setRestockModalProduct]     = useState<Product | null>(null)
  const [adjustStockModalProduct, setAdjustStockModalProduct] = useState<Product | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)



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

  const fetchData = useCallback(async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])



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

  const tabFilter = (order: Order) => {
    switch (orderTab) {
      case 'fulfil':
        return order.paymentStatus === 'paid' && ['pending', 'confirmed'].includes(order.status)
      case 'processing':
        return ['processing', 'shipped'].includes(order.status)
      case 'fulfilled':
        return order.status === 'delivered'
      case 'abandoned':
        return order.status === 'expired' || order.status === 'cancelled' ||
          (order.status === 'pending' && order.paymentStatus !== 'paid')
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      (order.customerPhone || '').toLowerCase().includes(searchLower)
    return matchesSearch && tabFilter(order)
  })

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: BarChart3   },
    { id: 'orders',     label: 'Orders',     icon: ShoppingCart },
    { id: 'products',   label: 'Products',   icon: Package      },
    { id: 'users',      label: 'Users',      icon: Users        },
    { id: 'inventory',  label: 'Inventory',  icon: Warehouse    },
    { id: 'finance',    label: 'Finance',    icon: LineChart    },
    { id: 'analytics',  label: 'Analytics',  icon: TrendingUp   },
    { id: 'discounts',  label: 'Discounts',  icon: Tag          },
  ]

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    lowStockProducts: products.filter(p => !p.in_stock).length
  }

  // Today-scoped metrics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const ordersToday = orders.filter(o => new Date(o.date) >= todayStart)
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0)

  // Low stock = products with at least one size where qty > 0 && qty <= 3
  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      const sizeStock = p.size_stock || {}
      const sizes = (p.sizes && p.sizes.length > 0) ? p.sizes : Object.keys(sizeStock)
      if (sizes.length === 0) return (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 3
      let totalQty = 0
      let hasLow = false
      sizes.forEach(size => {
        const qty = sizeStock[size] || 0
        totalQty += qty
        if (qty > 0 && qty <= 3) hasLow = true
      })
      return totalQty > 0 && hasLow
    }).length
  }, [products])

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
          className="py-8 flex items-center justify-between border-b border-gray-200 mb-6"
        >
          <div>
            <h1 className="text-3xl font-chilanka font-normal text-gray-900 capitalize">
              {activeTab === 'discounts' ? 'Discount Codes' : activeTab === 'overview' ? 'Overview' : activeTab}
            </h1>
          </div>
          <div>
            {activeTab === 'orders' && (
              <button
                onClick={() => navigate('/new-order')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#DEAD6F] hover:bg-[#d4a83d] text-black font-semibold rounded-xl shadow-sm transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span>New Order</span>
              </button>
            )}
            {activeTab === 'products' && (
              <button
                onClick={() => setShowAddProductForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#DEAD6F] hover:bg-[#d4a83d] text-black font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
            {activeTab === 'discounts' && (
              <button
                onClick={() => setShowDiscountForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#DEAD6F] hover:bg-[#d4a83d] text-black font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Code</span>
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar — hidden on mobile, visible on md+ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:block md:col-span-1"
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
                          onClick={() => {
                            if (tab.id === 'finance') {
                              navigate('/admin/finance');
                            } else {
                              handleSetTab(tab.id as AdminTab);
                            }
                          }}
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
            className="md:col-span-3 pb-16 md:pb-0"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Task 3: 2×2 Metric Grid */}
                <MetricGrid cols={2}>
                  <div className="bg-white rounded-lg shadow-sm p-5 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue Today</p>
                        {isLoading
                          ? <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
                          : <p className="text-xl font-bold text-gray-900">{formatPrice(revenueToday)}</p>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-5 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Orders Today</p>
                        {isLoading
                          ? <div className="h-7 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                          : <p className="text-xl font-bold text-gray-900">{ordersToday.length}</p>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-5 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Customers</p>
                        {isLoading
                          ? <div className="h-7 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                          : <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-5 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Low Stock</p>
                        <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
                      </div>
                    </div>
                  </div>
                </MetricGrid>

                {/* Task 4: Recent Orders — plain data list */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                  </div>
                  <div className="divide-y">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                          <div className="space-y-1.5">
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                            <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
                          </div>
                          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                        </div>
                      ))
                    ) : (
                      <>
                        {orders.length === 0 && (
                          <p className="p-4 text-sm text-gray-400">No orders yet.</p>
                        )}
                        {orders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{order.customerName}</p>
                              <p className="text-xs text-gray-500 capitalize">{order.status} · {timeAgo(order.date)}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4 shrink-0">
                              <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                              <button
                                onClick={() => setSelectedOrderId(order.id)}
                                className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <OrderDetailDrawer
                  orderId={selectedOrderId}
                  onClose={() => setSelectedOrderId(null)}
                  onOrderUpdated={fetchData}
                />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">

                {/* Orders Summary Stats */}
                <MetricGrid cols={4}>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Total Orders</span>
                    {isLoading
                      ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2" />
                      : <span className="text-2xl font-bold text-gray-900 mt-2">{orders.length}</span>
                    }
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Pending Count</span>
                    {isLoading
                      ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-2" />
                      : <span className="text-2xl font-bold text-orange-600 mt-2">{orders.filter(o => o.status === 'pending').length}</span>
                    }
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Delivered Count</span>
                    {isLoading
                      ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-2" />
                      : <span className="text-2xl font-bold text-green-600 mt-2">{orders.filter(o => o.status === 'delivered').length}</span>
                    }
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
                    <span className="text-gray-500 text-sm font-medium">Total Revenue (GH₵)</span>
                    {isLoading
                      ? <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                      : <span className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}</span>
                    }
                  </div>
                </MetricGrid>

                {/* Filters & Header */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto w-full md:w-auto overflow-x-auto">
                      {(['fulfil', 'processing', 'fulfilled', 'abandoned'] as const).map(tab => {
                        let count = 0;
                        if (tab === 'fulfil') {
                          count = orders.filter(o => o.paymentStatus === 'paid' && ['pending', 'confirmed'].includes(o.status)).length;
                        } else if (tab === 'processing') {
                          count = orders.filter(o => ['processing', 'shipped'].includes(o.status)).length;
                        } else if (tab === 'fulfilled') {
                          count = orders.filter(o => o.status === 'delivered').length;
                        } else if (tab === 'abandoned') {
                          count = orders.filter(o => o.status === 'expired' || o.status === 'cancelled' || (o.status === 'pending' && o.paymentStatus !== 'paid')).length;
                        }
                          
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

                              {order.customerPhone && order.customerPhone !== 'Unknown' && (
                                <a
                                  href={`https://wa.me/${formatWhatsAppPhone(order.customerPhone)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 shadow-sm bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition"
                                >
                                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.532 5.854L.054 23.447a.5.5 0 0 0 .606.606l5.598-1.479A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.045-1.375l-.361-.214-3.742.988.996-3.648-.235-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/>
                                  </svg>
                                  WhatsApp Customer
                                </a>
                              )}

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
                <MetricGrid cols={4}>
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
                </MetricGrid>

                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
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
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setRestockModalProduct(product)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold rounded-lg transition-colors border border-primary-200">
                                    <Package className="w-4 h-4" /> Restock
                                  </button>
                                  <button
                                    onClick={() => setAdjustStockModalProduct(product)}
                                    title="Adjust / correct stock levels"
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-colors border border-amber-200"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
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
                {isLoading ? (
                  <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-6 py-4 flex items-center gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                          <div className="h-3 w-56 bg-gray-100 animate-pulse rounded" />
                        </div>
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory Ledger</h2>
                <InventoryLog />
              </div>
            )}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <ProfitLoss />
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Expense Logger</h2>
                  <ExpenseLogger />
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

            {/* Discounts Tab */}
            {activeTab === 'discounts' && <DiscountCodesTab showForm={showDiscountForm} setShowForm={setShowDiscountForm} />}
          </motion.div>
        </div>

        {/* Mobile bottom tab bar — shared component, visible only on md-down */}
        <AdminBottomTabBar />

      {showAddProductForm && (
        <AddProductForm onClose={() => setShowAddProductForm(false)} />
      )}
      
      {stockModalProduct && (
        <AddStockModal product={stockModalProduct} onClose={() => setStockModalProduct(null)} />
      )}

      {restockModalProduct && (
        <RestockModal
          product={restockModalProduct}
          onClose={() => setRestockModalProduct(null)}
          onSuccess={() => { refreshProducts(); setRestockModalProduct(null) }}
        />
      )}

      {adjustStockModalProduct && (
        <AdjustStockModal
          product={adjustStockModalProduct}
          onClose={() => setAdjustStockModalProduct(null)}
          onSuccess={() => { refreshProducts(); setAdjustStockModalProduct(null) }}
        />
      )}
      </div>
    </motion.div>
  )
}

export default AdminDashboard
