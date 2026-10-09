import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  GOOGLE_CTX_COOKIE,
  buildGoogleAuthorizeUrl,
  googleAvailable,
} from "@/lib/google-oauth";

/**
 * GET /auth/google/start?client_id=&redirect_uri=&state=
 * Stores the pending SSO request (plus a CSRF state and nonce) in a short-lived
 * httpOnly cookie, then sends the browser to Google.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  if (!googleAvailable()) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const state = randomBytes(24).toString("hex");
  const nonce = randomBytes(24).toString("hex");
  const ctx = {
    state,
    nonce,
    clientId: searchParams.get("client_id") ?? "",
    redirectUri: searchParams.get("redirect_uri") ?? "",
    clientState: searchParams.get("state") ?? "",
  };

  const res = NextResponse.redirect(buildGoogleAuthorizeUrl(origin, state, nonce));
  res.cookies.set(GOOGLE_CTX_COOKIE, JSON.stringify(ctx), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth/google",
    maxAge: 10 * 60,
  });
  return res;
}
