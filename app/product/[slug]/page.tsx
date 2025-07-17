"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, Star, Share2, Heart, ShoppingCart } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../../firebase"
import ProductSection from "../../components/ProductSection"
import { useCart } from "../../context/CartContext"
import toast from "react-hot-toast"
import { useMetaTracking } from "../../../hooks/useMetaTracking"

export default function ProductDetails() {
  const params = useParams()
  const router = useRouter()
  const { slug } = params
  const { addToCart } = useCart()
  const { trackViewContent, trackAddToCart } = useMetaTracking()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch the current product based on slug from Firebase Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return

      try {
        const productQuery = query(collection(db, "products"), where("slug", "==", slug))
        const querySnapshot = await getDocs(productQuery)

        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data()
          setProduct(productData)

          // Track view content event
          trackViewContent(
            productData.slug,
            productData.productName,
            productData.category || "Unknown",
            Number.parseFloat(productData.price),
          )
        } else {
          console.error("Product not found")
        }
      } catch (error) {
        console.error("Error fetching product: ", error)
        toast.error("Error loading product")
      }
    }

    fetchProduct()
  }, [slug, trackViewContent])

  // Fetch related products for the "You may also like" section
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const productsQuerySnapshot = await getDocs(collection(db, "products"))
        const productsArray = productsQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          _id: doc.id,
        }))

        // Filter out current product and get random products
        const filteredProducts = productsArray.filter((p) => p.slug !== slug && p.status === "active")
        const shuffledProducts = filteredProducts.sort(() => 0.5 - Math.random()).slice(0, 6)

        setRelatedProducts(shuffledProducts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching related products: ", error)
        setLoading(false)
      }
    }

    if (slug) {
      fetchRelatedProducts()
    }
  }, [slug])

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1)
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const validateSelections = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size.")
      return false
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color.")
      return false
    }
    return true
  }

  const handleAddToCart = async (e) => {
    e.preventDefault() // Prevent default button behavior
    e.stopPropagation() // Stop event propagation to prevent other listeners

    console.log("🛒 Add to Cart button clicked!")
    console.log("🔍 Product:", product?.productName)
    console.log("🔍 Quantity:", quantity)

    if (!validateSelections()) return

    try {
      console.log("✅ Validation passed, adding to cart...")

      // Add to cart first
      addToCart(product, quantity, selectedSize, selectedColor)
      console.log("✅ Added to cart successfully")

      // Track add to cart event with proper error handling
      console.log("📊 Starting AddToCart tracking...")
      await trackAddToCart(
        product.slug || product.productName,
        product.productName,
        Number.parseFloat(product.price),
        quantity,
      )

      console.log("✅ AddToCart event tracked successfully")
    } catch (error) {
      console.error("❌ Error in handleAddToCart:", error)
    }
  }

  const handleBuyNow = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("🚀 Buy Now button clicked!")

    if (!validateSelections()) return

    try {
      // Add to cart first
      addToCart(product, quantity, selectedSize, selectedColor)

      // Track add to cart event
      await trackAddToCart(
        product.slug || product.productName,
        product.productName,
        Number.parseFloat(product.price),
        quantity,
      )

      // Redirect to cart/checkout
      router.push("/cart")
      toast.success("Proceeding to checkout!")
    } catch (error) {
      console.error("❌ Error in handleBuyNow:", error)
      // Still proceed to cart even if tracking fails
      router.push("/cart")
      toast.success("Proceeding to checkout!")
    }
  }


  const handleShare = async () => {
    const productUrl = `${window.location.origin}/product/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.productName,
          url: productUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl)
        toast.success("Product link copied to clipboard!")
      } catch (error) {
        console.error("Error copying to clipboard:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.productName}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              {product.oldPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  SALE
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === selectedImageIndex
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.productName} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
              <p className="text-gray-600 text-lg">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={`${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-gray-600">(20 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.oldPrice && <span className="text-2xl text-gray-400 line-through">PKR {product.oldPrice}</span>}
              <span className="text-3xl font-bold text-green-600">PKR {product.price}</span>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-300 hover:border-green-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Color <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all duration-300 ${
                        selectedColor === color
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-300 hover:border-green-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                data-testid="add-to-cart-button"
                data-fb-skip-ogb="true" 
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                data-testid="buy-now-button"
                data-fb-skip-ogb="true" 
              >
                Buy Now
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all duration-300 ${
                  isWishlisted
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-700 hover:border-red-300"
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:border-green-300 transition-all duration-300"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        {/* Related Products */}
        <ProductSection title="You May Also Like" products={relatedProducts} showAll={false} />
      </div>
    </div>
  )
}
