import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

export interface AuthUser {
  userId: string;
}

export function authenticateRequest(request: Request): AuthUser | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
