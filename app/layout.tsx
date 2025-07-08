import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppShell from "./components/AppShell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZuhaSurgical - Premium Medical Equipment",
  description: "Your trusted source for high-quality medical and surgical equipments",
  icons: {
    icon: {url: "/favicon.ico"},
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
