import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react'
import { contactInfo } from '../utils/data'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About us', href: '/about' },
    { name: 'Offer', href: '/offers' },
    { name: 'Services', href: '/services' },
    { name: 'Contact Us', href: '/contact' },
  ]

  const helpCenter = [
    { name: 'FAQs', href: '/faq' },
    { name: 'Payment', href: '/payment' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'Checkout', href: '/checkout' },
    { name: 'Delivery Information', href: '/delivery' },
  ]

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Pinterest', icon: Instagram, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ]

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src="/images/logo.png" alt="SnP Brand Logo" className="h-12 w-auto" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Subscribe to our newsletter to get updates about our grand offers.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="social-icon"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Center */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Help Center</h3>
            <ul className="space-y-2">
              {helpCenter.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Our Newsletter</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Subscribe to our newsletter to get updates about our grand offers.
            </p>
            <form className="space-y-3">
              <div className="search-bar rounded-full">
                <div className="flex items-center">
                  <input
                    type="email"
                    placeholder="Enter your email here"
                    className="flex-1 px-4 py-3 text-sm bg-transparent border-0 outline-none"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {currentYear} SnP Brand. All rights reserved.
            </div>
            <div className="text-sm text-gray-600 text-center md:text-right">
              <span>Free HTML Template by </span>
              <a
                href="https://templatesjungle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline font-medium"
              >
                TemplatesJungle
              </a>
              <span> Distributed by </span>
              <a
                href="https://themewagon.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline font-medium"
              >
                ThemeWagon
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
