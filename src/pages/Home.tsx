import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '../components/sections/HeroSection'
import ProductCarousel from '../components/sections/ProductCarousel'
import ProductGrid from '../components/sections/ProductGrid'
import BannerSection from '../components/sections/BannerSection'
import TestimonialSection from '../components/sections/TestimonialSection'
import BlogSection from '../components/sections/BlogSection'
import ServiceSection from '../components/sections/ServiceSection'
import InstagramSection from '../components/sections/InstagramSection'
import NewsletterSection from '../components/sections/NewsletterSection'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for animations
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Slippers Section */}
      <ProductCarousel
        title="Slippers"
        category="slippers"
        showViewAll={true}
        className="my-8"
      />

      {/* Apparel Section */}
      <ProductGrid
        title="Apparel"
        category="apparel"
        showFilters={true}
        showViewAll={true}
        className="my-8"
      />

      {/* Banner Section */}
      <BannerSection
        title="Clearance sale !!!"
        subtitle="Upto 40% off"
        image="/images/banner-img2.png"
        buttonText="Shop Now"
        className="my-8"
      />

      {/* Testimonials */}
      <TestimonialSection className="my-8" />

      {/* Best Selling Products */}
      <ProductCarousel
        title="Best selling products"
        showViewAll={true}
        className="my-8"
      />

      {/* Newsletter */}
      <NewsletterSection className="my-8" />

      {/* Blog Section */}
      <BlogSection className="my-8" />

      {/* Services */}
      <ServiceSection className="my-8" />

      {/* Instagram */}
      <InstagramSection className="my-8" />
    </motion.div>
  )
}

export default Home
