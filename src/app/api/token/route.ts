import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSSOToken } from "@/lib/auth";

/**
 * POST /api/token
 *
 * Token exchange endpoint. Client apps send their authorization code +
 * client credentials to get a signed JWT containing user info + app role.
 *
 * Body: { code, client_id, client_secret }
 * Returns: { access_token, token_type, user }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    // Support form-encoded too
    const formData = await req.formData();
    body = Object.fromEntries(formData) as Record<string, string>;
  }

  const { code, client_id, client_secret } = body;

  if (!code || !client_id || !client_secret) {
    return NextResponse.json(
      { error: "code, client_id, and client_secret are required" },
      { status: 400 }
    );
  }

  const app = await prisma.app.findUnique({ where: { clientId: client_id } });
  if (!app) {
    return NextResponse.json({ error: "Invalid client_id" }, { status: 401 });
  }

  const secretValid = bcrypt.compareSync(client_secret, app.secret);
  if (!secretValid) {
    return NextResponse.json(
      { error: "Invalid client_secret" },
      { status: 401 }
    );
  }

  const authCode = await prisma.authCode.findUnique({
    where: { code },
    include: {
      user: true,
      app: true,
    },
  });

  if (!authCode || authCode.used || authCode.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired authorization code" },
      { status: 400 }
    );
  }

  if (authCode.appId !== app.id) {
    return NextResponse.json(
      { error: "Code was not issued for this client" },
      { status: 400 }
    );
  }

  // Mark code as used
  await prisma.authCode.update({
    where: { id: authCode.id },
    data: { used: true },
  });

  // Look up the user's role for this app
  const appRole = await prisma.appRole.findUnique({
    where: { userId_appId: { userId: authCode.userId, appId: app.id } },
  });

  const user = authCode.user;

  const accessToken = await signSSOToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: appRole?.role || null,
    },
  });
}
