"use client"

import { useCallback } from "react"
import { metaAPI } from "@/lib/meta-conversion-api"

export function useMetaTracking() {
  const trackPageView = useCallback((url?: string) => {
    metaAPI.trackPageView(url)
  }, [])

  const trackViewContent = useCallback((productId: string, productName: string, category: string, price: number) => {
    metaAPI.trackViewContent(productId, productName, category, price)
  }, [])

  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity: number) => {
    metaAPI.trackAddToCart(productId, productName, price, quantity)
  }, [])

  const trackInitiateCheckout = useCallback(
    (products: Array<{ id: string; price: number; quantity: number }>, totalValue: number) => {
      metaAPI.trackInitiateCheckout(products, totalValue)
    },
    [],
  )

  const trackPurchase = useCallback(
    (
      orderId: string,
      products: Array<{ id: string; name: string; price: number; quantity: number }>,
      totalValue: number,
      userEmail?: string,
      userPhone?: string,
    ) => {
      metaAPI.trackPurchase(orderId, products, totalValue, userEmail, userPhone)
    },
    [],
  )

  const trackSearch = useCallback((searchQuery: string) => {
    metaAPI.trackSearch(searchQuery)
  }, [])

  const trackLead = useCallback((userEmail?: string, userPhone?: string) => {
    metaAPI.trackLead(userEmail, userPhone)
  }, [])

  const trackBuyNow = useCallback((productId: string, productName: string, price: number, quantity: number) => {
    metaAPI.trackBuyNow(productId, productName, price, quantity)
  }, [])

  return {
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch,
    trackLead,
    trackBuyNow, // Expose the new trackBuyNow event
  }
}
