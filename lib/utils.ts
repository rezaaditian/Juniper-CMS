import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + "..."
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export function joinTags(tags: string[]): string {
  return tags.join(", ")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
