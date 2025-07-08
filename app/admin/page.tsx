"use client"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const allowedEmails = ["zuhasurgical@gmail.com", "hmehmood121@gmail.com"]

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && allowedEmails.includes(user.email || "")) {
      router.push("/admin/dashboard")
    }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    if (!allowedEmails.includes(email)) {
      toast.error("Access denied. Unauthorized email address.")
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
        toast.success("Login successful!")
        router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast.error("Invalid email or password")
      } else if (error.code === "auth/too-many-requests") {
          toast.error("Too many failed attempts. Please try again later.")
      } else {
        toast.error("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Sign in to manage your store</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
              <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                  />
                </div>
              </div>

            {/* Password Field */}
              <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm font-medium text-yellow-800">Secure Access</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This area is restricted to authorized personnel only. Unauthorized access attempts will be logged.
                </p>
              </div>
            </div>
              </div>
            </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 ZuhaSurgical. All rights reserved.
          </p>
            </div>
      </div>
    </div>
  )
}
