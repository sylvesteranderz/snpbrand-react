import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface BannerSectionProps {
  title: string
  subtitle: string
  image: string
  buttonText: string
  className?: string
  reverse?: boolean
}

const BannerSection = ({ 
  title, 
  subtitle, 
  image, 
  buttonText, 
  className = '',
  reverse = false
}: BannerSectionProps) => {
  return (
    <section className={`bg-gray-50 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}
        >
          {/* Image */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img
                src={image}
                alt={title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>

          {/* Content */}
          <div className={`w-full lg:w-1/2 ${reverse ? 'lg:pr-12' : 'lg:pl-12'}`}>
            <motion.div
              initial={{ opacity: 0, x: reverse ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="text-primary-500 text-lg font-montserrat uppercase mb-4 tracking-wide">
                {subtitle}
              </div>
              
              <h2 className="text-3xl lg:text-5xl xl:text-6xl font-chilanka font-normal mb-6 leading-tight">
                {title}
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline-dark inline-flex items-center space-x-2"
              >
                <Link to="/products"> 
                <span>{buttonText}</span>
                <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default BannerSection
