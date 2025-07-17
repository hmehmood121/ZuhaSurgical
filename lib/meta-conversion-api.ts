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

  // Send event to Meta Conversion API
  async sendEvent(eventData: Partial<MetaEvent>, userEmail?: string, userPhone?: string): Promise<void> {
    if (!this.pixelId || !this.accessToken) {
      console.warn("Meta Conversion API: Missing pixel ID or access token")
      return
    }

    try {
      const userData: MetaEvent["user_data"] = {
        client_ip_address: await this.getClientIP(),
        client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        fbc: this.getFbc(),
        fbp: this.getFbp(),
      }

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
        event_id: eventData.event_id || `${Date.now()}_${Math.random()}`,
        user_data: userData,
        custom_data: eventData.custom_data || {},
        event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
        action_source: "website",
        ...eventData,
      }

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

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Meta Conversion API Error:", errorData)
      } else {
        console.log("Meta Conversion API: Event sent successfully", event.event_name)
      }
    } catch (error) {
      console.error("Meta Conversion API: Failed to send event", error)
    }
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

  // Predefined event methods
  async trackPageView(url?: string): Promise<void> {
    await this.sendEvent({
      event_name: "PageView",
      event_source_url: url || (typeof window !== "undefined" ? window.location.href : undefined),
    })
  }

  async trackViewContent(productId: string, productName: string, category: string, price: number): Promise<void> {
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
    await this.sendEvent(
      {
        event_name: "Purchase",
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
    await this.sendEvent({
      event_name: "Search",
      custom_data: {
        search_string: searchQuery,
      },
    })
  }

  async trackInitiateCheckout(
    products: Array<{ id: string; price: number; quantity: number }>,
    totalValue: number,
  ): Promise<void> {
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
    await this.sendEvent(
      {
        event_name: "Lead",
      },
      userEmail,
      userPhone,
    )
  }
}

export const metaAPI = new MetaConversionAPI()
