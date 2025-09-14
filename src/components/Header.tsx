import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import CartSidebar from './CartSidebar'
import SearchSidebar from './SearchSidebar'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { state: cartState } = useCart()
  const { state: wishlistState } = useWishlist()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <header className="bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-gray-50 py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Phone:</span>
                  <span>+233535257601</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Email:</span>
                  <span>snpslides@gmail.com</span>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <span className="text-primary-500 font-medium">Free shipping on orders over $50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="/images/logo.png" 
                  alt="SnP Brand Logo" 
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="search-bar w-full">
                <form className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search for more than 10,000 products"
                    className="flex-1 px-4 py-2 text-sm"
                  />
                  <button type="submit" className="p-2 text-gray-500 hover:text-primary-500">
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Desktop Navigation & Icons */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/account" className="p-2 text-gray-600 hover:text-primary-500">
                <User className="w-6 h-6" />
              </Link>
              <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary-500 relative">
                <Heart className="w-6 h-6" />
                {wishlistState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistState.items.length}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-primary-500 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartState.itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-primary-500"
              >
                <Search className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-primary-500 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartState.itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-primary-500"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Shop by Category</option>
                  <option>Slippers</option>
                  <option>Apparel</option>
                </select>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-gray-700 hover:text-primary-500 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <Link
                    to="/account"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Account</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist ({wishlistState.items.length})</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header
