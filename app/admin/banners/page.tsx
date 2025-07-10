"use client"

import AdminLayout from "../components/AdminLayout"
import { useEffect, useRef, useState } from "react"
import { getDownloadURL, ref, uploadBytesResumable, listAll, deleteObject } from "firebase/storage"
import { db, storage } from "../../../firebase"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import toast from "react-hot-toast"
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react"

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const bannersSnapshot = await getDocs(collection(db, "banner"))
      const bannersList = bannersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBanners(bannersList)
    } catch (error) {
      toast.error("Error fetching banners")
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `banner/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          setUploading(false)
          toast.error("Upload failed")
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          await addDoc(collection(db, "banner"), { url: downloadURL, storagePath: storageRef.fullPath })
          toast.success("Banner uploaded!")
          setUploading(false)
          fetchBanners()
        }
      )
    } catch (error) {
      setUploading(false)
      toast.error("Upload failed")
    }
  }

  const handleDelete = async (banner: any) => {
    if (!window.confirm("Delete this banner?")) return
    try {
      if (banner.storagePath) {
        await deleteObject(ref(storage, banner.storagePath))
      }
      await deleteDoc(doc(db, "banner", banner.id))
      toast.success("Banner deleted!")
      setBanners(banners.filter((b) => b.id !== banner.id))
    } catch (error) {
      toast.error("Delete failed")
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Banner Images</h1>
        </div>
        <div className="mb-2 text-gray-500 text-sm text-center">Recommended size: <span className="font-semibold">1920 x 700 px</span></div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
            disabled={uploading}
          >
            <Upload size={20} />
            {uploading ? "Uploading..." : "Upload Banner"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {banners.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              <ImageIcon className="mx-auto mb-2" size={40} />
              No banners uploaded yet.
            </div>
          )}
          {banners.map((banner) => (
            <div key={banner.id} className="relative group rounded-xl overflow-hidden shadow border bg-white">
              <img
                src={banner.url}
                alt="Banner"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleDelete(banner)}
                className="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
} 