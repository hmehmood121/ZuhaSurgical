"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "../../../firebase"
import AdminLayout from "../components/AdminLayout"
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Grid3X3,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly' | 'all'>('all')

  useEffect(() => {
    fetchDashboardData()
  }, [filter])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, "orders"))
      let orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[]

      // Filter orders by date
      const now = new Date()
      let filteredOrders = orders
      if (filter !== 'all') {
        filteredOrders = orders.filter(order => {
          const dateVal = order.createdAt || order.orderDate
          let orderDate: Date
          if (dateVal instanceof Timestamp && dateVal.toDate) {
            orderDate = dateVal.toDate()
          } else if (typeof dateVal === 'string') {
            orderDate = new Date(dateVal)
          } else {
            orderDate = new Date(dateVal)
          }
          if (filter === 'daily') {
            return orderDate.toDateString() === now.toDateString()
          } else if (filter === 'monthly') {
            return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth()
          } else if (filter === 'yearly') {
            return orderDate.getFullYear() === now.getFullYear()
          }
          return true
        })
      }

      // Fetch products
      const productsSnapshot = await getDocs(collection(db, "products"))
      const products = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[]

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const categories = categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[]

      // Calculate stats
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number.parseFloat(order.total) || 0), 0)
      const pendingOrders = filteredOrders.filter((order) => order.status === "pending").length
      const shippedOrders = filteredOrders.filter((order) => order.status === "Shipped").length
      const deliveredOrders = filteredOrders.filter((order) => order.status === "Delivered").length

      // Get recent orders (last 10)
      const sortedOrders = filteredOrders
        .sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime())
        .slice(0, 10)

      setStats({
        totalOrders: filteredOrders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCategories: categories.length,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
      })

      setRecentOrders(sortedOrders)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error loading dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={16} />
      case "shipped":
        return <Truck size={16} />
      case "delivered":
        return <CheckCircle size={16} />
      default:
        return <Package size={16} />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your store's performance and recent activity</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight size={16} />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="text-blue-500 mr-2" size={14} />
              <span className="text-blue-600 font-medium">All time orders</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight size={16} />
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="text-green-500 mr-2" size={14} />
              <span className="text-green-600 font-medium">Revenue growth</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Package className="text-purple-600" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight size={16} />
                <span className="text-sm font-medium">+5%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Eye className="text-purple-500 mr-2" size={14} />
              <span className="text-purple-600 font-medium">Active products</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Users className="text-orange-600" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight size={16} />
                <span className="text-sm font-medium">+3%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCategories}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Grid3X3 className="text-orange-500 mr-2" size={14} />
              <span className="text-orange-600 font-medium">Product categories</span>
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="text-yellow-700" size={20} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-800">{stats.pendingOrders}</p>
                <p className="text-sm text-yellow-600">Pending</p>
              </div>
            </div>
            <p className="text-sm text-yellow-700">Orders awaiting processing</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Truck className="text-blue-700" size={20} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-800">{stats.shippedOrders}</p>
                <p className="text-sm text-blue-600">Shipped</p>
              </div>
            </div>
            <p className="text-sm text-blue-700">Orders in transit</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="text-green-700" size={20} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-800">{stats.deliveredOrders}</p>
                <p className="text-sm text-green-600">Delivered</p>
              </div>
            </div>
            <p className="text-sm text-green-700">Successfully delivered</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all orders →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {order.orderId || order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {order.customerName || order.name}
                          </div>
                          <div className="text-sm text-gray-500">{order.customerEmail || order.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.total || order.totalPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt || order.orderDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No orders yet</p>
                        <p className="text-sm">Orders will appear here once customers start placing them</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

