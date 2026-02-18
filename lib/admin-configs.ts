import type { BulkActionsConfig } from "@/components/admin/UniversalBulkActions"

export const postsBulkConfig: BulkActionsConfig = {
  entityName: "post",
  entityNamePlural: "posts",
  checkboxClass: "post-checkbox",
  bulkDeleteEndpoint: "/api/posts/bulk-delete",
  bulkUpdateEndpoint: "/api/posts/bulk-update",
}

export const servicesBulkConfig: BulkActionsConfig = {
  entityName: "service",
  entityNamePlural: "services",
  checkboxClass: "service-checkbox",
  bulkDeleteEndpoint: "/api/services/bulk-delete",
  bulkUpdateEndpoint: "/api/services/bulk-update",
}

export const testimonialsBulkConfig: BulkActionsConfig = {
  entityName: "testimonial",
  entityNamePlural: "testimonials",
  checkboxClass: "testimonial-checkbox",
  bulkDeleteEndpoint: "/api/testimonials/bulk-delete",
  bulkUpdateEndpoint: "/api/testimonials/bulk-update",
}

export const categoriesBulkConfig: BulkActionsConfig = {
  entityName: "category",
  entityNamePlural: "categories",
  checkboxClass: "category-checkbox",
  bulkDeleteEndpoint: "/api/categories/bulk-delete",
  bulkUpdateEndpoint: "/api/categories/bulk-update",
}
