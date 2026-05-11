import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SSO database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@unigamalang.ac.id" },
    update: {},
    create: {
      email: "admin@unigamalang.ac.id",
      name: "Administrator SSO",
      passwordHash: bcrypt.hashSync("admin123", 10),
      isActive: true,
    },
  });

  // Create demo users
  const demoUsers = [
    { email: "hr@unigamalang.ac.id", name: "Bagian Kepegawaian", password: "hr12345" },
    { email: "rektor@unigamalang.ac.id", name: "Rektor UNIGA", password: "rektor123" },
    { email: "dewi.anggraeni@unigamalang.ac.id", name: "Dewi Anggraeni", password: "pegawai123" },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: bcrypt.hashSync(u.password, 10),
        isActive: true,
      },
    });
  }

  // Register the three apps (with plaintext secrets for dev — hash in production)
  const apps = [
    {
      clientId: "persuratan",
      name: "UNIGA Persuratan",
      secret: "persuratan-dev-secret",
      redirectUri: "http://localhost:3001/auth/callback",
    },
    {
      clientId: "inventarisir",
      name: "UNIGA Inventarisir",
      secret: "inventarisir-dev-secret",
      redirectUri: "http://localhost:3002/auth/callback",
    },
    {
      clientId: "kgb",
      name: "Kenaikan Gaji Berkala",
      secret: "kgb-dev-secret",
      redirectUri: "http://localhost:3003/auth/callback",
    },
  ];

  for (const a of apps) {
    const app = await prisma.app.upsert({
      where: { clientId: a.clientId },
      update: {},
      create: {
        clientId: a.clientId,
        name: a.name,
        secret: bcrypt.hashSync(a.secret, 10),
        redirectUri: a.redirectUri,
      },
    });

    // Assign admin role for all apps
    await prisma.appRole.upsert({
      where: { userId_appId: { userId: admin.id, appId: app.id } },
      update: {},
      create: {
        userId: admin.id,
        appId: app.id,
        role: a.clientId === "persuratan"
          ? "SUPER_ADMIN"
          : a.clientId === "kgb"
            ? "ADMIN"
            : "Admin",
      },
    });
  }

  console.log("Seed completed!");
  console.log("");
  console.log("Demo accounts:");
  console.log("  admin@unigamalang.ac.id / admin123");
  console.log("  hr@unigamalang.ac.id / hr12345");
  console.log("  rektor@unigamalang.ac.id / rektor123");
  console.log("  dewi.anggraeni@unigamalang.ac.id / pegawai123");
  console.log("");
  console.log("Dev client secrets:");
  console.log("  persuratan:   persuratan-dev-secret");
  console.log("  inventarisir: inventarisir-dev-secret");
  console.log("  kgb:          kgb-dev-secret");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
