import { NextResponse } from "next/server";
import { readUsers } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const userToFind = username || "admin";

    // Look up the user in DB
    const users = await readUsers();
    const user = users.find(u => u.username === userToFind);

    if (user && user.password === password) {
      // Return a structured token containing the username and their role
      const token = `user-token-${user.username}-${user.role}`;
      return NextResponse.json({ 
        success: true, 
        token, 
        user: { 
          username: user.username, 
          role: user.role, 
          permissions: user.permissions 
        } 
      });
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
