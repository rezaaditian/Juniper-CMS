import bcrypt from "bcryptjs";
import { run, get } from "../lib/db";
import { slugify } from "../lib/utils";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Seeding database...");

  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user if doesn't exist
  const existingUser = get("SELECT id FROM users WHERE username = ?", [
    "admin",
  ]);

  if (!existingUser) {
    run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [
      "admin",
      hashedPassword,
      "admin",
    ]);
    console.log("✓ Admin user created");
  } else {
    console.log("✓ Admin user already exists");
  }

  // Create sample posts
  const samplePosts = [
    {
      title: "Welcome to Our Blog",
      content: `# Welcome to Our Blog

This is our first blog post! We're excited to share our thoughts and insights with you.

## What to Expect

- Regular updates on industry trends
- Technical tutorials and guides  
- Behind-the-scenes content
- Community highlights

Stay tuned for more great content!`,
      excerpt:
        "Welcome to our new blog! Learn what to expect from our upcoming content.",
      tags: "welcome,announcement,blog",
      published: 1,
    },
    {
      title: "Getting Started with Next.js",
      content: `# Getting Started with Next.js

Next.js is a powerful React framework that makes building web applications a breeze.

## Key Features

- **Server-Side Rendering**: Better SEO and performance
- **Static Site Generation**: Lightning-fast loading times
- **API Routes**: Full-stack capabilities built-in
- **File-based Routing**: Intuitive project structure

## Installation

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

Happy coding!`,
      excerpt:
        "Learn the basics of Next.js and why it's perfect for modern web development.",
      tags: "nextjs,react,tutorial,web-development",
      published: 1,
    },
    {
      title: "Draft Post - Coming Soon",
      content: `# This is a Draft

This post is still being worked on and will be published soon.

## Topics to Cover

- Advanced concepts
- Best practices
- Real-world examples

Check back later!`,
      excerpt: "A preview of upcoming content that's still in development.",
      tags: "draft,preview",
      published: 0,
    },
  ];

  for (const post of samplePosts) {
    const slug = slugify(post.title);
    const existingPost = get("SELECT id FROM posts WHERE slug = ?", [slug]);

    if (!existingPost) {
      const publishedAt = post.published ? new Date().toISOString() : null;

      run(
        `INSERT INTO posts (title, slug, excerpt, content, tags, published, published_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          post.title,
          slug,
          post.excerpt,
          post.content,
          post.tags,
          post.published,
          publishedAt,
        ]
      );

      console.log(`✓ Created post: ${post.title}`);
    }
  }

  console.log("Database seeded successfully!");
  console.log(`Admin credentials: admin / ${adminPassword}`);
}

seed().catch(console.error);
