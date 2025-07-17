"use client"

import { useEffect } from "react"

export default function MetaPixelEvents() {
  useEffect(() => {
    // Ensure fbq is available and track PageView
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView")
      console.log("✅ Meta Pixel: PageView tracked")
    }
  }, [])

  return null
}
