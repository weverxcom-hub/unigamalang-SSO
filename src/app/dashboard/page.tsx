import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, clientId: true, redirectUri: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selamat datang di pusat kendali SSO Universitas Gajayana Malang
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.243 1.007-2.25 2.25-2.25h13.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Aplikasi Terdaftar</p>
              <p className="text-2xl font-bold text-gray-900">{appCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sesi Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{sessionCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Pengguna Terbaru</h2>
            <Link
              href="/dashboard/users"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="truncate text-xs text-gray-500">{u.email}</p>
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

        {/* Connected apps */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Aplikasi Terhubung</h2>
            <Link
              href="/dashboard/apps"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Kelola
            </Link>
          </div>
          <div className="divide-y">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-xs font-bold text-green-700">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{app.name}</p>
                  <p className="truncate text-xs text-gray-500">{app.redirectUri}</p>
                </div>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  Aktif
                </span>
              </div>
            ))}
            {apps.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Belum ada aplikasi terdaftar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
