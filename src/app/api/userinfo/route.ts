import { NextRequest, NextResponse } from "next/server";
import { verifySSOToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/userinfo
 *
 * Returns user info from a valid access token.
 * Header: Authorization: Bearer <token>
 * Optional query: ?client_id=xxx  (to include app-specific role)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifySSOToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "User not found or deactivated" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("client_id");
  let role: string | null = null;

  if (clientId) {
    const app = await prisma.app.findUnique({ where: { clientId } });
    if (app) {
      const appRole = await prisma.appRole.findUnique({
        where: { userId_appId: { userId: user.id, appId: app.id } },
      });
      role = appRole?.role || null;
    }
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role,
  });
}
