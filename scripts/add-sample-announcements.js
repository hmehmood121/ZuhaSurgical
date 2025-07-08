// Script to add sample announcements to Firebase
// You can run this in the browser console

const sampleAnnouncements = [
  {
    text: "🎉 Free shipping on orders over PKR 10,000! Limited time offer.",
    icon: "🎉",
    endIcon: "🚚",
    backgroundColor: "#059669", // green-600
    textColor: "#ffffff",
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: null, // null means no expiration
    priority: 1,
  },
  {
    text: "🏥 New surgical instruments collection now available!",
    icon: "🏥",
    endIcon: "⚕️",
    backgroundColor: "#dc2626", // red-600
    textColor: "#ffffff",
    isActive: false, // Set to false so it doesn't show by default
    createdAt: new Date().toISOString(),
    expiresAt: null,
    priority: 2,
  },
  {
    text: "💊 Special discount on diagnostic equipment - Up to 20% off!",
    icon: "💊",
    endIcon: "🔬",
    backgroundColor: "#7c3aed", // purple-600
    textColor: "#ffffff",
    isActive: false,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    priority: 3,
  },
]

// Function to add announcements - can be called from browser console
window.addSampleAnnouncements = async () => {
  try {
    console.log("🚀 Adding sample announcements to Firebase...")

    // Import Firebase functions dynamically
    const { collection, addDoc } = await import("firebase/firestore")
    const { db } = await import("../firebase")

    let successCount = 0

    for (const announcement of sampleAnnouncements) {
      try {
        const docRef = await addDoc(collection(db, "announcements"), announcement)
        console.log(`✅ Added announcement ${successCount + 1}:`, announcement.text.substring(0, 50) + "...")
        successCount++
      } catch (error) {
        console.error(`❌ Failed to add announcement:`, announcement.text.substring(0, 30) + "...", error)
      }
    }

    console.log(`🎉 Successfully added ${successCount}/${sampleAnnouncements.length} announcements!`)

    if (successCount > 0) {
      console.log("💡 Refresh the page to see the announcements!")
    }
  } catch (error) {
    console.error("❌ Error adding announcements:", error)
    console.log("💡 Make sure you're running this on a page with Firebase initialized")
  }
}

// Instructions for users
console.log(`
🔧 To add sample announcements:
1. Open browser console (F12)
2. Type: addSampleAnnouncements()
3. Press Enter
4. Refresh the page to see results

Or you can manually add announcements in Firebase Console:
- Collection: announcements
- Required fields: text, isActive, priority
- Optional fields: icon, endIcon, backgroundColor, textColor, expiresAt
`)

export { sampleAnnouncements }
