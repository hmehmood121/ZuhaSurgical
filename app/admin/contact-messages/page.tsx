"use client"

import AdminLayout from "../components/AdminLayout"
import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../../firebase"
import toast from "react-hot-toast"
import { Mail, Loader2, Edit, Trash2, Save, X } from "lucide-react"

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      setError("")
      try {
        // Always fetch all documents without orderBy
        const snapshot = await getDocs(collection(db, "contactMessages"))
        console.log("DEBUG: snapshot.docs", snapshot.docs)
        const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log("DEBUG: mapped messages", mapped)
        setMessages(mapped)
      } catch (err: any) {
        setError("Failed to load messages.")
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, "contactMessages", id))
      setMessages(messages.filter((msg) => msg.id !== id))
      toast.success("Message deleted!")
    } catch (err) {
      toast.error("Failed to delete message.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (msg: any) => {
    setEditingId(msg.id)
    setEditData({ ...msg })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSave = async () => {
    if (!editData.name || !editData.email || !editData.subject || !editData.message) {
      toast.error("All fields are required.")
      return
    }
    try {
      await updateDoc(doc(db, "contactMessages", editingId!), {
        name: editData.name,
        email: editData.email,
        subject: editData.subject,
        message: editData.message,
      })
      setMessages(messages.map((msg) => (msg.id === editingId ? { ...msg, ...editData } : msg)))
      toast.success("Message updated!")
      setEditingId(null)
      setEditData({})
    } catch (err) {
      toast.error("Failed to update message.")
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  // Remove handleAutoFixDates and the button

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Mail className="text-green-600" /> Contact Messages
        </h1>
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-green-600 mr-2" size={32} />
            <span className="text-gray-500 text-lg">Loading messages...</span>
          </div>
        )}
        {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="text-gray-500">No contact messages found.</div>
        )}
        {!loading && !error && messages.length > 0 && (
          <div className="overflow-x-auto rounded-xl shadow bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {messages.map(msg => (
                  <tr key={msg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === msg.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        msg.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                      {editingId === msg.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        msg.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === msg.id ? (
                        <input
                          type="text"
                          name="subject"
                          value={editData.subject}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        msg.subject
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-700 max-w-xs break-words">
                      {editingId === msg.id ? (
                        <textarea
                          name="message"
                          value={editData.message}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                          rows={2}
                        />
                      ) : (
                        msg.message
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {(() => {
                        const t = msg.timestamp
                        if (!t) return "-"
                        if (typeof t === "string" || t instanceof String) {
                          const d = new Date(t as string)
                          return isNaN(d.getTime()) ? "-" : d.toLocaleString()
                        }
                        if (t.seconds) {
                          return new Date(t.seconds * 1000).toLocaleString()
                        }
                        if (typeof t.toDate === "function") {
                          return t.toDate().toLocaleString()
                        }
                        return "-"
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                      {editingId === msg.id ? (
                        <>
                          <button
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(msg)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                            disabled={deletingId === msg.id}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 