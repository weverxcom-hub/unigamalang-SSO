import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSSOSession } from "@/lib/auth";
import { generateCode } from "@/lib/crypto";

/**
 * GET /authorize?client_id=xxx&redirect_uri=xxx&state=xxx
 *
 * OAuth2-style authorization endpoint.
 * If the user has an active SSO session → issue an auth code and redirect back.
 * If not → redirect to /login with the original params preserved.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state") || "";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "client_id and redirect_uri are required" },
      { status: 400 }
    );
  }

  const app = await prisma.app.findUnique({ where: { clientId } });
  if (!app) {
    return NextResponse.json({ error: "Unknown client_id" }, { status: 400 });
  }

  // Validate redirect_uri matches the registered one
  if (app.redirectUri !== redirectUri) {
    return NextResponse.json(
      { error: "redirect_uri mismatch" },
      { status: 400 }
    );
  }

  const session = await getSSOSession();

  if (!session) {
    // Not logged in → redirect to SSO login with return params
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("client_id", clientId);
    loginUrl.searchParams.set("redirect_uri", redirectUri);
    if (state) loginUrl.searchParams.set("state", state);
    return NextResponse.redirect(loginUrl);
  }

  // User is logged in → issue an authorization code
  const code = generateCode();
  await prisma.authCode.create({
    data: {
      code,
      userId: session.userId,
      appId: app.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl);
}
