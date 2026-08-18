import { readUsers } from "./db";

export async function verifyAuth(request, requiredPermission) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    if (authHeader === "admin-secret-token") {
      // Legacy super admin - full access
      return { 
        username: "admin", 
        role: "SUPER_ADMIN", 
        permissions: ["leads", "payments", "blogs", "lead_hunter", "users"] 
      };
    }

    if (authHeader.startsWith("user-token-")) {
      const parts = authHeader.split("-");
      // Format: user-token-username-role
      const username = parts[2];
      if (!username) return null;

      const users = await readUsers();
      const user = users.find(u => u.username === username);
      if (!user) return null;

      // Super Admins have all permissions
      if (user.role === "SUPER_ADMIN") return user;

      // Check specific permission
      if (requiredPermission && user.permissions.includes(requiredPermission)) {
        return user;
      }

      if (!requiredPermission) return user;
    }
  } catch (err) {
    console.error("verifyAuth error:", err);
  }

  return null;
}
