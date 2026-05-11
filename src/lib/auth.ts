import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";

export interface SSOSessionPayload {
  userId: string;
  email: string;
  name: string;
}

const SSO_COOKIE = "uniga_sso_session";

function getSecret(): Uint8Array {
  const s = process.env.SSO_JWT_SECRET;
  if (!s) throw new Error("SSO_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signSSOToken(payload: SSOSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("uniga-sso")
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySSOToken(token: string): Promise<SSOSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: "uniga-sso" });
    return payload as unknown as SSOSessionPayload;
  } catch {
    return null;
  }
}

export async function createSSOSession(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  const token = await signSSOToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.sSOSession.create({
    data: { userId, token, expiresAt },
  });

  cookies().set(SSO_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}

export function clearSSOSession() {
  cookies().delete(SSO_COOKIE);
}

export const getSSOSession = cache(async (): Promise<SSOSessionPayload | null> => {
  const token = cookies().get(SSO_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySSOToken(token);
  if (!payload) return null;

  const dbSession = await prisma.sSOSession.findUnique({
    where: { token },
    include: { user: { select: { isActive: true } } },
  });
  if (!dbSession || !dbSession.user.isActive || dbSession.expiresAt < new Date()) {
    return null;
  }

  return payload;
});

export const SSO_COOKIE_NAME = SSO_COOKIE;
