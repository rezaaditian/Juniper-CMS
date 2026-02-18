import type { CrudConfig } from "./crud"
import { postSchema, serviceSchema, categorySchema, testimonialSchema } from "./validation"
import { slugify } from "./utils"

export const postConfig: CrudConfig = {
  tableName: "posts",
  schema: postSchema,
  slugField: "slug",
  defaultValues: {
    published: 0,
    published_at: null,
  },
  transformData: (data: any) => ({
    ...data,
    published: data.published ? 1 : 0,
    published_at: data.published ? new Date().toISOString() : null,
    excerpt: data.excerpt || "",
    tags: data.tags || "",
    category: data.category || "",
    featured_image: data.featured_image || "",
  }),
  publicFilter: "published = 1",
}

export const serviceConfig: CrudConfig = {
  tableName: "services",
  schema: serviceSchema,
  slugField: "slug",
  defaultValues: {
    active: 1,
    order_index: 0,
  },
  transformData: (data: any) => ({
    ...data,
    slug: data.slug || slugify(data.title),
    active: data.active ? 1 : 0,
    icon: data.icon || "",
    order_index: data.order_index || 0,
  }),
  publicFilter: "active = 1",
}

export const categoryConfig: CrudConfig = {
  tableName: "categories",
  schema: categorySchema,
  slugField: "slug",
  defaultValues: {
    color: "#6366f1",
  },
  transformData: (data: any) => ({
    ...data,
    slug: data.slug || slugify(data.name),
    color: data.color || "#6366f1",
  }),
}

export const testimonialConfig: CrudConfig = {
  tableName: "testimonials",
  schema: testimonialSchema,
  defaultValues: {
    active: 1,
    featured: 0,
    rating: 5,
  },
  transformData: (data: any) => ({
    ...data,
    active: data.active ? 1 : 0,
    featured: data.featured ? 1 : 0,
    company: data.company || "",
  }),
  publicFilter: "active = 1",
}
