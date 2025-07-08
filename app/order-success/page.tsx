"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Mail, Phone } from "lucide-react"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    // In a real app, you'd fetch order details from your database
    // For now, we'll show a success message with the order ID
    if (orderId) {
      setOrderDetails({
        orderId,
        estimatedDelivery: "3-5 business days",
        status: "confirmed",
      })
    }
  }, [orderId])

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle size={64} className="mx-auto text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your order and will process it shortly.
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600 capitalize">{orderDetails.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-semibold">{orderDetails.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center justify-center gap-2">
              <Package size={20} />
              What's Next?
            </h3>
            <div className="text-blue-800 space-y-2 text-sm">
              <p>✅ Order confirmation email sent to your email address</p>
              <p>📦 We'll prepare your order for shipment</p>
              <p>🚚 You'll receive tracking information once shipped</p>
              <p>📞 Our team will contact you if needed</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>zuhasurgical@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Continue Shopping
            </Link>
            <Link
              href="/contact"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
