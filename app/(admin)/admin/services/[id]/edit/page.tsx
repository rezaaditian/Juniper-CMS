import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import { get } from "@/lib/db"
import ServiceForm from "../../ServiceForm"

export const runtime = "nodejs"

interface Service {
  id: number
  title: string
  slug: string
  description: string
  content: string
  icon: string
  order_index: number
  active: number
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const service = get<Service>("SELECT * FROM services WHERE id = ?", [id])

  if (!service) {
    notFound()
  }

  const serviceData = {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description,
    content: service.content,
    icon: service.icon || "",
    order_index: service.order_index,
    active: Boolean(service.active),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
        <p className="text-gray-600">Update your service information</p>
      </div>

      <ServiceForm service={serviceData} />
    </div>
  )
}
