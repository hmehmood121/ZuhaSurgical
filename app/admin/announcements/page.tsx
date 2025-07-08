"use client"

import AdminLayout from "../components/AdminLayout"
import { useEffect, useState } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../../../firebase"
import toast from "react-hot-toast"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, "announcement"))
      setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      toast.error("Error fetching announcements")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return
    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, "announcement"), { text: newAnnouncement })
      setAnnouncements([{ id: docRef.id, text: newAnnouncement }, ...announcements])
      setNewAnnouncement("")
      toast.success("Announcement added!")
    } catch (error) {
      toast.error("Failed to add announcement")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return
    setLoading(true)
    try {
      await deleteDoc(doc(db, "announcement", id))
      setAnnouncements(announcements.filter((a) => a.id !== id))
      toast.success("Announcement deleted!")
    } catch (error) {
      toast.error("Failed to delete announcement")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditingText(text)
  }

  const handleSave = async (id: string) => {
    if (!editingText.trim()) return
    setLoading(true)
    try {
      await updateDoc(doc(db, "announcement", id), { text: editingText })
      setAnnouncements(
        announcements.map((a) => (a.id === id ? { ...a, text: editingText } : a))
      )
      setEditingId(null)
      setEditingText("")
      toast.success("Announcement updated!")
    } catch (error) {
      toast.error("Failed to update announcement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Announcements</h1>
        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input
            type="text"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Add new announcement..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
            disabled={loading || !newAnnouncement.trim()}
          >
            <Plus size={20} />
            Add
          </button>
        </form>
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {loading && <div className="text-center text-gray-500">Loading...</div>}
          {!loading && announcements.length === 0 && (
            <div className="text-center text-gray-500">No announcements yet.</div>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center gap-3 border-b border-gray-100 py-2 last:border-b-0">
              {editingId === a.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleSave(a.id)}
                    className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Save"
                    disabled={loading}
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditingText("") }}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Cancel"
                    disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-gray-800">{a.text}</span>
                  <button
                    onClick={() => handleEdit(a.id, a.text)}
                    className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="Edit"
                    disabled={loading}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
} 