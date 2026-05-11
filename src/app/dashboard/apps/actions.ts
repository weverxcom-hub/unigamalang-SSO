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
