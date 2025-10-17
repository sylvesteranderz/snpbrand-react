import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronDown, Footprints, Shirt, Grid, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../hooks/useCartSupabase'
import { useWishlist } from '../hooks/useWishlistSupabase'
import { useAuth } from '../hooks/useAuthSupabase'
import CartSidebar from './CartSidebar'
import SearchSidebar from './SearchSidebar'
import { categories } from '../utils/data'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const { itemCount: cartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()

  // Debug authentication state
  console.log('Header - Auth State:', { user, isAuthenticated })

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
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
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 overflow-visible ${
        isScrolled 
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
                  src="/images/logo.png" 
                  alt="SnP Brand Logo" 
                  className="h-12 w-auto"
                />
              </Link>
            </motion.div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <form className="flex items-center bg-gray-800 rounded-full px-3 py-1.5 border-2 border-transparent focus-within:border-yellow-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 text-white"
                  />
                  <button 
                    type="submit" 
                    className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
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
                    className={`relative font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-500'
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-yellow-500"
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
                    className="flex items-center space-x-1 px-2 py-1 text-gray-300 hover:text-yellow-500 font-medium transition-colors duration-200"
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
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
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
                    className="px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-400 rounded-full transition-all duration-200 text-sm font-medium"
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
                    className="flex items-center space-x-2 p-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
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
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
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
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/account"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <User className="w-5 h-5" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                            >
                              <Settings className="w-5 h-5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <hr className="my-2 border-gray-700" />
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              logout()
                            }}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <Link 
                to="/wishlist" 
                className="p-3 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200 relative"
              >
                <Heart className="w-6 h-6" />
                {wishlistItems.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </Link>
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-3 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-3 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200"
              >
                <Search className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-3 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Profile Icon */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
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
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
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
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/account"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <User className="w-5 h-5" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors duration-200"
                            >
                              <Settings className="w-5 h-5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <hr className="my-2 border-gray-700" />
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              logout()
                            }}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gray-900 border-t border-gray-700"
            >
              <div className="container mx-auto px-4 py-6">
                <nav className="space-y-4">
                  {/* Authentication Links - Top Priority */}
                  {!isAuthenticated && (
                    <div className="pb-4 border-b border-gray-700">
                      <Link
                        to="/login"
                        className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200 mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center space-x-3 py-3 px-4 bg-yellow-500 text-black hover:bg-yellow-400 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}
                  
                  {/* Navigation Links */}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-yellow-500 bg-yellow-500/10'
                          : 'text-gray-300 hover:text-yellow-500 hover:bg-gray-800'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Categories - Only show when logged in */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-sm font-medium text-gray-400 mb-3 px-4">Categories</div>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop?category=${category.id}`}
                          className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {getCategoryIcon(category.id)}
                          <div className="flex-1">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.count} items</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Mobile Account Links */}
                  <div className="pt-4 border-t border-gray-700">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 py-3 px-4 text-gray-300">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-black text-sm font-medium">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-xs text-gray-400">{user?.email}</div>
                          </div>
                        </div>
                        <Link
                          to="/account"
                          className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Account</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="w-5 h-5" />
                            <span>Admin</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : null}
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Wishlist ({wishlistItems.length})</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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