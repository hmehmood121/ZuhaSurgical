"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db } from "../../../firebase"
import toast from "react-hot-toast"
import { Plus, Edit, Trash2, X, Search, Filter, ImageIcon, Upload, Save, Tag, FileText } from "lucide-react"
import AdminLayout from "../components/AdminLayout"

const storage = getStorage()

const CategoryForm = () => {
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteConfirm, setDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filter categories
  useEffect(() => {
    let filtered = categories
    if (searchQuery) {
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    setFilteredCategories(filtered)
  }, [categories, searchQuery])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "categories"))
      const categoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCategories(categoryList)
      setFilteredCategories(categoryList)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Error loading categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const resetForm = () => {
    setCategory("")
    setDescription("")
    setImage(null)
    setImagePreview(null)
    setEditCategory(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (category.trim() === "" || description.trim() === "" || !image) {
      toast.error("Category, Description, and Image are required")
      return
    }

    setIsSubmitting(true)
    try {
      const imageRef = ref(storage, `categories/${Date.now()}_${image.name}`)
      const snapshot = await uploadBytes(imageRef, image)
      const imageUrl = await getDownloadURL(snapshot.ref)

      await addDoc(collection(db, "categories"), {
        name: category,
        description,
        imageUrl,
        createdAt: new Date().toISOString(),
      })

      toast.success("Category added successfully!")
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteDoc(doc(db, "categories", categoryToDelete.id))
        toast.success("Category deleted successfully!")
        fetchCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
        toast.error("Failed to delete category")
      }
    }
    setDeleteConfirm(false)
    setCategoryToDelete(null)
  }

  const handleEdit = (cat) => {
    setEditCategory(cat)
    setCategory(cat.name)
    setDescription(cat.description)
    setImagePreview(cat.imageUrl)
    setIsModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = editCategory.imageUrl
      if (image) {
        const imageRef = ref(storage, `categories/${Date.now()}_${image.name}`)
        const snapshot = await uploadBytes(imageRef, image)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      await updateDoc(doc(db, "categories", editCategory.id), {
        name: category,
        description,
        imageUrl,
        updatedAt: new Date().toISOString(),
      })

      toast.success("Category updated successfully!")
      resetForm()
      setIsModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{filteredCategories.length} Categories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Category Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-600" />
              Add New Category
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Enter category name"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                        placeholder="Enter category description"
                        rows={4}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        accept="image/*"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Click to upload image</p>
                            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <span className="text-sm text-gray-600">{filteredCategories.length} categories</span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Tag size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500">Get started by adding your first category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl || "/placeholder.svg"}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{cat.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3">{cat.description}</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {isDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
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

          {/* Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Edit className="w-5 h-5 mr-2 text-green-600" />
                    Edit Category
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="Enter category name"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            placeholder="Enter category description"
                            rows={4}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="hidden"
                          id="edit-image-upload"
                          accept="image/*"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="edit-image-upload" className="cursor-pointer">
                          {imagePreview ? (
                            <div className="space-y-2">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg mx-auto"
                              />
                              <p className="text-sm text-gray-600">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-gray-600">Click to upload image</p>
                              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Updating..." : "Update Category"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default CategoryForm
