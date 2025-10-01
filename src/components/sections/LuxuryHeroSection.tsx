import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Star, Shield, Truck, Heart, ArrowRight, Play } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules'
import TypewriterText from '../TypewriterText'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/css/parallax'

const LuxuryHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const slides = [
    {
      id: 1,
      title: 'Step With Style',
      titleHighlight: 'Today!',
      subtitle: 'Premium Slippers Collection',
      description: 'Discover our exclusive range of comfortable and stylish slippers designed for modern living.',
      image: '/images/SnPimage.jpg',
      buttonText: 'Explore Collection',
      features: ['Free Shipping', 'Premium Quality', '30-Day Returns'],
      bgGradient: 'from-purple-900 via-blue-900 to-indigo-900'
    },
    {
      id: 2,
      title: 'Fashion Forward',
      titleHighlight: 'Apparel',
      subtitle: 'Trendy Clothing Line',
      description: 'From casual wear to formal attire, find the perfect outfit for every occasion.',
      image: '/images/image2.png',
      buttonText: 'Shop Now',
      features: ['Latest Trends', 'Comfortable Fit', 'Eco-Friendly'],
      bgGradient: 'from-rose-900 via-pink-900 to-red-900'
    },
    {
      id: 3,
      title: 'Best Destination for',
      titleHighlight: 'Your Style',
      subtitle: 'Complete Wardrobe Solution',
      description: 'Everything you need for a complete wardrobe makeover in one place.',
      image: '/images/image3.png',
      buttonText: 'Start Shopping',
      features: ['Curated Selection', 'Expert Styling', 'Personal Service'],
      bgGradient: 'from-emerald-900 via-teal-900 to-cyan-900'
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
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)`
        }}
      />
      

      {/* Main Content */}
      <div className="relative z-10">
        <Swiper
          modules={[Autoplay, EffectFade, Parallax]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          parallax={true}
          fadeEffect={{
            crossFade: true
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          className="main-swiper h-screen relative"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className="flex flex-col lg:flex-row items-center min-h-screen py-8 lg:py-20 relative z-10">
                {/* Image - Show first on mobile */}
                <motion.div
                  initial={{ opacity: 0, x: 100, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="w-full lg:w-1/2 px-4 lg:px-12 z-20 relative order-1 lg:order-2"
                >
                  <div className="relative">
                    {/* Main Image Container */}
                    <div className="relative z-10">
                      {/* Main Image */}
                      <div className="circle-image-wrapper mx-auto relative z-10">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="circle-image relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content - Show second on mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="w-full lg:w-1/2 px-4 lg:px-12 z-30 relative order-2 lg:order-1"
                >
                  <div className="max-w-2xl relative z-30 hero-content">
                    {/* Subtitle with luxury styling */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-primary-400 text-lg font-medium uppercase tracking-wider mb-4 flex items-center hero-subtitle"
                    >
                      <div className="w-8 h-px bg-primary-400 mr-4"></div>
                      {slide.subtitle}
                    </motion.div>
                    
                    {/* Main Title with Typewriter Effect */}
                    <div className="mb-6 hero-title">
                      {index === 0 ? (
                        <TypewriterText
                          texts={typewriterTexts}
                          speed={80}
                          deleteSpeed={40}
                          pauseTime={2500}
                          className="text-6xl lg:text-8xl xl:text-9xl font-chilanka font-normal leading-tight text-white hero-text"
                          highlightWords={['Style', 'Today', 'Fashion', 'Forward', 'Apparel', 'Best', 'Destination', 'Premium', 'Quality', 'Trendy', 'Comfortable']}
                          highlightColor="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400"
                        />
                      ) : (
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="text-6xl lg:text-8xl xl:text-9xl font-chilanka font-normal leading-tight text-white hero-text"
                        >
                          {slide.title}{' '}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
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
                      className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg hero-description"
                    >
                      {slide.description}
                    </motion.p>

                    {/* Features */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="flex flex-wrap gap-4 mb-8 hero-features"
                    >
                      {slide.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 1 + featureIndex * 0.1 }}
                          className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                        >
                          <Star className="w-4 h-4 text-primary-400" />
                          <span className="text-sm font-medium text-white">{feature}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-4 hero-buttons"
                    >
                      <motion.button
                        whileHover={{ 
                          scale: 1.05, 
                          boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)" 
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center space-x-2 shadow-2xl"
                      >
                        <span>{slide.buttonText}</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center space-x-2 backdrop-blur-md bg-white/10"
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch Video</span>
                      </motion.button>
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
        className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full shadow-2xl flex items-center justify-center backdrop-blur-md"
        >
          <Truck className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-full shadow-2xl flex items-center justify-center backdrop-blur-md"
        >
          <Shield className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default LuxuryHeroSection
