import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '../components/sections/HeroSection'
import ProductCarousel from '../components/sections/ProductCarousel'
import ProductGrid from '../components/sections/ProductGrid'
import CategorySection from '../components/sections/CategorySection'
import BannerSection from '../components/sections/BannerSection'
import TestimonialSection from '../components/sections/TestimonialSection'
import BlogSection from '../components/sections/BlogSection'
import ServiceSection from '../components/sections/ServiceSection'
import InstagramSection from '../components/sections/InstagramSection'
import NewsletterSection from '../components/sections/NewsletterSection'
import LoadingScreen from '../components/LoadingScreen'
import LuxuryLoader from '../components/LuxuryLoader'
import ScrollAnimation from '../components/ScrollAnimation'
import LuxuryHeroSection from '../components/sections/LuxuryHeroSection'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LuxuryLoader onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {/* Hero Section */}
        <LuxuryHeroSection />

        {/* Category Section */}
        <ScrollAnimation direction="up" delay={0.2}>
          <CategorySection className="my-8" />
        </ScrollAnimation>

        {/* Featured Slippers */}
        <ScrollAnimation direction="left" delay={0.1}>
          <ProductCarousel
            title="Featured Slippers"
            category="slippers"
            showViewAll={true}
            className="my-8"
          />
        </ScrollAnimation>

        {/* Featured Apparel */}
        <ScrollAnimation direction="right" delay={0.1}>
          <ProductCarousel
            title="Featured Apparel"
            category="apparel"
            showViewAll={true}
            className="my-8"
          />
        </ScrollAnimation>

        {/* Banner Section */}
        <ScrollAnimation direction="up" delay={0.2}>
          <BannerSection
            title="Clearance sale !!!"
            subtitle="Upto 40% off"
            image="/images/banner-img2.png"
            buttonText="Shop Now"
            className="my-8"
          />
        </ScrollAnimation>

        {/* Testimonials */}
        <ScrollAnimation direction="fade" delay={0.3}>
          <TestimonialSection className="my-8" />
        </ScrollAnimation>

        {/* Best Selling Products */}
        <ScrollAnimation direction="up" delay={0.1}>
          <ProductCarousel
            title="Best selling products"
            showViewAll={true}
            className="my-8"
          />
        </ScrollAnimation>

        {/* Newsletter */}
        <ScrollAnimation direction="fade" delay={0.2}>
          <NewsletterSection className="my-8" />
        </ScrollAnimation>

        {/* Blog Section */}
        <ScrollAnimation direction="up" delay={0.1}>
          <BlogSection className="my-8" />
        </ScrollAnimation>

        {/* Services */}
        <ScrollAnimation direction="fade" delay={0.2}>
          <ServiceSection className="my-8" />
        </ScrollAnimation>

        {/* Instagram */}
        <ScrollAnimation direction="up" delay={0.1}>
          <InstagramSection className="my-8" />
        </ScrollAnimation>
      </motion.div>
    </>
  )
}

export default Home
