"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "../../../firebase"
import AdminLayout from "../components/AdminLayout"
import { useDropzone } from "react-dropzone"
import {
  Plus,
  Edit,
  Trash2,
  Share2,
  X,
  Upload,
  Search,
  Filter,
  ImageIcon,
  Package,
  Bold,
  Copy,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setModalOpen] = useState(false)
  const [isDeleteConfirm, setDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedShareProduct, setSelectedShareProduct] = useState(null)

  // Form states
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")
  const [selectedProduct, setSelectedProduct] = useState({
    productName: "",
    slug: "",
    category: "",
    oldPrice: "",
    price: "",
    shortDescription: "",
    description: "",
    stock: "",
    colors: [],
    sizes: [],
    images: [],
    status: "active",
  })

  // Fetch data
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Filter products
  useEffect(() => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter((product) => product.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, statusFilter, categoryFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const productsCollection = collection(db, "products")
      const productsSnapshot = await getDocs(productsCollection)
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProducts(productsList)
      setFilteredProducts(productsList)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error loading products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const categoriesList = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCategories(categoriesList)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const uploadToFirebase = async (imageFile) => {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
      const uploadTask = uploadBytesResumable(storageRef, imageFile)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Track upload progress if needed
          },
          (error) => {
            console.error("Error uploading file:", error)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          },
        )
      })
    } catch (error) {
      console.error("Error uploading to Firebase:", error)
      throw error
    }
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "products", productToDelete.id))
        setProducts(products.filter((p) => p.id !== productToDelete.id))
        toast.success("Product deleted successfully")
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Error deleting product")
      }
    }
    setDeleteConfirm(false)
    setProductToDelete(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(false)
    setProductToDelete(null)
  }

  const handleEditClick = (product) => {
    setSelectedProduct({
      ...product,
      colors: product.colors || [],
      sizes: product.sizes || [],
      images: product.images || [],
    })
    setIsAddMode(false)
    setModalOpen(true)
  }

  const handleAddClick = () => {
    setSelectedProduct({
      productName: "",
      slug: "",
      category: "",
      oldPrice: "",
      price: "",
      shortDescription: "",
      description: "",
      stock: "",
      colors: [],
      sizes: [],
      images: [],
      status: "active",
    })
    setIsAddMode(true)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedProduct({
      productName: "",
      slug: "",
      category: "",
      oldPrice: "",
      price: "",
      shortDescription: "",
      description: "",
      stock: "",
      colors: [],
      sizes: [],
      images: [],
      status: "active",
    })
    setNewColor("")
    setNewSize("")
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()

    if (!selectedProduct.productName || !selectedProduct.price) {
      toast.error("Please fill in required fields")
      return
    }

    try {
      const productData = { ...selectedProduct }

      // Upload new images
      const imageUploadPromises = selectedProduct.images.map(async (image) => {
        if (image.file instanceof File) {
          return await uploadToFirebase(image.file)
        }
        return typeof image === "string" ? image : image.preview || image
      })

      const uploadedImages = await Promise.all(imageUploadPromises)
      productData.images = uploadedImages

      if (isAddMode) {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
        })
        toast.success("Product added successfully")
      } else {
        // Update existing product
        await updateDoc(doc(db, "products", selectedProduct.id), productData)
        toast.success("Product updated successfully")
      }

      setModalOpen(false)
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Error saving product")
    }
  }

  const handleGenerateSlug = () => {
    const slug = selectedProduct.productName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
    setSelectedProduct({ ...selectedProduct, slug })
  }

  const handleAddColor = () => {
    if (newColor.trim() !== "" && !selectedProduct.colors.includes(newColor)) {
      setSelectedProduct((prevState) => ({
        ...prevState,
        colors: [...prevState.colors, newColor],
      }))
      setNewColor("")
    }
  }

  const handleAddSize = () => {
    if (newSize.trim() !== "" && !selectedProduct.sizes.includes(newSize)) {
      setSelectedProduct((prevState) => ({
        ...prevState,
        sizes: [...prevState.sizes, newSize],
      }))
      setNewSize("")
    }
  }

  const handleDeleteColor = (index) => {
    const updatedColors = selectedProduct.colors.filter((_, idx) => idx !== index)
    setSelectedProduct((prevState) => ({
      ...prevState,
      colors: updatedColors,
    }))
  }

  const handleDeleteSize = (index) => {
    const updatedSizes = selectedProduct.sizes.filter((_, idx) => idx !== index)
    setSelectedProduct((prevState) => ({
      ...prevState,
      sizes: updatedSizes,
    }))
  }

  const onDrop = (acceptedFiles) => {
    const acceptedImages = acceptedFiles.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }))

    setSelectedProduct((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...acceptedImages],
    }))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  })

  const handleDeleteImage = (index) => {
    const updatedImages = selectedProduct.images.filter((_, idx) => idx !== index)
    setSelectedProduct((prevState) => ({
      ...prevState,
      images: updatedImages,
    }))
  }

  const handleShare = (product) => {
    setSelectedShareProduct(product)
    setShareModalOpen(true)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        toast.success("Copied to clipboard!")
      } catch (fallbackError) {
        toast.error("Failed to copy to clipboard")
      }
      document.body.removeChild(textArea)
    }
  }

  const handleNativeShare = async (product) => {
    const productUrl = `${window.location.origin}/product/${product.slug || product.id}`

    if (navigator.share && navigator.canShare) {
      try {
        const shareData = {
          title: product.productName,
          text: product.shortDescription || `Check out ${product.productName}`,
          url: productUrl,
        }

        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          toast.success("Product shared successfully")
          setShareModalOpen(false)
        } else {
          // Fallback to copy URL
          await copyToClipboard(productUrl)
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing product:", error)
          // Fallback to copy URL
          await copyToClipboard(productUrl)
        }
      }
    } else {
      // Fallback to copy URL
      await copyToClipboard(productUrl)
    }
  }

  const openProductInNewTab = (product) => {
    const productUrl = `${window.location.origin}/product/${product.slug || product.id}`
    window.open(productUrl, "_blank")
    toast.success("Product opened in new tab")
  }

  const getImageUrl = (image) => {
    if (typeof image === "string") return image
    if (image.file instanceof File) return image.preview
    return image.preview || image
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
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
              <option value="active">Active</option>
              <option value="non-active">Non-active</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <span className="text-sm text-gray-600">{filteredProducts.length} products</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.productName}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="text-gray-400" size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                          <div className="text-sm text-gray-500">
                            {product.sizes?.length > 0 && `Sizes: ${product.sizes.join(", ")}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">PKR {product.price}</div>
                      {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">PKR {product.oldPrice}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleShare(product)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Get started by adding your first product.</p>
            </div>
          )}
        </div>

        {/* Share Modal */}
        {shareModalOpen && selectedShareProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Product</h3>
                <button onClick={() => setShareModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Share "{selectedShareProduct.productName}"</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 break-all">
                  {`${window.location.origin}/product/${selectedShareProduct.slug || selectedShareProduct.id}`}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleNativeShare(selectedShareProduct)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 size={16} />
                  Share via System
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/product/${selectedShareProduct.slug || selectedShareProduct.id}`,
                    )
                  }
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy size={16} />
                  Copy Link
                </button>

                <button
                  onClick={() => openProductInNewTab(selectedShareProduct)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{productToDelete?.productName}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{isAddMode ? "Add New Product" : "Edit Product"}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={selectedProduct.productName}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, productName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedProduct.slug}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, slug: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="product-slug"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={selectedProduct.category}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Old Price</label>
                        <input
                          type="number"
                          value={selectedProduct.oldPrice}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, oldPrice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={selectedProduct.stock}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedProduct.status}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="non-active">Non-active</option>
                      </select>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Product Images</h3>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600">
                        {isDragActive ? "Drop images here..." : "Drag & drop images here, or click to select"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>

                    {selectedProduct.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={getImageUrl(image) || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Product Description</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <textarea
                      rows={3}
                      value={selectedProduct.shortDescription}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, shortDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Brief product description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                    <div className="border border-gray-300 rounded-lg">
                      <div className="border-b border-gray-200 p-2 flex gap-2 bg-gray-50 rounded-t-lg">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Bold size={14} />
                          Formatting tip: Use **bold**, *italic*, and line breaks for better formatting
                        </span>
                      </div>
                      <textarea
                        rows={8}
                        value={selectedProduct.description}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                        className="w-full px-3 py-2 border-0 rounded-b-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="Enter detailed product description here...

You can use:
- **Bold text** for emphasis
- *Italic text* for style
- Line breaks for paragraphs
- • Bullet points
- Numbers for lists"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors and Sizes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add color"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Add size"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => handleDeleteSize(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isAddMode ? "Add Product" : "Update Product"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
