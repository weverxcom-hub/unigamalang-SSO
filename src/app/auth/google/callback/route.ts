import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSSOSession } from "@/lib/auth";
import { generateCode } from "@/lib/crypto";
import {
  GOOGLE_CTX_COOKIE,
  googleAvailable,
  verifyGoogleCode,
} from "@/lib/google-oauth";

type Ctx = {
  state: string;
  nonce: string;
  clientId: string;
  redirectUri: string;
  clientState: string;
};

function parseCtx(raw: string | undefined): Ctx | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(raw);
    if (typeof c?.state === "string" && typeof c?.nonce === "string") return c as Ctx;
  } catch {
    // fall through
  }
  return null;
}

/** GET /auth/google/callback — completes Google sign-in, then behaves like the password login. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const ctx = parseCtx(req.cookies.get(GOOGLE_CTX_COOKIE)?.value);

  const fail = (error: string) => {
    const url = new URL("/login", origin);
    url.searchParams.set("error", error);
    if (ctx?.clientId) url.searchParams.set("client_id", ctx.clientId);
    if (ctx?.redirectUri) url.searchParams.set("redirect_uri", ctx.redirectUri);
    if (ctx?.clientState) url.searchParams.set("state", ctx.clientState);
    const res = NextResponse.redirect(url);
    res.cookies.delete({ name: GOOGLE_CTX_COOKIE, path: "/auth/google" });
    return res;
  };

  if (!googleAvailable()) return fail("google_failed");

  const code = searchParams.get("code");
  if (!ctx || !code || searchParams.get("state") !== ctx.state) {
    return fail("google_failed");
  }

  const result = await verifyGoogleCode(origin, code, ctx.nonce);
  if (!result.ok) {
    return fail(result.reason === "domain" ? "google_domain" : "google_failed");
  }

  // Only pre-registered, active users may sign in (no auto-provisioning).
  const user = await prisma.user.findUnique({
    where: { email: result.identity.email },
  });
  if (!user || !user.isActive) return fail("google_unregistered");

  await createSSOSession(user.id);

  let target = new URL("/dashboard", origin);
  if (ctx.clientId && ctx.redirectUri) {
    const app = await prisma.app.findUnique({ where: { clientId: ctx.clientId } });
    if (app && app.redirectUri === ctx.redirectUri) {
      const authCode = generateCode();
      await prisma.authCode.create({
        data: {
          code: authCode,
          userId: user.id,
          appId: app.id,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      target = new URL(app.redirectUri);
      target.searchParams.set("code", authCode);
      if (ctx.clientState) target.searchParams.set("state", ctx.clientState);
    }
  }

  const res = NextResponse.redirect(target);
  res.cookies.delete({ name: GOOGLE_CTX_COOKIE, path: "/auth/google" });
  return res;
}
