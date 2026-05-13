"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSecret } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export interface RegisterAppState {
  error?: string;
  success?: string;
  clientSecret?: string;
}

export async function registerAppAction(
  _prev: RegisterAppState,
  formData: FormData
): Promise<RegisterAppState> {
  const clientId = String(formData.get("client_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const redirectUri = String(formData.get("redirect_uri") ?? "").trim();

  if (!clientId || !name || !redirectUri) {
    return { error: "Semua field wajib diisi." };
  }

  const existing = await prisma.app.findUnique({ where: { clientId } });
  if (existing) {
    return { error: "Client ID sudah terdaftar." };
  }

  const plainSecret = generateSecret();
  const hashedSecret = bcrypt.hashSync(plainSecret, 10);

  await prisma.app.create({
    data: { clientId, name, secret: hashedSecret, redirectUri },
  });

  revalidatePath("/dashboard/apps");

  return {
    success: `Aplikasi "${name}" berhasil didaftarkan. Simpan client secret berikut (tidak akan ditampilkan lagi):`,
    clientSecret: plainSecret,
  };
}

export interface EditAppState {
  error?: string;
  success?: string;
}

export async function editAppAction(
  _prev: EditAppState,
  formData: FormData
): Promise<EditAppState> {
  const appId = String(formData.get("app_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const redirectUri = String(formData.get("redirect_uri") ?? "").trim();

  if (!appId || !name || !redirectUri) {
    return { error: "Semua field wajib diisi." };
  }

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "Aplikasi tidak ditemukan." };

  await prisma.app.update({
    where: { id: appId },
    data: { name, redirectUri },
  });

  revalidatePath("/dashboard/apps");
  return { success: `Aplikasi "${name}" berhasil diperbarui.` };
}

export async function deleteAppAction(formData: FormData) {
  const appId = String(formData.get("app_id") ?? "");
  if (!appId) return;

  await prisma.app.delete({ where: { id: appId } });
  revalidatePath("/dashboard/apps");
}

export async function regenerateSecretAction(
  _prev: RegisterAppState,
  formData: FormData
): Promise<RegisterAppState> {
  const appId = String(formData.get("app_id") ?? "");
  if (!appId) return { error: "App ID diperlukan." };

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "Aplikasi tidak ditemukan." };

  const plainSecret = generateSecret();
  const hashedSecret = bcrypt.hashSync(plainSecret, 10);

  await prisma.app.update({
    where: { id: appId },
    data: { secret: hashedSecret },
  });

  revalidatePath("/dashboard/apps");
  return {
    success: `Secret baru untuk "${app.name}". Simpan sekarang:`,
    clientSecret: plainSecret,
  };
}
