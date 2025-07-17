"use client"

import { useEffect } from "react"
import { metaAPI } from "../lib/meta-conversion-api"

export const useMetaTracking = () => {
  // Track page view on mount
  useEffect(() => {
    metaAPI.trackPageView()
  }, [])

  return {
    trackPageView: metaAPI.trackPageView.bind(metaAPI),
    trackViewContent: metaAPI.trackViewContent.bind(metaAPI),
    trackAddToCart: metaAPI.trackAddToCart.bind(metaAPI),
    trackPurchase: metaAPI.trackPurchase.bind(metaAPI),
    trackSearch: metaAPI.trackSearch.bind(metaAPI),
    trackInitiateCheckout: metaAPI.trackInitiateCheckout.bind(metaAPI),
    trackLead: metaAPI.trackLead.bind(metaAPI),
  }
}
