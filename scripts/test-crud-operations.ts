import { query, run, get } from "../lib/db"

interface TestResult {
  operation: string
  entity: string
  success: boolean
  error?: string
  data?: any
}

const results: TestResult[] = []

function logResult(operation: string, entity: string, success: boolean, error?: string, data?: any) {
  results.push({ operation, entity, success, error, data })
  const status = success ? "✅ PASS" : "❌ FAIL"
  console.log(`${status} ${entity} ${operation}${error ? `: ${error}` : ""}`)
}

async function testCrudOperations() {
  console.log("🧪 Testing Universal CRUD Operations\n")

  // Test Posts CRUD
  console.log("📝 Testing Posts CRUD:")
  try {
    // Create
    const postResult = run(
      `INSERT INTO posts (title, slug, excerpt, content, tags, category, featured_image, published, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Test Post",
        "test-post",
        "Test excerpt",
        "Test content",
        "test,crud",
        "general",
        "",
        1,
        new Date().toISOString(),
      ],
    )
    const postId = postResult.lastInsertRowid
    logResult("CREATE", "Posts", true, undefined, { id: postId })

    // Read
    const post = get("SELECT * FROM posts WHERE id = ?", [postId])
    logResult("READ", "Posts", !!post, post ? undefined : "Post not found", post)

    // Update
    run("UPDATE posts SET title = ? WHERE id = ?", ["Updated Test Post", postId])
    const updatedPost = get("SELECT * FROM posts WHERE id = ?", [postId])
    logResult(
      "UPDATE",
      "Posts",
      updatedPost?.title === "Updated Test Post",
      updatedPost?.title !== "Updated Test Post" ? "Title not updated" : undefined,
    )

    // Delete
    run("DELETE FROM posts WHERE id = ?", [postId])
    const deletedPost = get("SELECT * FROM posts WHERE id = ?", [postId])
    logResult("DELETE", "Posts", !deletedPost, deletedPost ? "Post still exists" : undefined)
  } catch (error: any) {
    logResult("CRUD", "Posts", false, error.message)
  }

  // Test Services CRUD
  console.log("\n🛠️ Testing Services CRUD:")
  try {
    // Create
    const serviceResult = run(
      `INSERT INTO services (title, slug, description, content, icon, order_index, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Test Service", "test-service", "Test description", "Test content", "🔧", 1, 1],
    )
    const serviceId = serviceResult.lastInsertRowid
    logResult("CREATE", "Services", true, undefined, { id: serviceId })

    // Read
    const service = get("SELECT * FROM services WHERE id = ?", [serviceId])
    logResult("READ", "Services", !!service, service ? undefined : "Service not found", service)

    // Update
    run("UPDATE services SET title = ? WHERE id = ?", ["Updated Test Service", serviceId])
    const updatedService = get("SELECT * FROM services WHERE id = ?", [serviceId])
    logResult(
      "UPDATE",
      "Services",
      updatedService?.title === "Updated Test Service",
      updatedService?.title !== "Updated Test Service" ? "Title not updated" : undefined,
    )

    // Delete
    run("DELETE FROM services WHERE id = ?", [serviceId])
    const deletedService = get("SELECT * FROM services WHERE id = ?", [serviceId])
    logResult("DELETE", "Services", !deletedService, deletedService ? "Service still exists" : undefined)
  } catch (error: any) {
    logResult("CRUD", "Services", false, error.message)
  }

  // Test Categories CRUD
  console.log("\n📂 Testing Categories CRUD:")
  try {
    // Create
    const categoryResult = run(
      `INSERT INTO categories (name, slug, color) 
       VALUES (?, ?, ?)`,
      ["Test Category", "test-category", "#ff0000"],
    )
    const categoryId = categoryResult.lastInsertRowid
    logResult("CREATE", "Categories", true, undefined, { id: categoryId })

    // Read
    const category = get("SELECT * FROM categories WHERE id = ?", [categoryId])
    logResult("READ", "Categories", !!category, category ? undefined : "Category not found", category)

    // Update
    run("UPDATE categories SET name = ? WHERE id = ?", ["Updated Test Category", categoryId])
    const updatedCategory = get("SELECT * FROM categories WHERE id = ?", [categoryId])
    logResult(
      "UPDATE",
      "Categories",
      updatedCategory?.name === "Updated Test Category",
      updatedCategory?.name !== "Updated Test Category" ? "Name not updated" : undefined,
    )

    // Delete
    run("DELETE FROM categories WHERE id = ?", [categoryId])
    const deletedCategory = get("SELECT * FROM categories WHERE id = ?", [categoryId])
    logResult("DELETE", "Categories", !deletedCategory, deletedCategory ? "Category still exists" : undefined)
  } catch (error: any) {
    logResult("CRUD", "Categories", false, error.message)
  }

  // Test Testimonials CRUD
  console.log("\n💬 Testing Testimonials CRUD:")
  try {
    // Create
    const testimonialResult = run(
      `INSERT INTO testimonials (name, title, company, content, rating, featured, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Test Client", "Test Title", "Test Company", "Test testimonial content", 5, 0, 1],
    )
    const testimonialId = testimonialResult.lastInsertRowid
    logResult("CREATE", "Testimonials", true, undefined, { id: testimonialId })

    // Read
    const testimonial = get("SELECT * FROM testimonials WHERE id = ?", [testimonialId])
    logResult("READ", "Testimonials", !!testimonial, testimonial ? undefined : "Testimonial not found", testimonial)

    // Update
    run("UPDATE testimonials SET name = ? WHERE id = ?", ["Updated Test Client", testimonialId])
    const updatedTestimonial = get("SELECT * FROM testimonials WHERE id = ?", [testimonialId])
    logResult(
      "UPDATE",
      "Testimonials",
      updatedTestimonial?.name === "Updated Test Client",
      updatedTestimonial?.name !== "Updated Test Client" ? "Name not updated" : undefined,
    )

    // Delete
    run("DELETE FROM testimonials WHERE id = ?", [testimonialId])
    const deletedTestimonial = get("SELECT * FROM testimonials WHERE id = ?", [testimonialId])
    logResult(
      "DELETE",
      "Testimonials",
      !deletedTestimonial,
      deletedTestimonial ? "Testimonial still exists" : undefined,
    )
  } catch (error: any) {
    logResult("CRUD", "Testimonials", false, error.message)
  }

  // Test Settings
  console.log("\n⚙️ Testing Settings:")
  try {
    // Read current settings
    const settings = query("SELECT * FROM contact_info LIMIT 1")
    logResult("READ", "Settings", settings.length > 0, settings.length === 0 ? "No settings found" : undefined)

    if (settings.length > 0) {
      const testKey = settings[0].key
      const originalValue = settings[0].value

      // Update
      run("UPDATE contact_info SET value = ? WHERE key = ?", ["Test Value", testKey])
      const updatedSetting = get("SELECT * FROM contact_info WHERE key = ?", [testKey])
      logResult(
        "UPDATE",
        "Settings",
        updatedSetting?.value === "Test Value",
        updatedSetting?.value !== "Test Value" ? "Value not updated" : undefined,
      )

      // Restore original value
      run("UPDATE contact_info SET value = ? WHERE key = ?", [originalValue, testKey])
      logResult("RESTORE", "Settings", true, undefined, { key: testKey, restored: originalValue })
    }
  } catch (error: any) {
    logResult("CRUD", "Settings", false, error.message)
  }

  // Test Bulk Operations
  console.log("\n📦 Testing Bulk Operations:")
  try {
    // Create multiple test posts for bulk operations
    const testIds: number[] = []
    for (let i = 1; i <= 3; i++) {
      const result = run(
        `INSERT INTO posts (title, slug, excerpt, content, published) 
         VALUES (?, ?, ?, ?, ?)`,
        [`Bulk Test Post ${i}`, `bulk-test-post-${i}`, `Test excerpt ${i}`, `Test content ${i}`, 0],
      )
      testIds.push(result.lastInsertRowid as number)
    }
    logResult("BULK CREATE", "Posts", testIds.length === 3, undefined, { ids: testIds })

    // Bulk update
    const placeholders = testIds.map(() => "?").join(", ")
    run(`UPDATE posts SET published = 1 WHERE id IN (${placeholders})`, testIds)
    const updatedPosts = query(`SELECT * FROM posts WHERE id IN (${placeholders})`, testIds)
    const allPublished = updatedPosts.every((post: any) => post.published === 1)
    logResult("BULK UPDATE", "Posts", allPublished, allPublished ? undefined : "Not all posts updated")

    // Bulk delete
    run(`DELETE FROM posts WHERE id IN (${placeholders})`, testIds)
    const remainingPosts = query(`SELECT * FROM posts WHERE id IN (${placeholders})`, testIds)
    logResult(
      "BULK DELETE",
      "Posts",
      remainingPosts.length === 0,
      remainingPosts.length > 0 ? "Some posts still exist" : undefined,
    )
  } catch (error: any) {
    logResult("BULK", "Posts", false, error.message)
  }

  // Summary
  console.log("\n📊 Test Summary:")
  const totalTests = results.length
  const passedTests = results.filter((r) => r.success).length
  const failedTests = totalTests - passedTests

  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  if (failedTests > 0) {
    console.log("\n❌ Failed Tests:")
    results
      .filter((r) => !r.success)
      .forEach((result) => {
        console.log(`  - ${result.entity} ${result.operation}: ${result.error}`)
      })
  }

  console.log("\n🎉 CRUD Operations Testing Complete!")

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / totalTests) * 100,
    results,
  }
}

// Run the tests
testCrudOperations().catch(console.error)
