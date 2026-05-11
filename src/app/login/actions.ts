"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSSOSession } from "@/lib/auth";
import { generateCode } from "@/lib/crypto";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const state = String(formData.get("state") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: "Email atau kata sandi salah." };
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return { error: "Email atau kata sandi salah." };
  }

  // Create SSO session (sets cookie)
  await createSSOSession(user.id);

  // If this login was initiated by a client app, issue an auth code and redirect
  if (clientId && redirectUri) {
    const app = await prisma.app.findUnique({ where: { clientId } });
    if (app && app.redirectUri === redirectUri) {
      const code = generateCode();
      await prisma.authCode.create({
        data: {
          code,
          userId: user.id,
          appId: app.id,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("code", code);
      if (state) callbackUrl.searchParams.set("state", state);
      redirect(callbackUrl.toString());
    }
  }

  // No client app → go to SSO dashboard
  redirect("/dashboard");
}

export async function logoutAction() {
  const { clearSSOSession } = await import("@/lib/auth");
  clearSSOSession();
  redirect("/login");
}
