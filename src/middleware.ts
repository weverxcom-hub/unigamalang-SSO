import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SSO_COOKIE = "uniga_sso_session";

function getSecret(): Uint8Array {
  const s = process.env.SSO_JWT_SECRET;
  if (!s) return new TextEncoder().encode("dev-secret-change-me");
  return new TextEncoder().encode(s);
}

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { issuer: "uniga-sso" });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SSO_COOKIE)?.value;
  const valid = await isValidSession(token);

  if (pathname.startsWith("/dashboard") && !valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
