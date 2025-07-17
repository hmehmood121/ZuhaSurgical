import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <span className="text-xl font-bold">ZuhaSurgical</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner for premium medical and surgical equipment. Quality you can trust, service you can
              rely on.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/zuhasurgical" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/zuhasurgical" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@zuhasurgical" className="text-gray-400 hover:text-green-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-green-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category" className="text-gray-400 hover:text-green-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-400 hover:text-green-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-green-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-400 hover:text-green-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-400">Choudhary house ,Airport Road, mino khan home street,Khanpur District Rahim Yar Khan
Postal code 64100
</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-400">+92 321 5702979</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-400">zuhasurgical@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ZuhaSurgical. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/sitemap" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Sitemap
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
