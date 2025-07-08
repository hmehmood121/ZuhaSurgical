"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import ProductCard from "../components/ProductCard"
import { ChevronDown, Filter, Grid, List, Search } from "lucide-react"
import toast from "react-hot-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState("all")

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"))
        const productsArray = productsSnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"))
        const categoriesArray = categoriesSnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))

        setProducts(productsArray)
        setCategories(categoriesArray)
        setFilteredProducts(productsArray.filter((product) => product.status === "active"))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error loading products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((product) => product.status === "active")

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => product.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-1000":
          filtered = filtered.filter((product) => product.price < 1000)
          break
        case "1000-5000":
          filtered = filtered.filter((product) => product.price >= 1000 && product.price <= 5000)
          break
        case "5000-10000":
          filtered = filtered.filter((product) => product.price >= 5000 && product.price <= 10000)
          break
        case "over-10000":
          filtered = filtered.filter((product) => product.price > 10000)
          break
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.productName.localeCompare(b.productName)
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, sortBy, priceRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <span>Home</span> <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">All Products</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Price Filter */}
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="under-1000">Under PKR 1,000</option>
                  <option value="1000-5000">PKR 1,000 - 5,000</option>
                  <option value="5000-10000">PKR 5,000 - 10,000</option>
                  <option value="over-10000">Over PKR 10,000</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product._id || product.slug}
                className={`animate-slide-up ${viewMode === "list" ? "bg-white rounded-lg shadow-sm" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {viewMode === "grid" ? (
                  <ProductCard product={product} />
                ) : (
                  <div className="flex items-center p-4 gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={product.images?.[0] || "/placeholder.svg?height=96&width=96"}
                        alt={product.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.productName}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.shortDescription}</p>
                      <p className="text-xs text-gray-500 mb-2">Category: {product.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {product.oldPrice && (
                            <span className="text-gray-400 line-through text-sm">PKR {product.oldPrice}</span>
                          )}
                          <span className="text-green-600 font-bold text-lg">PKR {product.price}</span>
                        </div>
                        <a
                          href={`/product/${product.slug}`}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Filter size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No products found for "${searchQuery}"`
                : "Try adjusting your filters to see more products."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setPriceRange("all")
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
