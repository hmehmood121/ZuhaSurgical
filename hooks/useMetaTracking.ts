"use client"

// This file was missing in the revert, re-adding it with useCallback.
import { useCallback } from "react"
import { metaAPI } from "../lib/meta-conversion-api"

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

  const trackInitiateCheckout = useCallback(
    (products: Array<{ id: string; price: number; quantity: number }>, totalValue: number) => {
      metaAPI.trackInitiateCheckout(products, totalValue)
    },
    [],
  )

  const trackLead = useCallback((userEmail?: string, userPhone?: string) => {
    metaAPI.trackLead(userEmail, userPhone)
  }, [])

  return {
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackInitiateCheckout,
    trackLead,
  }
}
