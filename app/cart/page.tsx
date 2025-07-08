"use client"

import { useCart } from "../context/CartContext"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react"

export default function CartPage() {
  const {
    cartItems,
    totalPrice,
    totalQuantities,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getDeliveryFee,
    getFinalTotal,
    FREE_DELIVERY_THRESHOLD,
  } = useCart()

  const deliveryFee = getDeliveryFee()
  const finalTotal = getFinalTotal()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart ({totalQuantities} items)</h1>
          <button onClick={clearCart} className="text-red-600 hover:text-red-800 font-medium transition-colors">
            Clear Cart
          </button>
        </div>

        {/* Free Delivery Banner */}
        {totalPrice < FREE_DELIVERY_THRESHOLD && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Truck className="text-green-600" size={24} />
              <div>
                <p className="text-green-800 font-semibold">
                  Add PKR {FREE_DELIVERY_THRESHOLD - totalPrice} more for FREE delivery!
                </p>
                <p className="text-green-600 text-sm">Currently: PKR {deliveryFee} delivery fee</p>
              </div>
            </div>
          </div>
        )}

        {deliveryFee === 0 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Truck className="text-green-700" size={24} />
              <p className="text-green-800 font-semibold">🎉 Congratulations! You qualify for FREE delivery!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.key} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.productName}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{item.productName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    </div>
                    <p className="text-green-600 font-bold text-lg mt-2">PKR {item.price}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateCartItemQuantity(item.key, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.key, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalQuantities} items)</span>
                  <span className="font-semibold">PKR {totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0 ? "FREE" : `PKR ${deliveryFee}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-green-600">PKR {finalTotal}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
