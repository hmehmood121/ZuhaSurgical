// Update your existing firebase.js to include auth
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAC-XXLBMRKIJqeZChgLImYv9blpRIxx2k",
  authDomain: "zuha-bfae4.firebaseapp.com",
  projectId: "zuha-bfae4",
  storageBucket: "zuha-bfae4.appspot.com",
  messagingSenderId: "63851762522",
  appId: "1:63851762522:web:ddf3f4f5a78af6f8de9963",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Export the app as well for other uses
export default app
