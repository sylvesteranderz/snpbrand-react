import { Link } from 'react-router-dom'

interface FooterProps {
  className?: string
}

const Footer = ({ className = '' }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About us', href: '/about' },
    { name: 'Offer', href: '/offers' },
    { name: 'Services', href: '/services' },
    { name: 'Contact Us', href: '/contact' },
  ]

  return (
    <footer className={`bg-white border-t ${className}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src="/images/SnPBrandlogo2.png" alt="SnP Brand Logo" className="h-12 w-auto" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Subscribe to our newsletter to get updates about our grand offers.
            </p>
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {currentYear} SnP Brand. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
