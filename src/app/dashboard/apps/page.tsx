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

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="divide-y">
          {apps.map((app) => (
            <div key={app.id} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.name}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Client ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{app.clientId}</code>
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Redirect: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{app.redirectUri}</code>
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Aktif
                </span>
              </div>
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
  );
}
