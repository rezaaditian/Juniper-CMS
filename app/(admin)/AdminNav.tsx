"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "./LogoutButton"

export default function AdminNav() {
  const pathname = usePathname()

  // Don't show nav on login page
  if (pathname === "/admin/login") {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-semibold text-gray-900">
              Admin Panel
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/admin" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/posts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/posts") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Posts
              </Link>
              <Link
                href="/admin/services"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/services")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Services
              </Link>
              <Link
                href="/admin/categories"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/categories")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Categories
              </Link>
              <Link
                href="/admin/testimonials"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/testimonials")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Testimonials
              </Link>
              <Link
                href="/admin/images"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/images")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Images
              </Link>
              <Link
                href="/admin/backups"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/backups")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Backups
              </Link>
              <Link
                href="/admin/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin/settings")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Settings
              </Link>
              <Link
                href="/"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                View Site
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
