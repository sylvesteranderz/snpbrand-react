import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from '@/features/common/components/Header'
import Footer from '@/features/common/components/Footer'
import ScrollToTop from '@/features/common/components/ScrollToTop'
import Home from '@/features/home/pages/Home'
import Shop from '@/features/products/pages/Shop'
import ProductDetail from '@/features/products/pages/ProductDetail'
import Cart from '@/features/cart/pages/Cart'
import Checkout from '@/features/checkout/pages/Checkout'
import OrderTracking from '@/features/orders/pages/OrderTracking'
// import Account from '@/features/auth/pages/Account'
import AdminDashboard from '@/features/admin/pages/AdminDashboard'
// import Login from '@/features/auth/pages/Login'
// import Signup from '@/features/auth/pages/Signup'
import Orders from '@/features/orders/pages/Orders'
import Wishlist from '@/features/wishlist/pages/Wishlist'
import Blog from '@/features/blog/pages/Blog'
import Contact from '@/features/common/pages/Contact'
import AnimatedSlipperDemo from '@/features/home/pages/AnimatedSlipperDemo'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
// import GoogleOneTap from '@/features/auth/components/GoogleOneTap'
// import VerificationPending from '@/features/auth/pages/VerificationPending'
import { CartProvider } from '@/features/cart/hooks/useCartSupabase'
import { WishlistProvider } from '@/features/wishlist/hooks/useWishlistSupabase'
import { AuthProvider } from '@/features/auth/hooks/useAuthSupabase'
import { ProductProvider } from '@/features/products/hooks/useProductsSupabase'

// Component to handle footer visibility
const AppContent = () => {
  const location = useLocation()

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
      {/* <GoogleOneTap /> */}
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<div>Order Confirmation</div>} />
          <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
          {/* <Route path="/account" element={<Account />} /> */}
          <Route path="/orders" element={<Orders />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          {/* <Route path="/verification-pending" element={<VerificationPending />} /> */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute /* requireAdmin={true} */>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/animated-slipper" element={<AnimatedSlipperDemo />} />
        </Routes>
      </main>
      <Footer className={shouldHideFooterOnMobile ? 'hidden md:block' : ''} />
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
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
