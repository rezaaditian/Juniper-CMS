"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UniversalBulkActions from "@/components/admin/UniversalBulkActions";
import { categoriesBulkConfig } from "@/lib/admin-configs";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const categoriesData = Array.isArray(data) ? data : data.items || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error("fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      // Refresh the categories list
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-4 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-4 mb-8 bg-gray-200 rounded"></div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={fetchCategories}
            className="mt-2 text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">
            Manage your blog post categories ({categories.length} total)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          New Category
        </Link>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <UniversalBulkActions
          items={categories}
          config={categoriesBulkConfig}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    id="select-all"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Color
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded category-checkbox focus:ring-blue-500"
                      data-id={category.id}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 mr-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {category.color}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="inline-flex items-center text-red-600 hover:text-red-900"
                        title="Delete Category"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
