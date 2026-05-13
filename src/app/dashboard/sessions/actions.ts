"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clearExpiredSessionsAction() {
  await prisma.sSOSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  revalidatePath("/dashboard/sessions");
}
