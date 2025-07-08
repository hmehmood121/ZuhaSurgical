"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CategoryCircles({ categories }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const { current } = scrollRef
    if (current) {
      const scrollAmount = 200
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-12 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Discover our wide range of medical equipment</p>
        </div>

        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-green-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-green-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-green-50 transition-colors"
          >
            <ChevronRight size={20} className="text-green-600" />
          </button>

          {/* Categories scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category, index) => (
              <Link
                key={category._id || index}
                href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex-shrink-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="category-card min-w-[140px]">
                  <div className="relative w-20 h-20 mb-3 overflow-hidden rounded-full bg-gradient-to-br from-green-100 to-green-200">
                    <Image
                      src={category.imageUrl || "/placeholder.svg?height=80&width=80"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 text-center leading-tight">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
