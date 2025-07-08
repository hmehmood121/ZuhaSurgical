"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "../../../firebase"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Grid3X3,
  ImageIcon,
  Megaphone,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  BarChart3,
  Users,
  Bell,
} from "lucide-react"
import toast from "react-hot-toast"
import { User as FirebaseUser } from "firebase/auth"

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage product catalog"
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "View and manage orders"
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Grid3X3,
    description: "Product categories"
  },
  {
    name: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
    description: "Manage banners"
  },
  {
    name: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    description: "Site announcements"
  },
  // {
  //   name: "Analytics",
  //   href: "/admin/analytics",
  //   icon: BarChart3,
  //   description: "Sales and performance"
  // },
  // {
  //   name: "Customers",
  //   href: "/admin/customers",
  //   icon: Users,
  //   description: "Customer management"
  // },
  // {
  //   name: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  //   description: "System settings"
  // },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const allowedEmails = ["zuhasurgical@gmail.com", "hmehmood121@gmail.com"]

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && allowedEmails.includes(user.email ?? "")) {
        setUser(user)
      } else {
        router.push("/admin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error logging out")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed z-50 inset-y-0 left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:flex`}
        style={{ top: 0 }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-green-600 font-bold text-xl">Z</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">ZuhaSurgical</span>
              <p className="text-green-100 text-xs">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Navigation and user info, scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6">
            <div className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-gray-200"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                      className={`mr-4 h-5 w-5 ${
                      isActive ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-xs ${isActive ? "text-green-600" : "text-gray-400"}`}>
                        {item.description}
                      </div>
                    </div>
                </Link>
              )
            })}
          </div>
        </nav>
        {/* User info and logout */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email ? user.email : ""}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
          </div>
          <button
            onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <LogOut className="mr-3 h-4 w-4" />
              Sign Out
          </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.email ? user.email.split("@")[0] : ""}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.email ? user.email.charAt(0).toUpperCase() : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
