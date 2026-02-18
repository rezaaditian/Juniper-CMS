"use server"

import { redirect } from "next/navigation"

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL }/api/services/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete service")
    }

    redirect("/admin/services")
  } catch (error) {
    console.error("Error deleting service:", error)
  }
}
