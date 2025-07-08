"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "../../../firebase"
import toast from "react-hot-toast"
import { jsPDF } from "jspdf"
import {
  Edit,
  Trash2,
  X,
  Search,
  Filter,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Save,
  Printer,
  DollarSign,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import AdminLayout from "../components/AdminLayout"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isDeleteConfirm, setDeleteConfirm] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter orders
  useEffect(() => {
    let filtered = orders
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }
    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersCollection = collection(db, "orders")
        const orderSnapshot = await getDocs(ordersCollection)
        const orderList = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log("Fetched orders:", orderList) // Debug log
        setOrders(orderList)
        setFilteredOrders(orderList)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error("Error loading orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteDoc(doc(db, "orders", orderToDelete.id))
        setOrders(orders.filter((order) => order.id !== orderToDelete.id))
        toast.success("Order deleted successfully!")
      } catch (error) {
        console.error("Error deleting order:", error)
        toast.error("Error deleting order")
      }
    }
    setDeleteConfirm(false)
    setOrderToDelete(null)
  }

  const handleDeleteClick = (order) => {
    setOrderToDelete(order)
    setDeleteConfirm(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(db, "orders", selectedOrder.id)
        await updateDoc(orderRef, selectedOrder)
        setOrders(orders.map((order) => (order.id === selectedOrder.id ? selectedOrder : order)))
        setShowModal(false)
        toast.success("Order updated successfully!")
      } catch (error) {
        console.error("Error updating order:", error)
        toast.error("Error updating order")
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSelectedOrder({ ...selectedOrder, [name]: value })
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
    switch (status?.toLowerCase()) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "shipped":
        return `${baseClasses} bg-blue-100 text-blue-800`
      case "delivered":
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getRowClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "shipped":
        return "bg-blue-50 hover:bg-blue-100"
      case "delivered":
        return "bg-green-50 hover:bg-green-100"
      case "pending":
        return "bg-yellow-50 hover:bg-yellow-100"
      default:
        return "bg-white hover:bg-gray-50"
    }
  }

  const getTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0
    return items.reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const handlePrint = () => {
    const doc = new jsPDF()
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      postalCode,
      total,
      subtotal,
      deliveryFee,
      paymentMethod,
      status,
      items,
    } = selectedOrder

    let yPosition = 10

    doc.text(`Order ID: ${orderId}`, 10, yPosition)
    yPosition += 10
    doc.text(`Name: ${customerName}`, 10, yPosition)
    yPosition += 10
    doc.text(`Email: ${customerEmail}`, 10, yPosition)
    yPosition += 10
    doc.text(`Phone: ${customerPhone}`, 10, yPosition)
    yPosition += 10
    doc.text(`Address: ${customerAddress}, ${customerCity}, ${postalCode}`, 10, yPosition)
    yPosition += 10
    doc.text(`Total Items: ${getTotalItems(items)}`, 10, yPosition)
    yPosition += 10
    doc.text(`Status: ${status}`, 10, yPosition)
    yPosition += 10
    doc.text(`Payment Method: ${paymentMethod}`, 10, yPosition)
    yPosition += 10
    doc.text(`Subtotal: Rs ${subtotal}`, 10, yPosition)
    yPosition += 10
    doc.text(`Delivery Charges: Rs ${deliveryFee}`, 10, yPosition)
    yPosition += 10
    doc.text(`Total Price: Rs ${total}`, 10, yPosition)

    yPosition += 20
    doc.text(`Order Items:`, 10, yPosition)
    yPosition += 10

    if (items && Array.isArray(items)) {
      items.forEach((item) => {
        const itemText = `- ${item.name}, Quantity: ${item.quantity}, Price: Rs${item.price}`
        const wrappedText = doc.splitTextToSize(itemText, 180)
        doc.text(wrappedText, 10, yPosition)
        yPosition += 10 * wrappedText.length
      })
    }

    yPosition += 20
    doc.text(`Seller Details:`, 10, yPosition)
    yPosition += 10
    const sellerDetails = [
      `Seller Name: Zuha Surgical`,
      `Address: Airport Road, City Khanpur, Distt Rahim Yar Khan`,
      `Phone No: 03215702979`,
      `Alternate Phone No: 03005702979`,
    ]
    sellerDetails.forEach((detail) => {
      const wrappedDetail = doc.splitTextToSize(detail, 180)
      doc.text(wrappedDetail, 10, yPosition)
      yPosition += 10 * wrappedDetail.length
    })

    doc.save(`Order_${orderId}.pdf`)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600">Manage and track all your orders</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{filteredOrders.length} Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={20} />
                  <span className="text-sm text-gray-600">{filteredOrders.length} orders</span>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className={`transition-colors duration-200 ${getRowClasses(order.status)}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{order.orderId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(order.status)}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm font-semibold text-green-600">Rs {order.total}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ShoppingCart className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{getTotalItems(order.items)} items</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900 capitalize">{order.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(order)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Package size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">Orders will appear here when customers place them.</p>
                </div>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete order "{orderToDelete?.orderId}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Order Modal */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-green-600" />
                      Edit Order #{selectedOrder.orderId}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                          <User className="w-5 h-5 mr-2 text-green-600" />
                          Customer Information
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            name="customerName"
                            value={selectedOrder.customerName || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              name="customerEmail"
                              value={selectedOrder.customerEmail || ""}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              name="customerPhone"
                              value={selectedOrder.customerPhone || ""}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                              name="customerAddress"
                              value={selectedOrder.customerAddress || ""}
                              onChange={handleChange}
                              rows={3}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="customerCity"
                              value={selectedOrder.customerCity || ""}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={selectedOrder.postalCode || ""}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                          <Package className="w-5 h-5 mr-2 text-green-600" />
                          Order Details
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                            <input
                              type="number"
                              name="subtotal"
                              value={selectedOrder.subtotal || ""}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee</label>
                            <input
                              type="number"
                              name="deliveryFee"
                              value={selectedOrder.deliveryFee || ""}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Price</label>
                          <input
                            type="number"
                            name="total"
                            value={selectedOrder.total || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="paymentMethod"
                              value={selectedOrder.paymentMethod || ""}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            name="status"
                            value={selectedOrder.status || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                        Order Items
                      </h4>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-green-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Product Name</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Quantity</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Price</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Color</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Size</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedOrder.items?.map((item, index) => (
                              <tr key={index} className="bg-white">
                                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">Rs {item.price}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.color || "N/A"}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.size || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Order
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Orders
