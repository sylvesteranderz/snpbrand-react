import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Parallax } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/parallax'

const LuxuryHeroSection = () => {
  const slides = [
    {
      id: 1,
      title: 'SnP BRAND',
      titleHighlight: 'Step',
      subtitle: "With Style",
      description: 'Style that rises to make every eye fall',
      image: '/images/SnPimage.png',
      buttonText: 'SHOP NOW',
      features: [
        { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      ]
    },
    {
      id: 2,
      fullscreen: true,
      title: 'SnP BRAND',
      titleHighlight: 'Premium',
      subtitle: "WALK DON'T HIDE",
      description: 'Style that rises to make every eye fall',
      image: '/images/SlippersBg.jpg',
      mobileImage: '/images/Background2.jpg', // Add mobile-specific image
      buttonText: 'SHOP NOW',
      features: [
        { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      ]
    },
    {
      id: 3,
      fullscreen: true,
      title: 'SnP BRAND',
      titleHighlight: 'SLIDES',
      subtitle: "Feel and walk confidently",
      description: 'Style that rises to make every eye fall',
      image: '/images/FeetBackground.jpg',
      mobileImage: '/images/FeetBackground.jpg', // Add mobile-specific image
      buttonText: 'SHOP NOW',
      features: [
        { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      ]
    }
  ]

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10">
        <Swiper
          modules={[Autoplay, EffectFade, Parallax]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          parallax={true}
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          className="main-swiper h-screen w-full relative"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              {/* If this slide is fullscreen, render its image as a full-viewport background */}
                {slide.fullscreen && (
                  <>
                    {/* Desktop Background */}
                    <div
                      className="hidden lg:block absolute inset-0 z-0 bg-center bg-cover bg-no-repeat hero-fullscreen-bg"
                      style={{ 
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center'
                      }}
                    />
                    {/* Mobile Background */}
                    <div
                      className="lg:hidden absolute inset-0 z-0 bg-center bg-cover bg-no-repeat hero-fullscreen-bg"
                      style={{ 
                        backgroundImage: `url(${slide.mobileImage || slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center'
                      }}
                    />
                    {/* Enhanced dark gradient overlay to improve text contrast */}
                    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/50 via-black/40 to-transparent" />
                  </>
                )}

              <div className={`flex flex-col lg:flex-row items-center min-h-screen pt-20 pb-8 lg:pt-24 lg:pb-20 relative z-30 ${slide.id === 1 ? 'lg:justify-start justify-start' : 'justify-center'}`}>
                
                {/* Image */}
                {!slide.fullscreen && (
                  <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className={`w-full lg:w-3/5 px-4 lg:px-8 z-20 relative order-1 lg:order-2 ${slide.id === 1 ? 'ml-8 lg:ml-0' : ''}`}
                  >
                  <div className="relative">
                    <div className="circle-image-wrapper mx-auto relative z-10">
                      {/* If slide is fullscreen we already use it as background, so hide the inline image */}
                      {slide.fullscreen ? null : (
                        <img
                          src={slide.image}
                          alt={`${slide.title} product`}
                          className="circle-image relative z-10 object-contain max-h-[500px] mx-auto"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className={`w-full ${slide.fullscreen ? 'lg:w-full' : 'lg:w-2/5'} px-4 lg:px-8 z-50 relative order-2 lg:order-1 ${slide.id === 1 ? 'lg:ml-16 ml-4' : 'text-center'} ${slide.fullscreen ? 'absolute inset-0 flex items-center justify-center' : ''}`}
                >
                  <div className={`max-w-2xl relative z-50 hero-content ${slide.fullscreen ? 'mx-auto text-center hero-text-overlay' : ''}`}>
                    
                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 1.2, 
                        delay: 0.3,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      className={`${slide.fullscreen ? 'text-white text-shadow-lg' : 'text-black'} text-4xl lg:text-6xl font-bold uppercase tracking-wider mb-2 hero-subtitle`}
                    >
                      <motion.span
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        {slide.title}{' '}
                      </motion.span>
                      <motion.span 
                        className={`${slide.fullscreen ? 'text-yellow-400 text-shadow-lg' : 'text-yellow-500'}`}
                        initial={{ opacity: 0, x: 30, scale: 0.5 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          duration: 1, 
                          delay: 0.8,
                          type: "spring",
                          stiffness: 120
                        }}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                      >
                        {slide.titleHighlight}
                      </motion.span>
                    </motion.div>
                    
                    {/* Tagline */}
                    <motion.div
                      initial={{ opacity: 0, y: 60, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: 0.7,
                        type: "spring",
                        stiffness: 80,
                        damping: 20
                      }}
                      className="mb-6 hero-title"
                    >
                      <motion.h1 
                        className={`text-5xl lg:text-7xl xl:text-8xl font-black leading-tight ${slide.fullscreen ? 'text-white text-shadow-xl' : 'text-black'} hero-text`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          textShadow: slide.fullscreen ? "0 0 20px rgba(255,255,255,0.5)" : "0 0 20px rgba(0,0,0,0.3)"
                        }}
                      >
                        {slide.subtitle.split(' ').map((word, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.8, 
                              delay: 1.2 + (index * 0.1),
                              type: "spring",
                              stiffness: 120
                            }}
                            className="inline-block mr-4"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.h1>
                    </motion.div>
                    
                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 1, 
                        delay: 1.5,
                        type: "spring",
                        stiffness: 100
                      }}
                      className="mb-8 hero-description"
                    >
                      <motion.div 
                        className="w-16 h-px bg-gray-300 mb-4"
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 1, delay: 1.8 }}
                      ></motion.div>
                      <motion.p 
                        className={`text-lg leading-relaxed max-w-lg ${slide.fullscreen ? 'text-white text-shadow-lg' : 'text-gray-700'}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 2,
                          type: "spring",
                          stiffness: 80
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          color: slide.fullscreen ? "#ffffff" : "#000000"
                        }}
                      >
                        {slide.description}
                      </motion.p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 1, 
                        delay: 2.2,
                        type: "spring",
                        stiffness: 120
                      }}
                      className="hero-buttons mb-8"
                    >
                      <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.5 }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                          y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-black text-white px-8 py-4 font-bold text-lg uppercase tracking-wider inline-flex items-center justify-center space-x-2 shadow-2xl transition-all duration-300"
                      >
                        <motion.span 
                          className="mr-2"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {slide.buttonText}
                        </motion.span>
                        <motion.div
                          whileHover={{ x: 5, rotate: 15 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </motion.button>
                    </motion.div>

                    {/* Features row */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.5 }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                    >
                      {slide.features.map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            {feature.icon}
                          </div>
                          <span className={`font-medium ${slide.fullscreen ? 'text-white text-shadow-md' : 'text-gray-800'}`}>{feature.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Floating Action Buttons
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          <Truck className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          <Shield className="w-6 h-6" />
        </motion.button>
      </motion.div> */}

      {/* Scroll Indicator
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-600 rounded-full mt-2"
          />
    //     </motion.div> */}
    {/* //   </motion.div> */}
    // </section>
  )
}

export default LuxuryHeroSection
