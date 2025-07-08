"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import toast from "react-hot-toast"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"))
        const categoriesArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id }))
        setCategories(categoriesArray)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Error loading categories")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Categories</h1>
          <p className="text-xl text-gray-600">Browse our complete range of medical equipment categories</p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
                    <Image
                      src={category.imageUrl || "/placeholder.svg?height=192&width=300"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {category.description || "Explore our range of medical equipment in this category"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600">Categories will appear here once they are added to the system.</p>
          </div>
        )}
      </div>
    </div>
  )
}
