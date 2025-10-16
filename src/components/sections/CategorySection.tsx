import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Footprints, Shirt, Grid } from 'lucide-react'
import ProductCard from '../ProductCard'
import { products, categories, subcategories } from '../../utils/data'

interface CategorySectionProps {
  className?: string
}

const CategorySection = ({ className = '' }: CategorySectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSubcategory, setActiveSubcategory] = useState('all')

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setActiveCategory(category)
    }
  }, [searchParams])

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'slippers':
        return <Footprints className="w-6 h-6" />
      case 'apparel':
        return <Shirt className="w-6 h-6" />
      default:
        return <Grid className="w-6 h-6" />
    }
  }

  // Filter products based on active category and subcategory
  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory
    const subcategoryMatch = activeSubcategory === 'all' || product.subcategory === activeSubcategory
    return categoryMatch && subcategoryMatch
  })

  const currentCategory = categories.find(cat => cat.id === activeCategory)
  const currentSubcategories = activeCategory !== 'all' ? subcategories[activeCategory as keyof typeof subcategories] || [] : []

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-chilanka font-normal text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collection of slippers and apparel
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                setActiveSubcategory('all')
                // Update URL
                if (category.id === 'all') {
                  setSearchParams({})
                } else {
                  setSearchParams({ category: category.id })
                }
              }}
              className={`flex items-center space-x-3 px-6 py-4 rounded-lg border-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {getCategoryIcon(category.id)}
              <div className="text-left">
                <div className="font-semibold">{category.name}</div>
                <div className="text-sm opacity-75">{category.count} items</div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Subcategory Filters */}
        {currentSubcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <button
              onClick={() => setActiveSubcategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSubcategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary-100'
              }`}
            >
              All {currentCategory?.name}
            </button>
            {currentSubcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => setActiveSubcategory(subcategory.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSubcategory === subcategory.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary-100'
                }`}
              >
                {subcategory.name} ({subcategory.count})
              </button>
            ))}
          </motion.div>
        )}

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl lg:text-3xl font-chilanka font-normal text-gray-900 mb-2">
              Products
            </h1>
            <p className="text-gray-600">
              Showing {filteredProducts.length} results
            </p>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="default">Default sorting</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </motion.div>

        {/* Category Description */}
        {currentCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-gray-600 text-lg">{currentCategory.description}</p>
          </motion.div>
        )}

        {/* Products Grid - 2 columns layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4 sm:gap-6"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg">
              No products found in this category.
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline-primary inline-flex items-center space-x-2"
          >
            <span>View All Products</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default CategorySection
