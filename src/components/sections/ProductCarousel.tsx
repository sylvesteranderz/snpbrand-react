import { ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import { motion } from 'framer-motion'
import ProductCard from '../ProductCard'
import { products } from '../../utils/data'
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
  // Filter products by category if specified
  const filteredProducts = category 
    ? products.filter(product => product.category === category)
    : products

  // Apply limit if specified
  const displayProducts = limit 
    ? filteredProducts.slice(0, limit)
    : filteredProducts

  return (
    <section className={`py-12 ${className}`}>
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
              className="btn-outline-dark inline-flex items-center space-x-2"
            >
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Products Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="products-carousel"
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
