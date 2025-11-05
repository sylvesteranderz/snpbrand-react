import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Account from './pages/Account'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import AnimatedSlipperDemo from './pages/AnimatedSlipperDemo'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './hooks/useCartSupabase'
import { WishlistProvider } from './hooks/useWishlistSupabase'
import { AuthProvider } from './hooks/useAuthSupabase'
import { ProductProvider } from './hooks/useProductsSupabase'

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
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
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
