import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from '@/features/common/components/Header'
import Footer from '@/features/common/components/Footer'
import ScrollToTop from '@/features/common/components/ScrollToTop'
import Home from '@/features/home/pages/Home'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import GoogleOneTap from '@/features/auth/components/GoogleOneTap'
import { CartProvider } from '@/features/cart/hooks/useCartSupabase'
import { WishlistProvider } from '@/features/wishlist/hooks/useWishlistSupabase'
import { AuthProvider } from '@/features/auth/hooks/useAuthSupabase'
import { ProductProvider } from '@/features/products/hooks/useProductsSupabase'

// Route-level code splitting: each page downloads only when visited,
// so shoppers never download the admin dashboard code.
const Shop = lazy(() => import('@/features/products/pages/Shop'))
const ProductDetail = lazy(() => import('@/features/products/pages/ProductDetail'))
const Cart = lazy(() => import('@/features/cart/pages/Cart'))
const Checkout = lazy(() => import('@/features/checkout/pages/Checkout'))
const OrderTracking = lazy(() => import('@/features/orders/pages/OrderTracking'))
const Account = lazy(() => import('@/features/auth/pages/Account'))
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const NewOrderForm = lazy(() => import('@/features/admin/pages/NewOrderForm'))
const FinancePage = lazy(() => import('@/pages/admin/FinancePage'))
const MorePage = lazy(() => import('@/features/admin/pages/MorePage'))
const AdminHeader = lazy(() => import('@/features/admin/components/AdminHeader'))
const Login = lazy(() => import('@/features/auth/pages/Login'))
const Signup = lazy(() => import('@/features/auth/pages/Signup'))
const Orders = lazy(() => import('@/features/orders/pages/Orders'))
const Wishlist = lazy(() => import('@/features/wishlist/pages/Wishlist'))
const Blog = lazy(() => import('@/features/blog/pages/Blog'))
const Contact = lazy(() => import('@/features/common/pages/Contact'))
const AnimatedSlipperDemo = lazy(() => import('@/features/home/pages/AnimatedSlipperDemo'))
const VerificationPending = lazy(() => import('@/features/auth/pages/VerificationPending'))

const PageFallback = () => <div className="min-h-[60vh]" />

// Component to handle footer visibility
const AppContent = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Pages that render their own full-screen layout (no site chrome)
  if (location.pathname.startsWith('/new-order')) {
    return (
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route
          path="/new-order"
          element={
            <ProtectedRoute requireAdmin={true}>
              <NewOrderForm />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    )
  }

  // Pages where footer should be hidden on mobile
  const hideFooterOnMobile = [
    '/checkout',
    '/orders',
    '/order-tracking',
    '/account',
    '/order-confirmation',
    '/cart',
    '/product'
  ]

  // Check if current path should hide footer on mobile
  const shouldHideFooterOnMobile = hideFooterOnMobile.some(path =>
    location.pathname.startsWith(path)
  )

  return (
    <div className="min-h-screen bg-white">
      <GoogleOneTap />
      {isAdminRoute ? <Suspense fallback={null}><AdminHeader /></Suspense> : <Header />}
      <main className={isAdminRoute ? "admin-dashboard-root" : ""}>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<div>Order Confirmation</div>} />
          <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true} >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute requireAdmin={true} >
                <FinancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/more"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MorePage />
              </ProtectedRoute>
            }
          />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/animated-slipper" element={<AnimatedSlipperDemo />} />
        </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer className={shouldHideFooterOnMobile ? 'hidden md:block' : ''} />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <AppContent />
              <Analytics />
              <SpeedInsights />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
