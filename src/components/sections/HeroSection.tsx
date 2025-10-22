import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Star, Shield, Truck, Heart } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, EffectFade } from 'swiper/modules'
import TypewriterText from '../TypewriterText'
import AnimatedBackground from '../AnimatedBackground'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const HeroSection = () => {

  const slides = [
    {
      id: 1,
      title: 'Step With Style',
      titleHighlight: 'Today!',
      subtitle: 'Premium Slippers Collection',
      description: 'Discover our exclusive range of comfortable and stylish slippers designed for modern living.',
      image: '/images/SnPimage.jpg',
      buttonText: 'Explore Collection',
      features: ['Free Shipping', 'Premium Quality', '30-Day Returns']
    },
    {
      id: 2,
      title: 'Fashion Forward',
      titleHighlight: 'Apparel',
      subtitle: 'Trendy Clothing Line',
      description: 'From casual wear to formal attire, find the perfect outfit for every occasion.',
      image: '/images/image2.png',
      buttonText: 'Shop Now',
      features: ['Latest Trends', 'Comfortable Fit', 'Eco-Friendly']
    },
    {
      id: 3,
      title: 'Best Destination for',
      titleHighlight: 'Your Style',
      subtitle: 'Complete Wardrobe Solution',
      description: 'Everything you need for a complete wardrobe makeover in one place.',
      image: '/images/image3.png',
      buttonText: 'Start Shopping',
      features: ['Curated Selection', 'Expert Styling', 'Personal Service']
    }
  ]

  const typewriterTexts = [
    "Step With Style Today!",
    "Fashion Forward Apparel",
    "Best Destination for Your Style",
    "Premium Quality Products",
    "Trendy & Comfortable"
  ]

  useEffect(() => {
    // Component loaded
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active'
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          onSlideChange={(_swiper) => {
            // Handle slide change if needed
          }}
          className="main-swiper h-screen"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className="flex flex-col lg:flex-row items-center min-h-screen py-20">
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="w-full lg:w-1/2 px-4 lg:px-12 z-20"
                >
                  <div className="max-w-2xl">
                    {/* Subtitle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-primary-600 text-lg font-medium uppercase tracking-wider mb-4"
                    >
                      {slide.subtitle}
                    </motion.div>
                    
                    {/* Main Title with Typewriter Effect */}
                    <div className="mb-6">
                      {index === 0 ? (
                        <TypewriterText
                          texts={typewriterTexts}
                          speed={100}
                          deleteSpeed={50}
                          pauseTime={2000}
                          className="text-5xl lg:text-7xl xl:text-8xl font-chilanka font-normal leading-tight"
                          highlightWords={['Style', 'Today', 'Fashion', 'Forward', 'Apparel', 'Best', 'Destination', 'Premium', 'Quality', 'Trendy', 'Comfortable']}
                          highlightColor="text-primary-500"
                        />
                      ) : (
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="text-5xl lg:text-7xl xl:text-8xl font-chilanka font-normal leading-tight"
                        >
                          {slide.title}{' '}
                          <span className="text-primary-500">
                            {slide.titleHighlight}
                          </span>
                        </motion.h1>
                      )}
                    </div>
                    
                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="text-xl text-gray-600 mb-8 leading-relaxed"
                    >
                      {slide.description}
                    </motion.p>

                    {/* Features */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="flex flex-wrap gap-4 mb-8"
                    >
                      {slide.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 1 + featureIndex * 0.1 }}
                          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                        >
                          <Star className="w-4 h-4 text-primary-500" />
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                      >
                        <span>{slide.buttonText}</span>
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-outline-primary inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                      >
                        <Heart className="w-5 h-5" />
                        <span>Add to Wishlist</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: 100, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="w-full lg:w-1/2 px-4 lg:px-12 z-20"
                >
                  <div className="relative">
                    {/* Floating Elements */}
                    <motion.div
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-10 -left-10 w-20 h-20 bg-primary-200 rounded-full opacity-60 blur-sm"
                    />
                    <motion.div
                      animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute -bottom-10 -right-10 w-16 h-16 bg-accent-200 rounded-full opacity-60 blur-sm"
                    />
                    
                    {/* Main Image */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="circle-image-wrapper mx-auto">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="circle-image animate-float"
                        />
                      </div>
                      
                      {/* Image Glow Effect */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-2xl -z-10"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Floating Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="fixed bottom-8 right-8 z-30 flex flex-col space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Truck className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-accent-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Shield className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  )
}

export default HeroSection