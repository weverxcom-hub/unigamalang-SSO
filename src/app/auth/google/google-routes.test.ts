import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  app: { findUnique: vi.fn() },
  authCode: { create: vi.fn() },
}));
const createSSOSession = vi.hoisted(() => vi.fn());
const verifyGoogleCode = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({ createSSOSession }));
vi.mock("@/lib/google-oauth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/google-oauth")>(
    "@/lib/google-oauth"
  );
  return { ...actual, verifyGoogleCode };
});

import { GET as start } from "./start/route";
import { GET as callback } from "./callback/route";

const ORIGIN = "https://sso.example";
const CTX = {
  state: "ST",
  nonce: "NO",
  clientId: "persuratan",
  redirectUri: "https://surat.example/auth/callback",
  clientState: "client-state-xyz",
};
const USER = { id: "u1", email: "rep@unigamalang.ac.id", isActive: true };
const APP = { id: "a1", clientId: "persuratan", redirectUri: CTX.redirectUri };

function req(path: string, ctx: object | null = CTX) {
  const headers: Record<string, string> = {};
  if (ctx) headers.cookie = `google_oauth_ctx=${encodeURIComponent(JSON.stringify(ctx))}`;
  return new NextRequest(`${ORIGIN}${path}`, { headers });
}

function location(res: Response) {
  return new URL(res.headers.get("location")!);
}

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "cid");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "sec");
  prismaMock.user.findUnique.mockResolvedValue(USER);
  prismaMock.app.findUnique.mockResolvedValue(APP);
  prismaMock.authCode.create.mockResolvedValue({});
  verifyGoogleCode.mockResolvedValue({
    ok: true,
    identity: { email: USER.email, name: "Rep" },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("GET /auth/google/start", () => {
  it("redirects to /login when Google is not configured", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    const res = await start(req("/auth/google/start", null));
    expect(location(res).pathname).toBe("/login");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("redirects to Google and stores state/nonce + pending SSO request in an httpOnly cookie", async () => {
    const res = await start(
      req(
        "/auth/google/start?client_id=persuratan&redirect_uri=" +
          encodeURIComponent(CTX.redirectUri) +
          "&state=client-state-xyz",
        null
      )
    );
    const to = location(res);
    expect(to.origin).toBe("https://accounts.google.com");
    expect(to.searchParams.get("hd")).toBe("unigamalang.ac.id");

    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(setCookie).toMatch(/Path=\/auth\/google/);
    const stored = JSON.parse(
      decodeURIComponent(setCookie.match(/google_oauth_ctx=([^;]+)/)![1])
    );
    expect(stored.state).toBe(to.searchParams.get("state"));
    expect(stored.nonce).toBe(to.searchParams.get("nonce"));
    expect(stored).toMatchObject({
      clientId: "persuratan",
      redirectUri: CTX.redirectUri,
      clientState: "client-state-xyz",
    });
    expect(stored.state).toHaveLength(48);
  });
});

describe("GET /auth/google/callback", () => {
  it("signs in a registered user and returns to the client app with code + state", async () => {
    const res = await callback(req("/auth/google/callback?code=gc&state=ST"));
    const to = location(res);
    expect(to.origin + to.pathname).toBe(CTX.redirectUri);
    expect(to.searchParams.get("code")).toMatch(/^[0-9a-f]{64}$/);
    expect(to.searchParams.get("state")).toBe("client-state-xyz");
    expect(verifyGoogleCode).toHaveBeenCalledWith(ORIGIN, "gc", "NO");
    expect(createSSOSession).toHaveBeenCalledWith("u1");
    expect(prismaMock.authCode.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.authCode.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ userId: "u1", appId: "a1" });
    expect(data.code).toBe(to.searchParams.get("code"));
    expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(res.headers.get("set-cookie")).toMatch(/google_oauth_ctx=;/);
  });

  it("looks the user up by the verified (lowercased) Google email", async () => {
    await callback(req("/auth/google/callback?code=gc&state=ST"));
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: USER.email } });
  });

  it("goes to the SSO dashboard when no client app was involved", async () => {
    const res = await callback(
      req("/auth/google/callback?code=gc&state=ST", { ...CTX, clientId: "", redirectUri: "" })
    );
    expect(location(res).pathname).toBe("/dashboard");
    expect(createSSOSession).toHaveBeenCalled();
    expect(prismaMock.authCode.create).not.toHaveBeenCalled();
  });

  it("never redirects to a redirect_uri that is not the registered one", async () => {
    const res = await callback(
      req("/auth/google/callback?code=gc&state=ST", {
        ...CTX,
        redirectUri: "https://evil.example/steal",
      })
    );
    const to = location(res);
    expect(to.origin).toBe(ORIGIN);
    expect(to.pathname).toBe("/dashboard");
    expect(prismaMock.authCode.create).not.toHaveBeenCalled();
  });

  it("rejects a state mismatch without touching Google or the database", async () => {
    const res = await callback(req("/auth/google/callback?code=gc&state=WRONG"));
    const to = location(res);
    expect(to.pathname).toBe("/login");
    expect(to.searchParams.get("error")).toBe("google_failed");
    expect(verifyGoogleCode).not.toHaveBeenCalled();
    expect(createSSOSession).not.toHaveBeenCalled();
  });

  it("rejects a callback with no pending-request cookie", async () => {
    const res = await callback(req("/auth/google/callback?code=gc&state=ST", null));
    expect(location(res).searchParams.get("error")).toBe("google_failed");
    expect(createSSOSession).not.toHaveBeenCalled();
  });

  it("rejects a callback with no code (user cancelled at Google)", async () => {
    const res = await callback(req("/auth/google/callback?error=access_denied&state=ST"));
    expect(location(res).searchParams.get("error")).toBe("google_failed");
  });

  it("rejects a malformed cookie", async () => {
    const r = new NextRequest(`${ORIGIN}/auth/google/callback?code=gc&state=ST`, {
      headers: { cookie: "google_oauth_ctx=%7Bnot-json" },
    });
    const res = await callback(r);
    expect(location(res).searchParams.get("error")).toBe("google_failed");
  });

  it("shows the domain error for non-institutional accounts and keeps the pending request", async () => {
    verifyGoogleCode.mockResolvedValue({ ok: false, reason: "domain" });
    const res = await callback(req("/auth/google/callback?code=gc&state=ST"));
    const to = location(res);
    expect(to.pathname).toBe("/login");
    expect(to.searchParams.get("error")).toBe("google_domain");
    expect(to.searchParams.get("client_id")).toBe("persuratan");
    expect(to.searchParams.get("redirect_uri")).toBe(CTX.redirectUri);
    expect(to.searchParams.get("state")).toBe("client-state-xyz");
    expect(createSSOSession).not.toHaveBeenCalled();
  });

  it("does not auto-create users: unregistered email is refused", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await callback(req("/auth/google/callback?code=gc&state=ST"));
    expect(location(res).searchParams.get("error")).toBe("google_unregistered");
    expect(createSSOSession).not.toHaveBeenCalled();
    expect(prismaMock.authCode.create).not.toHaveBeenCalled();
  });

  it("refuses deactivated users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...USER, isActive: false });
    const res = await callback(req("/auth/google/callback?code=gc&state=ST"));
    expect(location(res).searchParams.get("error")).toBe("google_unregistered");
    expect(createSSOSession).not.toHaveBeenCalled();
  });

  it("refuses when Google is not configured", async () => {
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    const res = await callback(req("/auth/google/callback?code=gc&state=ST"));
    expect(location(res).searchParams.get("error")).toBe("google_failed");
  });
});
