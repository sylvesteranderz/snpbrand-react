import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      title: 'Step With Style',
      titleHighlight: 'today!',
      subtitle: 'Save 10 - 20 % off',
      image: '/images/SnPimage.jpg',
      buttonText: 'Shop Now'
    },
    {
      id: 2,
      title: 'Step with',
      titleHighlight: 'Style',
      subtitle: 'Save 10 - 20 % off',
      image: '/images/image2.png',
      buttonText: 'Shop Now'
    },
    {
      id: 3,
      title: 'Best destination for',
      titleHighlight: 'your pets',
      subtitle: 'Save 10 - 20 % off',
      image: '/images/image3.png',
      buttonText: 'Shop Now'
    }
  ]

  return (
    <section className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          className="main-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="py-8"
              >
                <div className="flex flex-col lg:flex-row items-center">
                  {/* Image */}
                  <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="circle-image-wrapper mx-auto">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="circle-image animate-float"
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="w-full lg:w-1/2 lg:pl-12">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-center lg:text-left"
                    >
                      <div className="text-primary-500 text-lg font-montserrat uppercase mb-4 tracking-wide">
                        {slide.subtitle}
                      </div>
                      
                      <h1 className="text-4xl lg:text-6xl xl:text-7xl font-chilanka font-normal mb-6 leading-tight">
                        {slide.title}{' '}
                        <span className="text-primary-500">
                          {slide.titleHighlight}
                        </span>
                      </h1>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-outline-dark inline-flex items-center space-x-2"
                      >
                        <span>{slide.buttonText}</span>
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default HeroSection
