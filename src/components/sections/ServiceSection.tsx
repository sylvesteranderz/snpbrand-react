import { motion } from 'framer-motion'
import { ShoppingCart, UserCheck, Tag, Award } from 'lucide-react'
import { services } from '../../utils/data'

interface ServiceSectionProps {
  className?: string
}

const ServiceSection = ({ className = '' }: ServiceSectionProps) => {
  const iconMap = {
    'shopping-cart': ShoppingCart,
    'user-check': UserCheck,
    'tag': Tag,
    'award': Award,
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap]
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="mb-6">
                  <div className="service-icon mx-auto group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300">
                    <Icon className="w-8 h-8 mx-auto" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors">
                  {service.title}
                </h3>
                
                <p className="blog-paragraph">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServiceSection
