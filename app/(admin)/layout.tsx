import type React from "react"
import AdminNav from "./AdminNav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="admin-content">{children}</div>
    </div>
  )
}
