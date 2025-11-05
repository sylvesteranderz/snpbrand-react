import { motion } from 'framer-motion'
import ProductCarousel from '../components/sections/ProductCarousel'
import CategorySection from '../components/sections/CategorySection'
import BannerSection from '../components/sections/BannerSection'
import ScrollAnimation from '../components/ScrollAnimation'
import LuxuryHeroSection from '../components/sections/LuxuryHeroSection'
// import AnimatedOutfitSection from '../components/sections/AnimatedOutfitSection'

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        {/* Hero Section */}
        <LuxuryHeroSection />
         {/* Best Selling Products */}
        <ScrollAnimation direction="up" delay={0.1}>
          <ProductCarousel
            title="Best selling products"
            showViewAll={true}
            className="mt-0 mb-8"
          />
        </ScrollAnimation>

        {/* Category Section */}
        {/* <ScrollAnimation direction="up" delay={0.2}> */}
          <CategorySection className="my-6 sm:my-8" />
        {/* </ScrollAnimation> */}

        {/* Animated Outfit Section
        <AnimatedOutfitSection /> */}

        {/* Featured Slippers */}
        {/* <ScrollAnimation direction="left" delay={0.1}> */}
          <ProductCarousel
            title="Featured Slippers"
            category="slippers"
            showViewAll={true}
            className="my-8"
          />
        {/* </ScrollAnimation> */}

        {/* Featured Apparel */}
        {/* <ScrollAnimation direction="right" delay={0.1}> */}
          <ProductCarousel
            title="Featured Apparel"
            category="apparel"
            showViewAll={true}
            className="my-8"
          />
        {/* </ScrollAnimation> */}

        {/* All Products Grid Section
        <ScrollAnimation direction="up" delay={0.2}>
          <div className="bg-gray-50 py-12 sm:py-16 overflow-x-hidden all-products-section">
            <ProductGrid
              title="All Products"
              showViewAll={true}
              className="my-0"
            />
          </div>
        </ScrollAnimation> */}

        {/* Banner Section */}
        <ScrollAnimation direction="up" delay={0.2}>
          <div className="max-w-5xl mx-auto">
          <BannerSection
            title="Clearance sale !!!"
            subtitle="Up to 40% off"
            image="/images/set.png"
            buttonText="Shop Now"
            className="my-6 sm:my-8"
          />
          </div>
        </ScrollAnimation>

        {/* Testimonials
        <ScrollAnimation direction="fade" delay={0.3}>
          <TestimonialSection className="my-6 sm:my-8" />
        </ScrollAnimation> */}

       

        {/* Newsletter
        <ScrollAnimation direction="fade" delay={0.2}>
          <NewsletterSection className="my-6 sm:my-8" />
        </ScrollAnimation> */}

        {/* Blog Section
        <ScrollAnimation direction="up" delay={0.1}>
          <BlogSection className="my-6 sm:my-8" />
        </ScrollAnimation> */}

        {/* Services
        <ScrollAnimation direction="fade" delay={0.2}>
          <ServiceSection className="my-6 sm:my-8" />
        </ScrollAnimation> */}

        {/* Instagram
        <ScrollAnimation direction="up" delay={0.1}>
          <InstagramSection className="my-6 sm:my-8" />
        </ScrollAnimation> */}
    </motion.div>
  )
}

export default Home
