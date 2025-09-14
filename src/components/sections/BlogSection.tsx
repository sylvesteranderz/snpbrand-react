import { Link } from 'react-router-dom'
import { ChevronRight, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { blogPosts } from '../../utils/data'

interface BlogSectionProps {
  className?: string
}

const BlogSection = ({ className = '' }: BlogSectionProps) => {
  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-chilanka font-normal text-gray-900 mb-4 md:mb-0">
            Latest Blog Post
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline-dark inline-flex items-center space-x-2"
          >
            <span>Read All</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300"
            >
              {/* Date Badge */}
              <div className="absolute top-4 left-4 z-10 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center space-x-2 text-primary-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden">
                <Link to={`/blog/${post.id}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>

              {/* Content */}
              <div className="p-6">
                <Link to={`/blog/${post.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-500 transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="blog-paragraph mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link
                  to={`/blog/${post.id}`}
                  className="blog-read inline-flex items-center space-x-1"
                >
                  <span>Read More</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogSection
