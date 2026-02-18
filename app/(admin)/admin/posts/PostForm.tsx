"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import ImageSelector from "@/components/admin/ImageSelector";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';
import { lexicalDefaultValue } from '@/lib/lexical-default-state';
import { parseContentToLexicalState } from '@/lib/lexical';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface PostFormProps {
  post?: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string;
    category: string;
    featured_image: string;
    published: number;
  };
}

export default function PostForm({ post }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [category, setCategory] = useState(post?.category || "");
  const [featuredImage, setFeaturedImage] = useState(
    post?.featured_image || ""
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [published, setPublished] = useState(post?.published === 1 || false);

  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const { csrfToken, setCsrfToken } = useCsrfToken();

  const [editorState, setEditorState] = useState<SerializedEditorState>(
    parseContentToLexicalState(post?.content)
  );

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories?simple=true", { credentials: "include" })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const categoryList = Array.isArray(data) ? data : data.items || [];
        setCategories(categoryList);
      })
      .catch((error) => {
        console.error("Failed to load categories:", error);
        toast({
          type: "warning",
          title: "Warning",
          description: "Failed to load categories",
        });
      });
  }, [toast]);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!post) {
      setSlug(slugify(value));
    }
    // Clear validation error
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!content.trim()) {
      errors.content = "Content is required";
    }

    if (excerpt && excerpt.length > 500) {
      errors.excerpt = "Excerpt must be less than 500 characters";
    }

    if (tags && tags.length > 200) {
      errors.tags = "Tags must be less than 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const publicUrl = `/api/files/${data.url}`;
        setFeaturedImage(publicUrl);
        toast({
          type: "success",
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        toast({
          type: "error",
          title: "Upload failed",
          description: data.error || "Failed to upload image",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        title: "Upload failed",
        description: "Network error occurred during upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

    if (!validateForm()) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please fix the errors below",
      });
      return;
    }

    setIsLoading(true);

    try {
      const url = post ? `/api/posts/${post.id}` : "/api/posts";
      const method = post ? "PUT" : "POST";

      const requestBody = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content,
        tags: tags.trim(),
        category: category.trim(),
        featured_image: featuredImage,
        published,
        csrfToken,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          type: "success",
          title: "Success",
          description: post
            ? "Post updated successfully!"
            : "Post created successfully!",
        });
        setTimeout(() => {
          router.push("/admin/posts");
        }, 1000);
      } else {
        if (response.status === 403 && data.error?.includes("CSRF")) {
          toast({
            type: "error",
            title: "Security Error",
            description:
              "Security verification failed. Please refresh the page and try again.",
          });
          setCsrfToken("");
        } else {
          toast({
            type: "error",
            title: "Save failed",
            description: data.error || `Server error (${response.status})`,
          });
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        type: "error",
        title: "Network error",
        description: "Please check your connection and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {post ? "Edit Post" : "Create New Post"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter post title"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (validationErrors.slug) {
                    setValidationErrors((prev) => ({ ...prev, slug: "" }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.slug ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="post-url-slug"
              />
              {validationErrors.slug && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.slug}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                URL-friendly version of the title
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No categories available.{" "}
                  <a
                    href="/admin/categories"
                    className="text-blue-600 hover:underline"
                  >
                    Create one first
                  </a>
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Featured Image
              </label>
              <ImageSelector
                selectedImage={featuredImage}
                onImageSelect={setFeaturedImage}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="excerpt"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                if (validationErrors.excerpt) {
                  setValidationErrors((prev) => ({ ...prev, excerpt: "" }));
                }
              }}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.excerpt ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Brief description of the post"
            />
            {validationErrors.excerpt && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.excerpt}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Optional summary that appears in post listings
            </p>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <Editor
              editorSerializedState={editorState}
              // onSerializedChange={(value) => setEditorState(value)}
              onSerializedChange={(value) => {
                setEditorState(value)
                setContent(JSON.stringify(value))
              }}
            />
            {validationErrors.content && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.content}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supports Markdown formatting. You can also embed images using
              ![alt text](image-url)
            </p>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                if (validationErrors.tags) {
                  setValidationErrors((prev) => ({ ...prev, tags: "" }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.tags ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="tag1, tag2, tag3"
            />
            {validationErrors.tags && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.tags}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="published"
              className="block ml-2 text-sm text-gray-700"
            >
              Publish immediately
            </label>
            <p className="ml-2 text-sm text-gray-500">
              (uncheck to save as draft)
            </p>
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
                  {post ? "Update Post" : "Create Post"}
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
    </>
  );
}
