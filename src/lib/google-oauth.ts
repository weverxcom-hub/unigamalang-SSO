import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Google sign-in (OpenID Connect, authorization-code flow).
 *
 * Env:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — Google Cloud Console OAuth client (type "Web application")
 *   GOOGLE_REDIRECT_URI  — optional; defaults to <origin>/auth/google/callback. Must match the console exactly.
 *   ALLOWED_EMAIL_DOMAIN — optional; defaults to "unigamalang.ac.id"
 *
 * The button is hidden (googleAvailable() === false) until the client id/secret
 * are set, so this code is safe to deploy before Google is configured.
 */

export const GOOGLE_CTX_COOKIE = "google_oauth_ctx";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export function googleAvailable(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function allowedDomain(): string {
  return (process.env.ALLOWED_EMAIL_DOMAIN || "unigamalang.ac.id").toLowerCase();
}

export function googleRedirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/auth/google/callback`;
}

export function buildGoogleAuthorizeUrl(
  origin: string,
  state: string,
  nonce: string
): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  // `hd` is only a UX hint for Google's account picker; enforced server-side below.
  url.searchParams.set("hd", allowedDomain());
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export type GoogleIdentity = { email: string; name: string };

/** Exchanges the code, verifies the ID token and enforces the email domain. */
export async function verifyGoogleCode(
  origin: string,
  code: string,
  nonce: string
): Promise<
  { ok: true; identity: GoogleIdentity } | { ok: false; reason: "failed" | "domain" }
> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleRedirectUri(origin),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, reason: "failed" };
    const { id_token: idToken } = (await res.json()) as { id_token?: string };
    if (!idToken) return { ok: false, reason: "failed" };

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    if (payload.nonce !== nonce) return { ok: false, reason: "failed" };

    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const domain = allowedDomain();
    if (
      payload.email_verified !== true ||
      !email.endsWith(`@${domain}`) ||
      payload.hd !== domain
    ) {
      return { ok: false, reason: "domain" };
    }

    return {
      ok: true,
      identity: { email, name: typeof payload.name === "string" ? payload.name : email },
    };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
