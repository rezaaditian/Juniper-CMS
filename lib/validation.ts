import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(200, "Password too long")
    .refine(
      (val) => val.length >= 8 || process.env.NODE_ENV === "development",
      "Password must be at least 8 characters"
    ),
  token: z.string().optional(),
});

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Title contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .refine(
      (val) => !val.startsWith("-") && !val.endsWith("-"),
      "Slug cannot start or end with hyphens"
    )
    .refine(
      (val) => !val.includes("--"),
      "Slug cannot contain consecutive hyphens"
    ),
  excerpt: z
    .string()
    .max(500, "Excerpt too long")
    .refine(
      (val) => !val || !/<script|javascript:|data:|vbscript:/i.test(val),
      "Excerpt contains potentially dangerous content"
    )
    .optional()
    .transform((val) => val?.trim()),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Content contains potentially dangerous content"
    ),
  tags: z
    .string()
    .max(200, "Tags too long")
    .regex(
      /^[a-zA-Z0-9\s,.-]*$/,
      "Tags can only contain letters, numbers, spaces, commas, periods, and hyphens"
    )
    .optional()
    .transform((val) => val?.trim()),
  category: z
    .string()
    .max(100, "Category too long")
    .regex(
      /^[a-zA-Z0-9\s-]*$/,
      "Category can only contain letters, numbers, spaces, and hyphens"
    )
    .optional()
    .transform((val) => val?.trim()),
  // featured_image: z
  //   .string()
  //   .optional()
  //   .or(z.literal(""))
  //   .refine((val) => {
  //     if (!val || val === "") return true;
  //     // More restrictive URL validation
  //     if (val.startsWith("http")) {
  //       try {
  //         const url = new URL(val);
  //         return ["http:", "https:"].includes(url.protocol);
  //       } catch {
  //         return false;
  //       }
  //     }
  //     // Validate file paths more strictly
  //     return /^\/uploads\/images\/\d{4}-\d{2}\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(
  //       val
  //     );
  //   }, "Must be a valid HTTPS URL or valid upload path"),
  featured_image: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val.startsWith("http") || val.startsWith("/"), {
      message: "Must be a valid HTTPS URL or valid upload path",
    }),
  published: z.boolean().optional(),
});

export const searchSchema = z.object({
  q: z
    .string()
    .max(100, "Search query too long")
    .regex(/^[a-zA-Z0-9\s\-_.]*$/, "Search query contains invalid characters")
    .optional()
    .transform((val) => val?.trim()),
  page: z.coerce.number().min(1).max(1000).optional(),
  category: z
    .string()
    .max(100, "Category too long")
    .regex(/^[a-zA-Z0-9\s-]*$/, "Category contains invalid characters")
    .optional(),
  published: z.enum(["all", "published", "draft"]).optional(),
});

export const serviceSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Title contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .refine(
      (val) => !val.startsWith("-") && !val.endsWith("-"),
      "Slug cannot start or end with hyphens"
    )
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Description contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Content contains potentially dangerous content"
    ),
  icon: z
    .string()
    .max(100, "Icon too long")
    .regex(/^[a-zA-Z0-9\s\-_.]*$/, "Icon contains invalid characters")
    .optional()
    .transform((val) => val?.trim()),
  order_index: z.number().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(
      /^[a-zA-Z0-9\s\-_.]*$/,
      "Name can only contain letters, numbers, spaces, hyphens, underscores, and periods"
    )
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Name contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .refine(
      (val) => !val.startsWith("-") && !val.endsWith("-"),
      "Slug cannot start or end with hyphens"
    )
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid 6-digit hex color")
    .refine((val) => {
      // Prevent potentially problematic colors (pure white/black for accessibility)
      const hex = val.toLowerCase();
      return hex !== "#000000" && hex !== "#ffffff";
    }, "Color must not be pure black or white for accessibility")
    .optional(),
});

export const testimonialSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(
      /^[a-zA-Z\s\-'.]*$/,
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    )
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Name contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title too long")
    .regex(/^[a-zA-Z0-9\s\-_.&]*$/, "Title contains invalid characters")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Title contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  company: z
    .string()
    .max(100, "Company name too long")
    .regex(/^[a-zA-Z0-9\s\-_.&]*$/, "Company name contains invalid characters")
    .refine(
      (val) => !val || !/<script|javascript:|data:|vbscript:/i.test(val),
      "Company contains potentially dangerous content"
    )
    .optional()
    .transform((val) => val?.trim()),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Content contains potentially dangerous content"
    )
    .transform((val) => val.trim()),
  rating: z.number().int().min(1).max(5),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const settingsSchema = z.record(
  z
    .string()
    .min(1, "Setting key is required")
    .max(100, "Setting key too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Setting key can only contain letters, numbers, underscores, and hyphens"
    ),
  z
    .string()
    .max(1000, "Setting value too long")
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      "Setting value contains potentially dangerous content"
    )
);

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "At least one item must be selected")
    .max(100, "Cannot delete more than 100 items at once"),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

export const bulkUpdateSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "At least one item must be selected")
    .max(100, "Cannot update more than 100 items at once"),
  updates: z
    .record(z.string(), z.any())
    .refine(
      (val) => Object.keys(val).length > 0,
      "At least one update is required"
    ),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
