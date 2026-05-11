import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [userCount, appCount, sessionCount] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.app.count(),
    prisma.sSOSession.count({ where: { expiresAt: { gt: new Date() } } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard SSO</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola pengguna dan aplikasi terhubung
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{userCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Aplikasi Terdaftar</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{appCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Sesi Aktif</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{sessionCount}</p>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Pengguna Terbaru</h2>
          <Link
            href="/dashboard/users"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <p className="text-xs text-gray-400">
                {u.createdAt.toLocaleDateString("id-ID")}
              </p>
            </div>
          ))}
          {recentUsers.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              Belum ada pengguna terdaftar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
