interface MetaEvent {
  event_name: string
  event_time: number
  event_id?: string
  user_data: {
    em?: string[] // email (hashed)
    ph?: string[] // phone (hashed)
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
  }
  custom_data?: {
    currency?: string
    value?: number
    content_type?: string
    content_ids?: string[]
    content_name?: string
    content_category?: string
    num_items?: number
    search_string?: string
    contents?: Array<{
      id: string
      quantity: number
      item_price: number
    }>
  }
  event_source_url?: string
  action_source: string
}

class MetaConversionAPI {
  private pixelId: string
  private accessToken: string
  private apiVersion = "v18.0"

  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || ""
    this.accessToken = process.env.META_CONVERSION_API_TOKEN || ""

    console.log("🔧 MetaConversionAPI initialized")
    console.log("🔧 Pixel ID:", this.pixelId ? "✅ Set" : "❌ Missing")
    console.log("🔧 Access Token:", this.accessToken ? "✅ Set" : "❌ Missing")
  }

  // Hash function for PII data
  private async hashData(data: string): Promise<string> {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data.toLowerCase().trim())
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    }
    // Fallback for server-side or older browsers
    return data.toLowerCase().trim()
  }

  // Get Facebook browser ID from cookie
  private getFbp(): string | undefined {
    if (typeof document !== "undefined") {
      const fbpCookie = document.cookie.split("; ").find((row) => row.startsWith("_fbp="))
      return fbpCookie ? fbpCookie.split("=")[1] : undefined
    }
    return undefined
  }

  // Get Facebook click ID from URL or cookie
  private getFbc(): string | undefined {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const fbclid = urlParams.get("fbclid")

      if (fbclid) {
        return `fb.1.${Date.now()}.${fbclid}`
      }

      // Check cookie
      const fbcCookie = document.cookie.split("; ").find((row) => row.startsWith("_fbc="))
      return fbcCookie ? fbcCookie.split("=")[1] : undefined
    }
    return undefined
  }

  // Get client IP (you might want to implement this server-side)
  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return undefined
    }
  }

  // Send event to Meta Conversion API
  async sendEvent(eventData: Partial<MetaEvent>, userEmail?: string, userPhone?: string): Promise<void> {
    console.log("🚀 sendEvent called with:", eventData.event_name)

    if (!this.pixelId || !this.accessToken) {
      console.warn("❌ Meta Conversion API: Missing pixel ID or access token. Skipping server-side event.")
      console.warn("Pixel ID:", this.pixelId ? "Present" : "Missing")
      console.warn("Access Token:", this.accessToken ? "Present" : "Missing")
      // Still attempt to send to browser pixel if available
    } else {
      try {
        console.log("📊 Building event data for Conversion API...")

        const userData: MetaEvent["user_data"] = {
          client_ip_address: await this.getClientIP(),
          client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          fbc: this.getFbc(),
          fbp: this.getFbp(),
        }

        console.log("👤 User data for Conversion API:", userData)

        // Hash email and phone if provided
        if (userEmail) {
          userData.em = [await this.hashData(userEmail)]
        }
        if (userPhone) {
          userData.ph = [await this.hashData(userPhone)]
        }

        const event: MetaEvent = {
          event_name: eventData.event_name || "PageView",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventData.event_id || `${eventData.event_name}_${Date.now()}_${Math.random()}`,
          user_data: userData,
          custom_data: eventData.custom_data || {},
          event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
          action_source: "website",
          ...eventData,
        }

        console.log("📤 Full Conversion API event payload:", JSON.stringify(event, null, 2))

        // Send to Conversion API
        console.log("📡 Sending to Conversion API...")
        const response = await fetch(`https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: [event],
            access_token: this.accessToken,
          }),
        })

        const responseData = await response.json()
        console.log("📡 Conversion API response:", responseData)

        if (!response.ok) {
          console.error("❌ Meta Conversion API Error:", responseData)
        } else {
          console.log("✅ Meta Conversion API: Event sent successfully", {
            event_name: event.event_name,
            event_id: event.event_id,
            custom_data: event.custom_data,
          })
        }
      } catch (error) {
        console.error("❌ Meta Conversion API: Failed to send event to server", error)
      }
    }

    // Always attempt to send to browser pixel for better matching
    console.log("📱 Checking browser pixel availability...")
    if (typeof window !== "undefined" && window.fbq) {
      console.log("📱 Browser pixel available, sending event:", eventData.event_name)

      // Ensure custom_data is always an object
      const customData = eventData.custom_data || {}

      if (eventData.event_name === "PageView") {
        window.fbq("track", "PageView")
      } else if (eventData.event_name === "ViewContent") {
        window.fbq("track", "ViewContent", {
          content_type: customData.content_type,
          content_ids: customData.content_ids,
          content_name: customData.content_name,
          content_category: customData.content_category,
          currency: customData.currency,
          value: customData.value,
        })
      } else if (eventData.event_name === "AddToCart") {
        const addToCartData = {
          content_type: customData.content_type,
          content_ids: customData.content_ids,
          content_name: customData.content_name,
          currency: customData.currency,
          value: customData.value,
          contents: customData.contents,
        }

        console.log("🛒 Browser AddToCart data:", addToCartData)
        window.fbq("track", "AddToCart", addToCartData)
        console.log("✅ Browser pixel AddToCart sent")
      } else if (eventData.event_name === "InitiateCheckout") {
        window.fbq("track", "InitiateCheckout", {
          content_type: customData.content_type,
          content_ids: customData.content_ids,
          currency: customData.currency,
          value: customData.value,
          num_items: customData.num_items,
          contents: customData.contents,
        })
      } else if (eventData.event_name === "Purchase") {
        window.fbq("track", "Purchase", {
          content_type: customData.content_type,
          content_ids: customData.content_ids,
          currency: customData.currency,
          value: customData.value,
          num_items: customData.num_items,
          contents: customData.contents,
        })
      } else if (eventData.event_name === "Search") {
        window.fbq("track", "Search", {
          search_string: customData.search_string,
        })
      } else if (eventData.event_name === "Lead") {
        window.fbq("track", "Lead")
      } else if (eventData.event_name === "BuyNow") {
        // Handle custom BuyNow event
        const buyNowData = {
          content_type: customData.content_type,
          content_ids: customData.content_ids,
          content_name: customData.content_name,
          currency: customData.currency,
          value: customData.value,
          contents: customData.contents,
        }
        console.log("⚡ Browser BuyNow data:", buyNowData)
        window.fbq("trackCustom", "BuyNow", buyNowData) // Use trackCustom for custom events
        console.log("✅ Browser pixel BuyNow sent")
      }

      console.log("✅ Browser Pixel: Event sent", eventData.event_name)
    } else {
      console.warn("⚠️ Browser pixel (fbq) not available. Cannot send browser-side event.")
      console.warn("window.fbq:", typeof window !== "undefined" ? typeof window.fbq : "window not available")
    }
  }

  // Predefined event methods
  async trackPageView(url?: string): Promise<void> {
    console.log("📄 trackPageView called")
    await this.sendEvent({
      event_name: "PageView",
      event_source_url: url || (typeof window !== "undefined" ? window.location.href : undefined),
      custom_data: {
        currency: "PKR",
      },
    })
  }

  async trackViewContent(productId: string, productName: string, category: string, price: number): Promise<void> {
    console.log("👁️ trackViewContent called:", { productId, productName, category, price })
    await this.sendEvent({
      event_name: "ViewContent",
      custom_data: {
        content_type: "product",
        content_ids: [productId],
        content_name: productName,
        content_category: category,
        currency: "PKR",
        value: price,
      },
    })
  }

  async trackAddToCart(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    console.log("🛒 trackAddToCart called:", { productId, productName, price, quantity })
    await this.sendEvent({
      event_name: "AddToCart",
      custom_data: {
        content_type: "product",
        content_ids: [productId],
        content_name: productName,
        currency: "PKR",
        value: price * quantity,
        contents: [
          {
            id: productId,
            quantity: quantity,
            item_price: price,
          },
        ],
      },
    })
  }

  async trackPurchase(
    orderId: string,
    products: Array<{ id: string; name: string; price: number; quantity: number }>,
    totalValue: number,
    userEmail?: string,
    userPhone?: string,
  ): Promise<void> {
    console.log("💰 trackPurchase called:", { orderId, totalValue, products })
    await this.sendEvent(
      {
        event_name: "Purchase",
        event_id: `purchase_${orderId}`, // Unique event ID for deduplication
        custom_data: {
          content_type: "product",
          content_ids: products.map((p) => p.id),
          currency: "PKR",
          value: totalValue,
          num_items: products.reduce((sum, p) => sum + p.quantity, 0),
          contents: products.map((p) => ({
            id: p.id,
            quantity: p.quantity,
            item_price: p.price,
          })),
        },
      },
      userEmail,
      userPhone,
    )
  }

  async trackSearch(searchQuery: string): Promise<void> {
    console.log("🔍 trackSearch called:", searchQuery)
    await this.sendEvent({
      event_name: "Search",
      custom_data: {
        search_string: searchQuery,
        currency: "PKR",
      },
    })
  }

  async trackInitiateCheckout(
    products: Array<{ id: string; price: number; quantity: number }>,
    totalValue: number,
  ): Promise<void> {
    console.log("🛍️ trackInitiateCheckout called:", { products, totalValue })
    await this.sendEvent({
      event_name: "InitiateCheckout",
      custom_data: {
        content_type: "product",
        content_ids: products.map((p) => p.id),
        currency: "PKR",
        value: totalValue,
        num_items: products.reduce((sum, p) => sum + p.quantity, 0),
        contents: products.map((p) => ({
          id: p.id,
          quantity: p.quantity,
          item_price: p.price,
        })),
      },
    })
  }

  async trackLead(userEmail?: string, userPhone?: string): Promise<void> {
    console.log("📝 trackLead called:", { userEmail, userPhone })
    await this.sendEvent(
      {
        event_name: "Lead",
        custom_data: {
          currency: "PKR",
        },
      },
      userEmail,
      userPhone,
    )
  }

  // New custom event for "Buy Now"
  async trackBuyNow(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    console.log("⚡ trackBuyNow called:", { productId, productName, price, quantity })
    await this.sendEvent({
      event_name: "BuyNow", // Custom event name
      custom_data: {
        content_type: "product",
        content_ids: [productId],
        content_name: productName,
        currency: "PKR",
        value: price * quantity,
        contents: [
          {
            id: productId,
            quantity: quantity,
            item_price: price,
          },
        ],
      },
    })
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    fbq: any
  }
}

export const metaAPI = new MetaConversionAPI()
