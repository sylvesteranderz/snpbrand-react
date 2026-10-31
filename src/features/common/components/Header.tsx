import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, ChevronDown, Footprints, Shirt, Grid, User, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/features/cart/hooks/useCartSupabase'
import { useWishlist } from '@/features/wishlist/hooks/useWishlistSupabase'
import { useAuth } from '@/features/auth/hooks/useAuthSupabase'
import CartSidebar from '@/features/cart/components/CartSidebar'
import SearchSidebar from '@/features/common/components/SearchSidebar'
import { categories } from '@/utils/data'

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount: cartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  // Debug authentication state
  // console.log('Header - Auth State:', { user, isAuthenticated })

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu, cart, and search when route changes
  useEffect(() => {
    setIsCartOpen(false)
    setIsSearchOpen(false)
    setIsProfileOpen(false)
  }, [location])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isProfileOpen && !target.closest('.profile-dropdown')) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'slippers':
        return <Footprints className="w-4 h-4" />
      case 'apparel':
        return <Shirt className="w-4 h-4" />
      default:
        return <Grid className="w-4 h-4" />
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 overflow-visible ${isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-black shadow-sm'
        }`}>


        {/* Main Header */}
        <div className="container mx-auto px-4 py-3 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="flex items-center">
                <img
                  src="/images/SnpBrandLogo2.png"
                  alt="SnP Brand Logo"
                  className="h-20 w-auto"
                />
              </Link>
            </motion.div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <form className="flex items-center bg-gray-800 rounded-full px-3 py-1.5 border-2 border-transparent focus-within:border-primary-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 text-white"
                  />
                  <button
                    type="submit"
                    className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Desktop Navigation & Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="flex items-center space-x-6 mr-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative font-medium transition-colors duration-200 ${isActive(item.href)
                        ? 'text-primary-500'
                        : 'text-gray-300 hover:text-primary-500'
                      }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-500"
                        layoutId="activeTab"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                ))}

                {/* Category Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onMouseEnter={() => setActiveDropdown('categories')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="flex items-center space-x-1 px-2 py-1 text-gray-300 hover:text-primary-500 font-medium transition-colors duration-200"
                  >
                    <span>Categories</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'categories' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setActiveDropdown('categories')}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
                      >
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/shop?category=${category.id}`}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                          >
                            {getCategoryIcon(category.id)}
                            <div className="flex-1">
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-400">{category.count} items</div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {isAuthenticated ? (
                <></>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-black hover:bg-primary-400 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Profile Dropdown - Desktop */}
              {isAuthenticated && (
                <div className="relative dropdown-container profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm hidden md:block">{user?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-black text-lg font-medium">
                                {user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{user?.name}</div>
                              <div className="text-sm text-gray-400">{user?.email}</div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/account"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                          >
                            <User className="w-5 h-5" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <Settings className="w-5 h-5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <hr className="my-2 border-gray-700" />
                          <button
                            onClick={async () => {
                              setIsProfileOpen(false)
                              await logout()
                            }}
                            disabled={isLoading}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link
                to="/wishlist"
                className="p-3 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 relative"
              >
                <Heart className="w-6 h-6" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </Link>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-3 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-3 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Profile/Auth Icon */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200"
                    title="Login or Create Account"
                  >
                    <User className="w-6 h-6" />
                  </button>
                )}

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-black text-lg font-medium">
                                  {user?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-white">{user?.name}</div>
                                <div className="text-sm text-gray-400">{user?.email}</div>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              to="/account"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <User className="w-5 h-5" />
                              <span>My Account</span>
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              <span>My Orders</span>
                            </Link>
                            <Link
                              to="/wishlist"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <Heart className="w-5 h-5" />
                              <span>Wishlist</span>
                            </Link>
                            {user?.role === 'admin' && (
                              <Link
                                to="/admin"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                              >
                                <Settings className="w-5 h-5" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}
                            <hr className="my-2 border-gray-700" />
                            <button
                              onClick={async () => {
                                setIsProfileOpen(false)
                                await logout()
                                navigate('/')
                              }}
                              disabled={isLoading}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-300" />
                              </div>
                              <div>
                                <div className="font-medium text-white">Welcome!</div>
                                <div className="text-sm text-gray-400">Sign in or create account</div>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              to="/login"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <User className="w-5 h-5" />
                              <span>Login</span>
                            </Link>
                            <Link
                              to="/signup"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                            >
                              <User className="w-5 h-5" />
                              <span>Create Account</span>
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>


      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header