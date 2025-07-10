"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebase"

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch active announcement from Firebase
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true)

        // Simple query for all announcements (no composite index needed)
        const querySnapshot = await getDocs(collection(db, "announcement"))

        if (!querySnapshot.empty) {
          // Filter and sort on the client side to avoid index requirements
          const announcements = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((announcement) => announcement.isActive === true)
            .sort((a, b) => {
              // Sort by priority first (lower number = higher priority)
              if (a.priority !== b.priority) {
                return (a.priority || 999) - (b.priority || 999)
              }
              // Then by creation date (newest first)
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            })

          if (announcements.length > 0) {
            const selectedAnnouncement = announcements[0]

            // Check if announcement has expired
            if (selectedAnnouncement.expiresAt) {
              const expirationDate = new Date(selectedAnnouncement.expiresAt)
              const now = new Date()

              if (now > expirationDate) {
                console.log("Announcement expired, using fallback")
                setAnnouncement(getFallbackAnnouncement())
                return
              }
            }

            setAnnouncement(selectedAnnouncement)
            console.log("Announcement loaded:", selectedAnnouncement.text)
          } else {
            console.log("No active announcements found, using fallback")
            setAnnouncement(getFallbackAnnouncement())
          }
        } else {
          console.log("No announcements collection foundd, using fallback")
          setAnnouncement(getFallbackAnnouncement())
        }
      } catch (error) {
        console.error("Error fetching announcement:", error)
        setAnnouncement(getFallbackAnnouncement())
      } finally {
        setLoading(false)
      }
    }

    // Helper function for fallback announcement
    const getFallbackAnnouncement = () => ({
      text: "Free shipping on orders over PKR 10,000! Limited time offer.",
      icon: "🎉",
      endIcon: "🚚",
      backgroundColor: "#059669", // green-600
      textColor: "#ffffff",
    })

    fetchAnnouncement()
  }, [])

  // Don't render if not visible or still loading
  if (!isVisible || loading || !announcement) return null

  return (
    <div
      className="text-white py-2 px-4 text-center text-sm relative animate-slide-down"
      style={{
        backgroundColor: announcement.backgroundColor || "#059669",
        color: announcement.textColor || "#ffffff",
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {announcement.icon && <span className="animate-pulse">{announcement.icon}</span>}
        <span className="font-medium">{announcement.text}</span>
        {announcement.endIcon && <span className="animate-pulse">{announcement.endIcon}</span>}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-black hover:bg-opacity-20 rounded-full p-1 transition-colors"
        style={{ color: announcement.textColor || "#ffffff" }}
      >
        <X size={16} />
      </button>
    </div>
  )
}
