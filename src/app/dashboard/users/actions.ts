"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AddUserState {
  error?: string;
  success?: string;
}

export async function addUserAction(
  _prev: AddUserState,
  formData: FormData
): Promise<AddUserState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name || !password) {
    return { error: "Semua field wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: bcrypt.hashSync(password, 10),
    },
  });

  revalidatePath("/dashboard/users");
  return { success: `Pengguna "${name}" berhasil ditambahkan.` };
}

export async function assignRoleAction(
  _prev: AddUserState,
  formData: FormData
): Promise<AddUserState> {
  const userId = String(formData.get("user_id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const role = String(formData.get("role") ?? "").trim();

  if (!userId || !clientId || !role) {
    return { error: "Semua field wajib diisi." };
  }

  const app = await prisma.app.findUnique({ where: { clientId } });
  if (!app) return { error: "Aplikasi tidak ditemukan." };

  await prisma.appRole.upsert({
    where: { userId_appId: { userId, appId: app.id } },
    create: { userId, appId: app.id, role },
    update: { role },
  });

  revalidatePath("/dashboard/users");
  return { success: `Role "${role}" untuk ${clientId} berhasil ditetapkan.` };
}
