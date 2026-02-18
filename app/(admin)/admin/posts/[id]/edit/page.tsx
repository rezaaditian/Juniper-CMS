import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { get } from "@/lib/db";
import PostForm from "../../PostForm";

export const runtime = "nodejs";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  featured_image: string;
  published: number;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const post = get<Post>("SELECT * FROM posts WHERE id = ?", [id]);

  if (!post) {
    notFound();
  }

  const postData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    tags: post.tags || "",
    featured_image: post.featured_image || "",
    published: Boolean(post.published),
  };

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <PostForm post={postData} />
    </div>
  );
}
