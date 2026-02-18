"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useCsrfToken } from "@/hooks/use-csrf-token";

interface CategoryFormProps {
  category?: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#059669" },
  { name: "Red", value: "#dc2626" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Orange", value: "#ea580c" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Pink", value: "#db2777" },
  { name: "Indigo", value: "#6366f1" },
];

export default function CategoryForm({ category }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || "#6366f1");

  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const { csrfToken } = useCsrfToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfToken) {
      toast({
        type: "error",
        title: "Security Error",
        description:
          "Security token not available. Please refresh the page and try again.",
      });
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = category ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
          csrfToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          category
            ? "Category updated successfully!"
            : "Category created successfully!"
        );
        setTimeout(() => {
          router.push("/admin/categories");
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to save category");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {category ? "Edit Category" : "Create New Category"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="flex items-center px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center px-4 py-3 text-green-700 border border-green-200 rounded-lg bg-green-50">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {success}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                  color === colorOption.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <div
                  className="w-4 h-4 mr-2 rounded-full"
                  style={{ backgroundColor: colorOption.value }}
                ></div>
                <span className="text-sm">{colorOption.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label
              htmlFor="custom-color"
              className="block mb-1 text-sm text-gray-600"
            >
              Or enter custom hex color:
            </label>
            <input
              type="color"
              id="custom-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {category ? "Update Category" : "Create Category"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-2 text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
