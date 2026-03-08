import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface SearchSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const SearchSidebar = ({ isOpen, onClose }: SearchSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchQuery)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Search</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="search-bar">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Here"
                      className="flex-1 px-4 py-3 text-sm"
                      autoFocus
                    />
                    <button type="submit" className="p-3 text-gray-500 hover:text-primary-500">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Search Suggestions */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Searches</h3>
                <div className="space-y-2">
                  {['Slippers', 'Hoodies', 'T-Shirts', 'Comfort', 'Style'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term)
                        handleSubmit(new Event('submit') as any)
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchSidebar
