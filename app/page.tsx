"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "../firebase"
import HeroBanner from "./components/HeroBanner"
import CategoryCircles from "./components/CategoryCircles"
import ProductSection from "./components/ProductSection"
import toast from "react-hot-toast"

export default function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [catProducts, setCatProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch categories from Firebase Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"))
        const categoriesArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))
        setCategories(categoriesArray)

        // Fetch products for each category
        categoriesArray.forEach((category) => {
          fetchProductsByCategory(category.name)
        })
      } catch (error) {
        console.error("Error fetching categories: ", error)
        toast.error("Error loading categories")
      }
    }

    fetchCategories()
  }, [])

  // Fetch new arrival products
  useEffect(() => {
    const fetchNewArrivalProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const productsArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))
        setProducts(productsArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching products: ", error)
        toast.error("Error loading products")
        setLoading(false)
      }
    }

    fetchNewArrivalProducts()
  }, [])

  // Function to fetch products for each category
  const fetchProductsByCategory = async (categoryName) => {
    try {
      const productsQuery = query(collection(db, "products"), where("category", "==", categoryName))
      const querySnapshot = await getDocs(productsQuery)
      const productsArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))

      setCatProducts((prevState) => ({
        ...prevState,
        [categoryName]: productsArray,
      }))
    } catch (error) {
      toast.error(`Error fetching products for category ${categoryName}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <CategoryCircles categories={categories} />

      <ProductSection title="New Arrivals" products={products} showAll={false} />

      {categories.map((category, index) => {
        const categoryProducts = catProducts[category.name] || []
        const activeProducts = categoryProducts.filter((product) => product.status === "active")

        return (
          <div key={category._id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
            <ProductSection
              title={category.name}
              products={activeProducts}
              categoryName={category.name}
              showAll={activeProducts.length > 4}
            />
          </div>
        )
      })}
    </div>
  )
}
