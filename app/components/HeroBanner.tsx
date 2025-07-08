"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { db } from "../../firebase"
import { collection, getDocs } from "firebase/firestore"

export default function HeroBanner() {
  const [banners, setBanners] = useState<{ id: string; url: string }[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true)
      try {
        const bannersSnapshot = await getDocs(collection(db, "banner"))
        const bannersList = bannersSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as { url: string }) }))
        setBanners(bannersList)
      } catch (error) {
        setBanners([])
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 min-h-[24rem]">
      <div className="carousel-container">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-white">
            <ImageIcon size={48} className="mb-4 opacity-60" />
            <p className="text-lg opacity-80">No banners available</p>
          </div>
        ) : (
          <div className="relative">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="w-full flex-shrink-0 relative">
                  <div className="relative h-96 md:h-[500px]">
                    <Image
                      src={banner.url}
                      alt="Banner"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-300"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
