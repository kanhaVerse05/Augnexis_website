import { NextResponse } from "next/server";
import { readBlogs, writeBlogs } from "@/lib/db";

export async function GET() {
  try {
    const blogs = readBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read blogs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "admin-secret-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, author, excerpt, image, gradient } = body;

    if (!title || !category || !author || !excerpt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const blogs = readBlogs();

    const newBlog = {
      id: Date.now().toString(),
      title,
      category,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      author,
      readTime: `${Math.max(3, Math.ceil(excerpt.split(" ").length / 30))} Min Read`,
      excerpt,
      image: image || "",
      gradient: gradient || "linear-gradient(135deg, #0a192f 0%, #0052cc 100%)"
    };

    blogs.unshift(newBlog);
    writeBlogs(blogs);

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "admin-secret-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let blogs = readBlogs();
    blogs = blogs.filter(b => b.id !== id);
    writeBlogs(blogs);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
