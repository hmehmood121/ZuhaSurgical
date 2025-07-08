"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingCart, X, User } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import { useCart } from "../context/CartContext"
import Image from "next/image"
import type { FC } from "react"

// Category and Suggestion types
interface Category {
  name: string
  _id: string
}
interface Suggestion {
  id: string
  productName: string
  slug: string
  price: number
  images?: string[]
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const searchRef = useRef(null)
  const { totalQuantities } = useCart() as { totalQuantities: number };

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const querySnapshot = await getDocs(collection(db, "categories"))
        const categoriesArray = querySnapshot.docs.map((doc) => ({ ...(doc.data() as Category), _id: doc.id }))

        // Sort categories alphabetically
        categoriesArray.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(categoriesArray)
        console.log("Categories loaded:", categoriesArray.length)
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Fallback to default categories if Firebase fails
        setCategories([
          { name: "Surgical Instruments", _id: "1" },
          { name: "Medical Devices", _id: "2" },
          { name: "Diagnostic Equipment", _id: "3" },
          { name: "Hospital Furniture", _id: "4" },
          { name: "Disposables", _id: "5" },
          { name: "Laboratory Equipment", _id: "6" },
        ])
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && (searchRef.current as any).contains(event.target)) {
        setIsSearchOpen(false)
        setSuggestions([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = async (searchText: string) => {
    setSearchQuery(searchText)
    if (searchText.trim().length > 2) {
      setIsSearching(true)
      try {
        const productsCollection = collection(db, "products")
        const querySnapshot = await getDocs(productsCollection)
        const productSuggestions: Suggestion[] = []

        querySnapshot.forEach((doc) => {
          const product = doc.data() as Omit<Suggestion, "id"> & { id?: string }
          const productName = product.productName.toLowerCase()

          if (productName.includes(searchText.toLowerCase())) {
            productSuggestions.push({ id: doc.id, ...product })
          }
        })

        setSuggestions(productSuggestions.slice(0, 5))
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSuggestions([])
    }
  }

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-24 h-24 min-w-[90px] min-h-[64px]">
                <Image src="/log.png" alt="ZuhaSurgical Logo" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
                  Categories
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-gray-100">
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {categoriesLoading ? (
                      // Loading skeleton
                      <>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="px-4 py-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </>
                    ) : categories.length > 0 ? (
                      <>
                        {categories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <Link
                            href="/category"
                            className="block px-4 py-2 text-green-600 hover:bg-green-50 font-medium transition-colors"
                          >
                            View All Categories →
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No categories available</div>
                    )}
                  </div>
                </div>
              </div>

              <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                  <Search size={20} />
                </button>

                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border animate-fade-in">
                    <div className="p-4">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        autoFocus
                      />
                      {isSearching && <div className="mt-2 text-center text-gray-500">Searching...</div>}
                      {suggestions.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <Link
                              key={suggestion.id}
                              href={`/product/${suggestion.slug}`}
                              className="flex items-center px-3 py-2 hover:bg-green-50 rounded-md transition-colors"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              <img
                                src={suggestion.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                alt={suggestion.productName}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">{suggestion.productName}</div>
                                <div className="text-xs text-green-600">PKR {suggestion.price}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                <ShoppingCart size={20} />
                {totalQuantities > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in">
                    {totalQuantities}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="py-4">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</div>
                {categoriesLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="py-2 pl-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </>
                ) : categories.length > 0 ? (
                  <>
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category._id}
                        href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block py-2 pl-4 text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                    {categories.length > 8 && (
                      <Link
                        href="/category"
                        className="block py-2 pl-4 text-green-600 font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View All Categories →
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="py-2 pl-4 text-gray-500 text-sm">No categories available</div>
                )}
              </div>

              <Link
                href="/about"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
