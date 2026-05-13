import { prisma } from "@/lib/prisma";
import { RegisterAppForm } from "./register-app-form";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { authCodes: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aplikasi Terdaftar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola aplikasi yang terhubung dengan SSO
        </p>
      </div>

      <RegisterAppForm />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <div key={app.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                {app.name.charAt(0).toUpperCase()}
              </div>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Aktif
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-gray-900">{app.name}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                Client ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{app.clientId}</code>
              </p>
              <p className="truncate text-xs text-gray-400" title={app.redirectUri}>
                {app.redirectUri}
              </p>
            </div>
          </div>
        ))}
      </div>
      {apps.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">Belum ada aplikasi terdaftar</p>
        </div>
      )}
    </div>
  );
}
