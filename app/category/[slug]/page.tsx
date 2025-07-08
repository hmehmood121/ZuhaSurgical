"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../../firebase"
import ProductCard from "../../components/ProductCard"
import { ChevronDown, Filter, Grid, List } from "lucide-react"
import toast from "react-hot-toast"

export default function CategoryPage() {
  const params = useParams()
  const { slug } = params

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState("all")

  // Convert slug back to category name
  const slugToName = (slug) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Fetch products for the category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!slug) return

      try {
        setLoading(true)
        const categoryDisplayName = slugToName(slug)
        setCategoryName(categoryDisplayName)

        console.log("Fetching products for category:", categoryDisplayName)

        // Try to find products with exact category match first
        const productsQuery = query(collection(db, "products"), where("category", "==", categoryDisplayName))
        const querySnapshot = await getDocs(productsQuery)

        // If no exact match, try case-insensitive search
        if (querySnapshot.empty) {
          console.log("No exact match, trying case-insensitive search...")
          const allProductsSnapshot = await getDocs(collection(db, "products"))
          const allProducts = allProductsSnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))

          const filteredProducts = allProducts.filter((product) =>
            product.category?.toLowerCase().includes(categoryDisplayName.toLowerCase()),
          )

          setProducts(filteredProducts)
        } else {
          const productsArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))
          setProducts(productsArray)
        }

        console.log("Products found:", products.length)
      } catch (error) {
        console.error("Error fetching category products:", error)
        toast.error("Error loading products")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [slug])

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name":
        return a.productName.localeCompare(b.productName)
      default:
        return 0
    }
  })

  // Filter by price range
  const filteredProducts = sortedProducts.filter((product) => {
    if (priceRange === "all") return true
    if (priceRange === "under-1000") return product.price < 1000
    if (priceRange === "1000-5000") return product.price >= 1000 && product.price <= 5000
    if (priceRange === "5000-10000") return product.price >= 5000 && product.price <= 10000
    if (priceRange === "over-10000") return product.price > 10000
    return true
  })

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
            <span>Home</span> <span className="mx-2">/</span> <span>Categories</span> <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
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
                style={{ animationDelay: `${index * 0.1}s` }}
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
            <p className="text-gray-600 mb-6">We couldn't find any products in the "{categoryName}" category.</p>
            <a
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Browse All Products
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
