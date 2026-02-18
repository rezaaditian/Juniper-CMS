import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import { get } from "@/lib/db"
import TestimonialForm from "../../TestimonialForm"

export const runtime = "nodejs"

interface Testimonial {
  id: number
  name: string
  title: string
  company: string
  content: string
  rating: number
  featured: number
  active: number
}

export default async function EditTestimonialPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()
  if (!session) {
    redirect("/admin/login")
  }

  const { id } = params
  const testimonial = await get<Testimonial>("SELECT * FROM testimonials WHERE id = ?", [id])

  if (!testimonial) {
    notFound()
  }

  const testimonialData = {
    id: testimonial.id,
    name: testimonial.name,
    title: testimonial.title,
    company: testimonial.company || "",
    content: testimonial.content,
    rating: testimonial.rating,
    featured: Boolean(testimonial.featured),
    active: Boolean(testimonial.active),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Testimonial</h1>
        <p className="text-gray-600">Update testimonial information</p>
      </div>

      <TestimonialForm testimonial={testimonialData} />
    </div>
  )
}
