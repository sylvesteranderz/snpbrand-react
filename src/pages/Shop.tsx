import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import CategorySection from '../components/sections/CategorySection'

const Shop = () => {
  const [searchParams] = useSearchParams()
  const [, setSelectedCategory] = useState('all')

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          {/* <h1 className="text-4xl lg:text-5xl font-chilanka font-normal text-gray-900 mb-4">
            Shop
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our collection of premium slippers and fashionable apparel
          </p> */}
        </motion.div>

        {/* Category Section */}
        <CategorySection />
      </div>
    </motion.div>
  )
}

export default Shop