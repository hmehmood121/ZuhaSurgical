"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { useState } from "react"

interface Product {
  status: string
  slug?: string
  _id?: string
  productName: string
  price: number | string
  oldPrice?: number | string
  images?: string[]
  shortDescription?: string
  // Add any other fields as needed
  [key: string]: any
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        <Image
          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
          alt={product.productName}
          width={300}
          height={300}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="bg-white text-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-white transition-colors duration-300 transform hover:scale-110">
            <ShoppingCart size={20} />
          </button>
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-800 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Sale badge */}
        {product.oldPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
            SALE
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mb-2 hover:text-green-600 transition-colors line-clamp-2">
            {product.productName}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={`${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
          ))}
          <span className="text-sm text-gray-500 ml-1">(20)</span>
        </div>

        <div className="flex flex-col items-start gap-2 mt-2">
          <div className="flex items-center gap-2">
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm whitespace-nowrap">
                PKR {product.oldPrice}
              </span>
            )}
            <span className="text-green-600 font-bold text-lg whitespace-nowrap">
              PKR {product.price}
            </span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 w-full text-center whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
