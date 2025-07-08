import { NextResponse } from "next/server"

export async function POST(request) {
  // Wrap everything in try-catch to ensure we always return JSON
  try {
    console.log("=== API Route Started ===")

    // Parse request body safely
    let orderData
    try {
      orderData = await request.json()
      console.log("✅ Request parsed successfully")
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError)
      return NextResponse.json({ success: false, message: "Invalid request format" }, { status: 400 })
    }

    // Extract basic data
    const { orderDetails, paymentMethod, cartItems, subtotal, deliveryFee, total, orderId, orderDate } = orderData

    // Basic validation
    if (!orderDetails?.name || !orderDetails?.email || !orderId) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ success: false, message: "Missing required order information" }, { status: 400 })
    }

    console.log("✅ Validation passed for order:", orderId)

    // Initialize results
    let firebaseSaved = false
    const emailsSent = { customer: false, business: false }

    // Try Firebase save (non-blocking)
    try {
      console.log("📦 Attempting Firebase save...")

      // Use dynamic import to avoid build issues
      const { initializeApp } = await import("firebase/app")
      const { getFirestore, collection, addDoc } = await import("firebase/firestore")

      // Firebase config
      const firebaseConfig = {
        apiKey: "AIzaSyAC-XXLBMRKIJqeZChgLImYv9blpRIxx2k",
        authDomain: "zuha-bfae4.firebaseapp.com",
        projectId: "zuha-bfae4",
        storageBucket: "zuha-bfae4.appspot.com",
        messagingSenderId: "63851762522",
        appId: "1:63851762522:web:ddf3f4f5a78af6f8de9963",
      }

      const app = initializeApp(firebaseConfig)
      const db = getFirestore(app)

      const orderDoc = {
        orderId,
        customerName: orderDetails.name,
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.phone,
        customerAddress: orderDetails.address,
        customerCity: orderDetails.city,
        postalCode: orderDetails.postalCode || "",
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        orderDate,
        status: "pending",
        createdAt: new Date().toISOString(),
        items: cartItems.map((item) => ({
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize || "",
          color: item.selectedColor || "",
        })),
      }

      const docRef = await addDoc(collection(db, "orders"), orderDoc)
      console.log("✅ Firebase save successful:", docRef.id)
      firebaseSaved = true
    } catch (firebaseError) {
      console.error("❌ Firebase error (continuing):", firebaseError.message)
    }

    // Try email sending (non-blocking)
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("📧 Attempting to send emails...")

        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Simple customer email
        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Order Confirmation</h1>
            <p>Dear ${orderDetails.name},</p>
            <p>Thank you for your order! Here are the details:</p>
            
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total:</strong> PKR ${total}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Delivery Address</h3>
              <p>${orderDetails.name}<br>
              ${orderDetails.address}<br>
              ${orderDetails.city}<br>
              Phone: ${orderDetails.phone}</p>
            </div>

            ${
              paymentMethod === "bankTransfer"
                ? `
            <div style="background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Bank Transfer Details</h3>
              <p><strong>Account Title:</strong> Muhammad Bilal Ameen<br>
              <strong>Account Number:</strong> 00270981017134019<br>
              <strong>Branch:</strong> Bank Al-Habib</p>
            </div>
            `
                : ""
            }

            ${
              paymentMethod === "jazzcash"
                ? `
            <div style="background: #f3e5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>JazzCash Details</h3>
              <p><strong>Account Title:</strong> Muhammad Bilal Ameen<br>
              <strong>Account Number:</strong> 03005702979</p>
            </div>
            `
                : ""
            }

            <p>We'll contact you soon with delivery updates.</p>
            <p>Thank you for choosing ZuhaSurgical!</p>
          </div>
        `

        // Send customer email
        await resend.emails.send({
          from: "ZuhaSurgical <onboarding@resend.dev>",
          to: [orderDetails.email],
          subject: `Order Confirmation - ${orderId}`,
          html: customerEmailHtml,
        })

        console.log("✅ Customer email sent")
        emailsSent.customer = true

        // Send business notification
        await resend.emails.send({
          from: "ZuhaSurgical <onboarding@resend.dev>",
          to: ["zuhasurgical@gmail.com"],
          subject: `New Order - ${orderId} - PKR ${total}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h1 style="color: #dc2626;">New Order Received!</h1>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer:</strong> ${orderDetails.name}</p>
              <p><strong>Email:</strong> ${orderDetails.email}</p>
              <p><strong>Phone:</strong> ${orderDetails.phone}</p>
              <p><strong>Address:</strong> ${orderDetails.address}, ${orderDetails.city}</p>
              <p><strong>Total:</strong> PKR ${total}</p>
              <p><strong>Payment:</strong> ${paymentMethod}</p>
            </div>
          `,
        })

        console.log("✅ Business email sent")
        emailsSent.business = true
      } catch (emailError) {
        console.error("❌ Email error (continuing):", emailError.message)
      }
    } else {
      console.log("⚠️ No Resend API key - skipping emails")
    }

    // Always return success response
    const response = {
      success: true,
      message: "Order processed successfully",
      orderId,
      firebaseSaved,
      emailsSent,
    }

    console.log("✅ API completed successfully:", response)
    return NextResponse.json(response)
  } catch (error) {
    // Catch any unexpected errors
    console.error("❌ Unexpected API error:", error)

    // Always return JSON, never let it fall through
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: "This endpoint only accepts POST requests" }, { status: 405 })
}
