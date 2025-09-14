import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Quote } from 'lucide-react'
import { testimonials } from '../../utils/data'
import 'swiper/css'
import 'swiper/css/pagination'

interface TestimonialSectionProps {
  className?: string
}

const TestimonialSection = ({ className = '' }: TestimonialSectionProps) => {
  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active'
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            className="testimonial-swiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex flex-col lg:flex-row items-center">
                    {/* Quote Icon */}
                    <div className="w-16 lg:w-24 mb-8 lg:mb-0 lg:mr-8">
                      <Quote className="w-16 h-16 lg:w-24 lg:h-24 text-primary-200 mx-auto" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <blockquote className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-6 font-montserrat">
                        "{testimonial.content}"
                      </blockquote>
                      <div className="text-gray-900 font-medium">
                        - {testimonial.name}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialSection
