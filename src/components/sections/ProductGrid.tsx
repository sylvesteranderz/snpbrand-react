import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '../ProductCard'
import { useProducts } from '../../hooks/useProductsSupabase'
import { categories } from '../../utils/data'

interface ProductGridProps {
  title: string
  category?: string
  showFilters?: boolean
  showViewAll?: boolean
  className?: string
}

const ProductGrid = ({ 
  title, 
  category, 
  showFilters = false, 
  showViewAll = false, 
  className = '' 
}: ProductGridProps) => {
  const { products } = useProducts()
  const [activeFilter, setActiveFilter] = useState('all')

  // Filter products by category and active filter
  const filteredProducts = products.filter(product => {
    const categoryMatch = !category || product.category === category
    const filterMatch = activeFilter === 'all' || product.category === activeFilter
    return categoryMatch && filterMatch
  })

  const filterButtons = showFilters ? categories : []

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <h2 className="text-3xl lg:text-4xl font-chilanka font-normal text-gray-900 mb-4 md:mb-0">
            {title}
          </h2>
          {showViewAll && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline-dark inline-flex items-center space-x-2"
            >
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Filter Buttons */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-4 mb-8"
          >
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`filter-button ${
                  activeFilter === filter.id ? 'active' : ''
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="products-grid w-full"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="col-span-1 w-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg">
              No products found for the selected filter.
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid
