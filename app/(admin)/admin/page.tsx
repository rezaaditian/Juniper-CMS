import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

interface Stats {
  posts: number;
  services: number;
  testimonials: number;
  categories: number;
  uploadsSize: number;
  backupsCount: number;
}

async function getStats(): Promise<Stats> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const response = await fetch(`${baseUrl}/api/admin/dashboard`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      posts: 0,
      services: 0,
      testimonials: 0,
      categories: 0,
      uploadsSize: 0,
      backupsCount: 0,
    };
  }
}

export default async function AdminDashboard() {
  // Check authentication
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your proposal management website</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Blog Posts</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Services</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.services}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Testimonials
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.testimonials}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.categories}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <span className="text-sm text-gray-900">
                {stats.uploadsSize} MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backups</span>
              <span className="text-sm text-gray-900">
                {stats.backupsCount} files
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/posts/new"
              className="flex items-center p-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Blog Post
            </Link>
            <Link
              href="/admin/services/new"
              className="flex items-center p-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5 mr-3 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Service
            </Link>
            <Link
              href="/admin/backups"
              className="flex items-center p-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5 mr-3 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Create Backup
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Content Management
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/posts"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-blue-100 rounded-lg group-hover:bg-blue-200">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  Blog Posts
                </h3>
                <p className="text-sm text-gray-500">
                  Manage blog content and articles
                </p>
              </div>
            </Link>

            <Link
              href="/admin/services"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-green-100 rounded-lg group-hover:bg-green-200">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-900">
                  Services
                </h3>
                <p className="text-sm text-gray-500">
                  Manage service offerings
                </p>
              </div>
            </Link>

            <Link
              href="/admin/testimonials"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-yellow-300 hover:bg-yellow-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-yellow-100 rounded-lg group-hover:bg-yellow-200">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-yellow-900">
                  Testimonials
                </h3>
                <p className="text-sm text-gray-500">
                  Manage client testimonials
                </p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-purple-100 rounded-lg group-hover:bg-purple-200">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-900">
                  Categories
                </h3>
                <p className="text-sm text-gray-500">
                  Organize content categories
                </p>
              </div>
            </Link>

            <Link
              href="/admin/images"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-indigo-100 rounded-lg group-hover:bg-indigo-200">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-900">
                  Images
                </h3>
                <p className="text-sm text-gray-500">Manage uploaded images</p>
              </div>
            </Link>

            <Link
              href="/admin/backups"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg group hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-lg group-hover:bg-gray-200">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-900">
                  Backups
                </h3>
                <p className="text-sm text-gray-500">
                  Database backup management
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
