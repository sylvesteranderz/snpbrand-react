import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronDown, Footprints, Shirt, Grid, Phone, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import CartSidebar from './CartSidebar'
import SearchSidebar from './SearchSidebar'
import { categories } from '../utils/data'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const location = useLocation()
  const { state: cartState } = useCart()
  const { state: wishlistState } = useWishlist()

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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-sm'
      }`}>
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+233535257601</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>snpslides@gmail.com</span>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <span className="font-medium">Free shipping on orders over ₵50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                  className="h-16 w-auto"
                />
              </Link>
            </motion.div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <form className="flex items-center bg-gray-50 rounded-full px-4 py-2 border-2 border-transparent focus-within:border-primary-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
                  />
                  <button 
                    type="submit" 
                    className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Desktop Navigation & Icons */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link 
                to="/account" 
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200"
              >
                <User className="w-6 h-6" />
              </Link>
              <Link 
                to="/wishlist" 
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200 relative"
              >
                <Heart className="w-6 h-6" />
                {wishlistState.items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {wishlistState.items.length}
                  </motion.span>
                )}
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartState.itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cartState.itemCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200"
              >
                <Search className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartState.itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-600"
                        layoutId="activeTab"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('categories')}
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4" />
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
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop?category=${category.id}`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          {getCategoryIcon(category.id)}
                          <div className="flex-1">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.count} items</div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container mx-auto px-4 py-6">
                <nav className="space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Categories */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-3 px-4">Categories</div>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/shop?category=${category.id}`}
                        className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
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
                  
                  {/* Mobile Account Links */}
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to="/account"
                      className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Account</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Wishlist ({wishlistState.items.length})</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-32"></div>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header