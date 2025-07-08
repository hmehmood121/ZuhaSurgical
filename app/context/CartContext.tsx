"use client"

import { createContext, useContext, useState, useEffect } from "react"
import toast from "react-hot-toast"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalQuantities, setTotalQuantities] = useState(0)

  // Delivery fee constants
  const DELIVERY_FEE = 200
  const FREE_DELIVERY_THRESHOLD = 10000

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      setCartItems(parsedCart.items || [])
      setTotalPrice(parsedCart.totalPrice || 0)
      setTotalQuantities(parsedCart.totalQuantities || 0)
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: cartItems,
        totalPrice,
        totalQuantities,
      }),
    )
  }, [cartItems, totalPrice, totalQuantities])

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    // Create unique item key based on product and variations
    const itemKey = `${product.slug}-${selectedSize || "no-size"}-${selectedColor || "no-color"}`

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.key === itemKey)

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            key: itemKey,
            ...product,
            quantity,
            selectedSize,
            selectedColor,
          },
        ]
      }
    })

    setTotalPrice((prevTotal) => prevTotal + product.price * quantity)
    setTotalQuantities((prevQty) => prevQty + quantity)

    toast.success(`${product.productName} added to cart!`)
  }

  const removeFromCart = (itemKey) => {
    const itemToRemove = cartItems.find((item) => item.key === itemKey)
    if (itemToRemove) {
      setCartItems((prevItems) => prevItems.filter((item) => item.key !== itemKey))
      setTotalPrice((prevTotal) => prevTotal - itemToRemove.price * itemToRemove.quantity)
      setTotalQuantities((prevQty) => prevQty - itemToRemove.quantity)
      toast.success("Item removed from cart")
    }
  }

  const updateCartItemQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey)
      return
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.key === itemKey) {
          const quantityDiff = newQuantity - item.quantity
          setTotalPrice((prevTotal) => prevTotal + item.price * quantityDiff)
          setTotalQuantities((prevQty) => prevQty + quantityDiff)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
      return updatedItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    setTotalPrice(0)
    setTotalQuantities(0)
    toast.success("Cart cleared")
  }

  // Calculate delivery fee
  const getDeliveryFee = () => {
    return totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  }

  // Calculate final total including delivery
  const getFinalTotal = () => {
    return totalPrice + getDeliveryFee()
  }

  const value = {
    cartItems,
    totalPrice,
    totalQuantities,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getDeliveryFee,
    getFinalTotal,
    DELIVERY_FEE,
    FREE_DELIVERY_THRESHOLD,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
