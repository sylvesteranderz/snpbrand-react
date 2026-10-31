import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/hooks/useAuthSupabase'
import PulseBar from '@/features/admin/components/PulseBar'

const AdminHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on location change
  useEffect(() => {
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 overflow-visible ${
          isScrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-black shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-3 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            {/* Wordmark logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/admin"
                className="flex items-center text-white font-chilanka text-2xl font-black tracking-widest py-2"
              >
                SNP
              </Link>
            </motion.div>

            {/* Profile Dropdown */}
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
                          to="/"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                        >
                          <svg
                            className="w-5 h-5 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span>Storefront</span>
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                        >
                          <User className="w-5 h-5" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-500 transition-colors duration-200"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Link>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      <PulseBar />
    </>
  )
}

export default AdminHeader
