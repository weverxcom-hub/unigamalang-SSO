import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT, exportJWK, generateKeyPair, type JWK } from "jose";

const CLIENT_ID = "test-client.apps.googleusercontent.com";
const NONCE = "nonce-123";
const ORIGIN = "https://sso.example";

let signingKey: CryptoKey;
let jwks: { keys: JWK[] };
let attackerKey: CryptoKey;

type Claims = Record<string, unknown>;

async function idToken(
  claims: Claims = {},
  opts: { key?: CryptoKey; issuer?: string; audience?: string; expiresIn?: string } = {}
) {
  return new SignJWT({
    email: "dosen@unigamalang.ac.id",
    email_verified: true,
    hd: "unigamalang.ac.id",
    name: "Dosen Uji",
    nonce: NONCE,
    ...claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(opts.issuer ?? "https://accounts.google.com")
    .setAudience(opts.audience ?? CLIENT_ID)
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? "5m")
    .sign(opts.key ?? signingKey);
}

/** Fake Google: token endpoint returns `tokenBody`, certs endpoint returns the test JWKS. */
function stubGoogle(tokenBody: unknown, tokenStatus = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: unknown) => {
      const url = String(input);
      if (url.startsWith("https://oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify(tokenBody), {
          status: tokenStatus,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.startsWith("https://www.googleapis.com/oauth2/v3/certs")) {
        return new Response(JSON.stringify(jwks), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch: ${url}`);
    })
  );
}

beforeAll(async () => {
  const kp = await generateKeyPair("RS256", { extractable: true });
  signingKey = kp.privateKey as CryptoKey;
  const pub = await exportJWK(kp.publicKey);
  jwks = { keys: [{ ...pub, kid: "k1", alg: "RS256", use: "sig" }] };
  attackerKey = (await generateKeyPair("RS256")).privateKey as CryptoKey;
});

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", CLIENT_ID);
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
  vi.stubEnv("ALLOWED_EMAIL_DOMAIN", "");
  vi.stubEnv("GOOGLE_REDIRECT_URI", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function verify(token: string, nonce = NONCE) {
  stubGoogle({ id_token: token });
  const { verifyGoogleCode } = await import("./google-oauth");
  return verifyGoogleCode(ORIGIN, "auth-code", nonce);
}

describe("googleAvailable / config", () => {
  it("is false until both client id and secret are set", async () => {
    const { googleAvailable } = await import("./google-oauth");
    expect(googleAvailable()).toBe(true);
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect(googleAvailable()).toBe(false);
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    expect(googleAvailable()).toBe(false);
  });

  it("builds an authorize URL with state, nonce, hd hint and callback", async () => {
    const { buildGoogleAuthorizeUrl } = await import("./google-oauth");
    const u = new URL(buildGoogleAuthorizeUrl(ORIGIN, "S", "N"));
    expect(u.origin + u.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(u.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(u.searchParams.get("redirect_uri")).toBe(`${ORIGIN}/auth/google/callback`);
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("scope")).toBe("openid email profile");
    expect(u.searchParams.get("state")).toBe("S");
    expect(u.searchParams.get("nonce")).toBe("N");
    expect(u.searchParams.get("hd")).toBe("unigamalang.ac.id");
  });

  it("honours GOOGLE_REDIRECT_URI override", async () => {
    vi.stubEnv("GOOGLE_REDIRECT_URI", "https://custom.example/cb");
    const { googleRedirectUri } = await import("./google-oauth");
    expect(googleRedirectUri(ORIGIN)).toBe("https://custom.example/cb");
  });
});

describe("verifyGoogleCode", () => {
  it("accepts a valid institutional token and lowercases the email", async () => {
    const r = await verify(await idToken({ email: "Dosen.Uji@UniGamaLang.ac.id" }));
    expect(r).toEqual({
      ok: true,
      identity: { email: "dosen.uji@unigamalang.ac.id", name: "Dosen Uji" },
    });
  });

  it("sends the code, client credentials and redirect_uri to Google", async () => {
    const token = await idToken();
    stubGoogle({ id_token: token });
    const { verifyGoogleCode } = await import("./google-oauth");
    await verifyGoogleCode(ORIGIN, "the-code", NONCE);
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find((c) =>
      String(c[0]).startsWith("https://oauth2.googleapis.com/token")
    )!;
    const body = new URLSearchParams(String((call[1] as RequestInit).body));
    expect(body.get("code")).toBe("the-code");
    expect(body.get("client_id")).toBe(CLIENT_ID);
    expect(body.get("client_secret")).toBe("secret");
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("redirect_uri")).toBe(`${ORIGIN}/auth/google/callback`);
  });

  it.each([
    ["personal Gmail (no hd)", { email: "orang@gmail.com", hd: undefined }],
    ["wrong hd", { hd: "example.com" }],
    ["email not verified", { email_verified: false }],
    ["email_verified as string", { email_verified: "true" }],
    ["lookalike domain suffix", { email: "x@evilunigamalang.ac.id" }],
    ["domain as subdomain prefix", { email: "x@unigamalang.ac.id.evil.com" }],
    ["subdomain of institution", { email: "x@mail.unigamalang.ac.id" }],
    ["missing email", { email: undefined }],
  ])("rejects with reason=domain: %s", async (_label, claims) => {
    const r = await verify(await idToken(claims as Claims));
    expect(r).toEqual({ ok: false, reason: "domain" });
  });

  it("rejects a nonce mismatch (replay)", async () => {
    const r = await verify(await idToken({ nonce: "someone-elses" }));
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("rejects a token for another client (audience)", async () => {
    const r = await verify(await idToken({}, { audience: "other-client" }));
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("rejects a token from another issuer", async () => {
    const r = await verify(await idToken({}, { issuer: "https://evil.example" }));
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("accepts the bare-host Google issuer form", async () => {
    const r = await verify(await idToken({}, { issuer: "accounts.google.com" }));
    expect(r.ok).toBe(true);
  });

  it("rejects an expired token", async () => {
    const r = await verify(await idToken({}, { expiresIn: "-1m" }));
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("rejects a token signed with a key Google does not publish", async () => {
    const r = await verify(await idToken({}, { key: attackerKey }));
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("rejects an unsigned (alg=none) token", async () => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const forged = `${b64({ alg: "none" })}.${b64({
      iss: "https://accounts.google.com",
      aud: CLIENT_ID,
      email: "ketua@unigamalang.ac.id",
      email_verified: true,
      hd: "unigamalang.ac.id",
      nonce: NONCE,
      exp: Math.floor(Date.now() / 1000) + 300,
    })}.`;
    const r = await verify(forged);
    expect(r).toEqual({ ok: false, reason: "failed" });
  });

  it("fails when Google's token endpoint returns an error", async () => {
    stubGoogle({ error: "invalid_grant" }, 400);
    const { verifyGoogleCode } = await import("./google-oauth");
    expect(await verifyGoogleCode(ORIGIN, "bad", NONCE)).toEqual({ ok: false, reason: "failed" });
  });

  it("fails when the response has no id_token", async () => {
    stubGoogle({ access_token: "x" });
    const { verifyGoogleCode } = await import("./google-oauth");
    expect(await verifyGoogleCode(ORIGIN, "c", NONCE)).toEqual({ ok: false, reason: "failed" });
  });

  it("fails closed when the network call throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const { verifyGoogleCode } = await import("./google-oauth");
    expect(await verifyGoogleCode(ORIGIN, "c", NONCE)).toEqual({ ok: false, reason: "failed" });
  });

  it("respects ALLOWED_EMAIL_DOMAIN", async () => {
    vi.stubEnv("ALLOWED_EMAIL_DOMAIN", "example.org");
    const ok = await verify(await idToken({ email: "a@example.org", hd: "example.org" }));
    expect(ok.ok).toBe(true);
    const bad = await verify(await idToken());
    expect(bad).toEqual({ ok: false, reason: "domain" });
  });
});
