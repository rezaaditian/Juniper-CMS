import { run, query } from "../lib/db"

async function clearMockTestimonials() {
  console.log("Clearing mock testimonial data...")

  try {
    // Get current testimonials to show what will be deleted
    const existingTestimonials = query("SELECT id, name, title, company FROM testimonials")

    if (existingTestimonials.length === 0) {
      console.log("No testimonials found in database.")
      return
    }

    console.log("Found testimonials:")
    existingTestimonials.forEach((testimonial: any) => {
      console.log(`- ID ${testimonial.id}: ${testimonial.name} (${testimonial.title} at ${testimonial.company})`)
    })

    // Clear all testimonials (you can be more selective if needed)
    const result = run("DELETE FROM testimonials")

    console.log(`✓ Cleared ${result.changes} testimonial(s) from database`)
    console.log(
      "The testimonials section will now be hidden on the homepage until you add real testimonials through the admin panel.",
    )
  } catch (error) {
    console.error("Error clearing testimonials:", error)
  }
}

clearMockTestimonials().catch(console.error)
