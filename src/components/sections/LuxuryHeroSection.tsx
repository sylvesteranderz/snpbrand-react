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
      // features: [
      //   { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      // ]
    },
    {
      id: 2,
      type: 'outfit',
      title: 'SnP BRAND',
      titleHighlight: 'Complete',
      subtitle: "Your Look",
      description: 'Style from head to toe with SnP Brand',
      buttonText: 'SHOP THE COLLECTION',
    },
    {
      id: 3,
      fullscreen: true, 
      title: 'SnP BRAND',
      titleHighlight: 'Premium',
      subtitle: "WALK DON'T HIDE",
      description: 'Style that rises to make every eye fall',
      image: '/images/SlippersBg.jpg',
      mobileImage: '/images/Background2.jpg', // Add mobile-specific image
      buttonText: 'SHOP NOW',
      // features: [
      //   { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      // ]
    },
    {
      id: 4,
      fullscreen: true,
      title: 'SnP BRAND',
      titleHighlight: 'SLIDES',
      subtitle: "Feel and walk confidently",
      description: 'Style that rises to make every eye fall',
      image: '/images/FeetBackground.jpg',
      mobileImage: '/images/FeetBackground2.jpg', // Add mobile-specific image
      buttonText: 'SHOP NOW',
      features: [
        { id: 1, icon: <Star className="w-6 h-6" />, text: 'Premium Quality' },
        // { id: 2, icon: <Shield className="w-6 h-6" />, text: 'Comfortable Fit' },
        // { id: 3, icon: <Truck className="w-6 h-6" />, text: 'Fast Delivery' }
      ]
    }
    
  ]

  return (
    <section className="luxury-hero-section relative min-h-screen  ">
      <div className="main-swiper  min-h-screen overflow-hidden ">
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
          className="main-swiper w-full relative"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              {slide.type === 'outfit' ? (
                // Outfit Slide - Enhanced with better mobile support
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center py-6 md:py-12 overflow-hidden">
                  <div className="container mx-auto px-4">
                    {/* Title Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-center mb-4 md:mb-8"
                    >
                      <motion.h2 
                        className="text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-wider mb-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: 0.2,
                          type: "spring",
                          stiffness: 100
                        }}
                      >
                        <motion.span 
                          className="text-black"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          {slide.title}
                        </motion.span>{' '}
                        <motion.span 
                          className="text-yellow-500"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          whileHover={{ scale: 1.1, rotate: 2 }}
                        >
                          {slide.titleHighlight}
                        </motion.span>
                      </motion.h2>
                      <motion.h1 
                        className="text-4xl sm:text-5xl md:text-7xl font-black text-black mb-3 md:mb-4"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 1, 
                          delay: 0.4,
                          type: "spring",
                          stiffness: 120
                        }}
                      >
                        {slide.subtitle.split(' ').map((word, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.6, 
                              delay: 0.6 + (index * 0.1),
                              type: "spring",
                              stiffness: 120
                            }}
                            className="inline-block mr-2 md:mr-3"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.h1>
                      <motion.p 
                        className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      >
                        {slide.description}
                      </motion.p>
                    </motion.div>

                    {/* Animated Outfit Items */}
                    <div className="flex justify-center items-center mb-4 md:mb-8">
                      <div className="relative flex flex-col items-center gap-1 md:gap-2 w-full max-w-[280px] sm:max-w-sm md:max-w-md px-4">
                        
                        {/* Background decorative elements */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0.1, scale: 1 }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-yellow-500 rounded-full blur-3xl pointer-events-none"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0.1, scale: 1 }}
                          transition={{ duration: 1.5, delay: 0.8 }}
                          className="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-black rounded-full blur-3xl pointer-events-none"
                        />
                        
                        {/* Shirt - Top */}
                        <motion.div
                          initial={{ y: -200, opacity: 0, rotate: -10 }}
                          animate={{ y: 0, opacity: 1, rotate: 0 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: 1, 
                            ease: [0.6, 0.05, 0.01, 0.9],
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                          }}
                          whileHover={{ 
                            scale: 1.05, 
                            rotate: 2,
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                          }}
                          className="relative w-full"
                        >
                          <img
                            src="/images/BlackZipup.jpg"
                            alt="Premium Shirt"
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.8, duration: 0.5 }}
                            className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/70 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-medium shadow-lg"
                          >
                            Premium Apparel
                          </motion.div>
                        </motion.div>

                        {/* Shorts - Middle */}
                        <motion.div
                          initial={{ x: -300, opacity: 0, scale: 0.8, rotate: -15 }}
                          animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: 1.3, 
                            ease: [0.6, 0.05, 0.01, 0.9],
                            type: "spring",
                            stiffness: 120
                          }}
                          whileHover={{ 
                            scale: 1.05, 
                            rotate: -2,
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                          }}
                          className="relative w-4/5"
                        >
                          <img
                            src="/images/Shorts.png"
                            alt="Stylish Shorts"
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2.1, duration: 0.5, type: "spring" }}
                            className="absolute top-2 left-2 md:top-4 md:left-4 bg-yellow-500/90 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-medium shadow-lg"
                          >
                            Stylish Comfort
                          </motion.div>
                        </motion.div>

                        {/* Slippers - Bottom */}
                        <motion.div
                          initial={{ y: 250, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 1, 
                            delay: 1.6, 
                            type: "spring", 
                            stiffness: 200, 
                            damping: 15 
                          }}
                          whileHover={{ 
                            scale: 1.08, 
                            rotate: 3,
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                          }}
                          className="relative w-3/5"
                        >
                          <img
                            src="/images/BrownLeather1.png"
                            alt="Signature Slippers"
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 2.4, duration: 0.5, type: "spring" }}
                            className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-white/90 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-medium shadow-lg"
                          >
                            Signature Slippers
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 2.6 }}
                      className="text-center"
                    >
                      <motion.button
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 2.8,
                          type: "spring",
                          stiffness: 200
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", 
                          y: -2 
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-black text-white px-6 py-3 md:px-8 md:py-4 font-bold text-base md:text-lg uppercase tracking-wider inline-flex items-center justify-center space-x-2 shadow-2xl transition-all duration-300 rounded-sm"
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
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Regular Slide */}
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
                      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/50 via-black/40 to-transparent pointer-events-none" />
                    </>
                  )}

              <div className={`flex flex-col lg:flex-row items-center min-h-screen pt-12 pb-4 lg:pt-16 lg:pb-8 relative z-30 ${slide.id === 1 ? 'lg:justify-start justify-start' : 'justify-center'}`}>
                
                {/* Image */}
                {!slide.fullscreen && (
                  <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className={`w-full lg:w-3/5 px-4 lg:px-8 z-20 relative order-1 lg:order-2 ${slide.id === 1 ? 'ml-8 lg:ml-0 -mt-8 lg:-mt-12' : ''}`}
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
                  className={`w-full ${slide.fullscreen ? 'lg:w-full' : 'lg:w-2/5'} px-4 lg:px-8 z-50 relative order-2 lg:order-1 ${slide.id === 1 ? 'lg:ml-16 ml-4 -mt-10 lg:-mt-12"'  : 'text-center'} ${slide.fullscreen ? 'absolute inset-0 flex items-center justify-center' : ''}`}
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
                      className={`${slide.fullscreen ? 'text-white text-shadow-lg' : 'text-black'} text-5xl lg:text-6xl font-bold uppercase tracking-wider mb-2 hero-subtitle`}
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
                      className="mb-4 hero-description -mt-2"
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
                      {slide.features?.map((feature) => (
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
                </>
              )}
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
    </div>  {/* Main Content */}

     </section>
  )
}

export default LuxuryHeroSection
