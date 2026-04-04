import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import { motion } from 'framer-motion'
import ProductCard from '@/features/products/components/ProductCard'
import { useProducts } from '@/features/products/hooks/useProductsSupabase'
import 'swiper/css'
import 'swiper/css/navigation'

interface ProductCarouselProps {
  title: string
  category?: string
  showViewAll?: boolean
  className?: string
  limit?: number
}

const ProductCarousel = ({
  title,
  category,
  showViewAll = false,
  className = '',
  limit
}: ProductCarouselProps) => {
  const { products, isLoading } = useProducts()
  const navigate = useNavigate()

  // Filter products by category if specified
  const filteredProducts = category
    ? products.filter(product => product.category === category)
    : products

  // Apply limit if specified
  const displayProducts = limit
    ? filteredProducts.slice(0, limit)
    : filteredProducts

  if (isLoading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            {showViewAll && <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (displayProducts.length === 0) {
    return null
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
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
              onClick={() => navigate(category ? `/shop?category=${category}` : '/shop')}
              className="btn-outline-primary inline-flex items-center space-x-2"
            >
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* ✅ Products Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            className="products-carousel"
            style={{ overflow: 'visible' }}
          >
            {displayProducts.map((product, index) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductCarousel
