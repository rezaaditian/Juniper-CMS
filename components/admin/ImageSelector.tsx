"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  name: string;
  originalName: string;
  url: string;
  created: string;
  size: number;
  path: string;
  type: string;
}

interface ImageSelectorProps {
  selectedImage: string;
  onImageSelect: (url: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export default function ImageSelector({
  selectedImage,
  onImageSelect,
  onImageUpload,
  isUploading,
}: ImageSelectorProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const { toast } = useToast();

  const fetchUploadedImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch("/api/admin/images", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const imagesList = Array.isArray(data) ? data : data.images || [];
        setUploadedImages(imagesList);
      } else {
        toast({
          type: "error",
          title: "Failed to load images",
          description: "Could not fetch uploaded images",
        });
      }
    } catch (error) {
      console.error("Network error loading images:", error);
      toast({
        type: "error",
        title: "Network error",
        description: "Failed to connect to image service",
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if (showGallery && uploadedImages.length === 0) {
      fetchUploadedImages();
    }
  }, [showGallery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        type: "error",
        title: "Invalid file type",
        description: "Only JPEG, PNG, WebP, and GIF images are allowed",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File too large",
        description: "Image must be less than 5MB",
      });
      return;
    }

    await onImageUpload(file);
    // Refresh the gallery after upload
    if (showGallery) {
      fetchUploadedImages();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {showGallery ? "Hide Gallery" : "Choose from Gallery"}
        </button>
        <label className="px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg cursor-pointer hover:bg-green-700">
          Upload New Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {isUploading && (
        <div className="flex items-center p-3 rounded-lg bg-blue-50">
          <svg
            className="w-4 h-4 mr-2 text-blue-600 animate-spin"
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
          <span className="text-sm text-blue-600">Uploading image...</span>
        </div>
      )}

      {selectedImage && (
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="mb-2 text-sm text-gray-600">Selected Image:</p>
          <div className="flex items-center gap-3">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected"
              className="object-cover w-16 h-16 border rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedImage.split("/").pop()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onImageSelect("")}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {showGallery && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Image Gallery</h3>
            <button
              type="button"
              onClick={fetchUploadedImages}
              disabled={isLoadingImages}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoadingImages ? "Loading..." : "Refresh"}
            </button>
          </div>

          {isLoadingImages ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="w-6 h-6 text-gray-400 animate-spin"
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
              <span className="ml-2 text-gray-500">Loading images...</span>
            </div>
          ) : uploadedImages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
              <p className="text-sm">No images uploaded yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Upload your first image to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3 lg:grid-cols-4 max-h-64">
              {uploadedImages.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImage === image.url
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    onImageSelect(image.url);
                    setShowGallery(false);
                  }}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.originalName || image.name}
                    className="object-cover w-full h-20"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 group-hover:bg-opacity-40">
                    <svg
                      className="w-6 h-6 text-white transition-opacity opacity-0 group-hover:opacity-100"
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
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-1 text-white bg-black bg-opacity-75">
                    <p className="text-xs truncate">
                      {image.originalName || image.name}
                    </p>
                    <p className="text-xs text-gray-300">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
