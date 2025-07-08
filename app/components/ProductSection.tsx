"use client"

import ProductCard from "./ProductCard"
import Link from "next/link"
import type { ReactNode } from "react"

interface Product {
  status: string
  slug?: string
  _id?: string
  // Add any other fields used by ProductCard if needed
  [key: string]: any
}

interface ProductSectionProps {
  title: string
  products: Product[]
  categoryName?: string
  showAll?: boolean
}

export default function ProductSection({ title, products, categoryName, showAll = false }: ProductSectionProps) {
  // Filter active products
  const activeProducts = products.filter((product: Product) => product.status === "active")

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">
              {activeProducts.length > 0
                ? `${activeProducts.length} product${activeProducts.length !== 1 ? "s" : ""} available`
                : "Discover our premium collection"}
            </p>
          </div>
          {showAll && categoryName && activeProducts.length > 4 && (
            <Link
              href={`/category/${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
              className="btn-secondary flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium"
            >
              View All ({activeProducts.length})
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeProducts.length > 0 ? (
            activeProducts
              .slice(0, 4) // Always show only first 4 products on home page
              .map((product: Product, index: number) => (
                <div
                  key={product.slug || product._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Products coming soon...</p>
            </div>
          )}
        </div>

        {/* Show "View More" hint if there are more than 4 products but showAll is false */}
        {!showAll && activeProducts.length > 4 && categoryName && (
          <div className="text-center mt-8">
            <Link
              href={`/category/${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              View {activeProducts.length - 4} more products in {title}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
