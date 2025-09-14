import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

interface InstagramSectionProps {
  className?: string
}

const InstagramSection = ({ className = '' }: InstagramSectionProps) => {
  const instagramImages = [
    '/images/insta1.jpg',
    '/images/insta2.jpg',
    '/images/insta3.jpg',
    '/images/insta4.jpg',
    '/images/insta5.jpg',
    '/images/insta6.jpg',
  ]

  return (
    <section className={`py-8 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
        {instagramImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer overflow-hidden"
          >
            <img
              src={image}
              alt={`Instagram post ${index + 1}`}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default InstagramSection
