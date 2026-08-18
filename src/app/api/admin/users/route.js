import { NextResponse } from "next/server";
import { readUsers, createUser, deleteUser } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-helper";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, "users");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await readUsers();
    // Exclude password in list
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      permissions: u.permissions,
      createdAt: u.createdAt
    }));
    
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET Users API Error:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Only SUPER_ADMIN can create users
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, role, permissions } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Username, password and role are required" }, { status: 400 });
    }

    const users = await readUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password,
      role,
      permissions: permissions || [],
      createdAt: new Date().toLocaleString()
    };

    await createUser(newUser);

    return NextResponse.json({ success: true, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error("POST User API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Only SUPER_ADMIN can delete users
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const users = await readUsers();
    const user = users.find(u => u.id === id);
    if (user && user.username === "admin") {
      return NextResponse.json({ error: "Cannot delete the default admin account" }, { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE User API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
