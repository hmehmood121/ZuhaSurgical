"use client"

import { usePathname } from "next/navigation"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AnnouncementBar from "../components/AnnouncementBar"
import { CartProvider } from "../context/CartContext"
import { Toaster } from "react-hot-toast"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CartProvider>
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Navbar />}
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster position="top-center" />
    </CartProvider>
  );
} 