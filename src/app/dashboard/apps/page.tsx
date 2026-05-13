import { prisma } from "@/lib/prisma";
import { RegisterAppForm } from "./register-app-form";
import { AppCard } from "./app-card";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { authCodes: true, appRoles: true } },
    },
  });

  const serializedApps = apps.map((app) => ({
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    redirectUri: app.redirectUri,
    createdAt: app.createdAt.toISOString(),
    _count: { appRoles: app._count.appRoles },
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aplikasi Terdaftar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola aplikasi yang terhubung dengan SSO. Setiap aplikasi memerlukan Client ID dan Secret untuk autentikasi.
        </p>
      </div>

      <RegisterAppForm />

      {/* Quick setup guide */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-sm font-semibold text-blue-900">Cara Menghubungkan Aplikasi ke SSO</h3>
        <ol className="mt-2 space-y-1 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">1</span>
            <span>Daftarkan aplikasi di form di atas — Anda akan mendapatkan <strong>Client Secret</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">2</span>
            <span>Pasang environment variables di Vercel project aplikasi (lihat detail di setiap kartu app)</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">3</span>
            <span>Tambahkan route <code className="rounded bg-blue-100 px-1 font-mono text-xs">/auth/callback</code> di aplikasi (contoh tersedia di repo Persuratan)</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">4</span>
            <span>Redeploy aplikasi — tombol &quot;Masuk dengan UNIGA SSO&quot; akan muncul di halaman login</span>
          </li>
        </ol>
      </div>

      {/* App cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {serializedApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
      {apps.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.243 1.007-2.25 2.25-2.25h13.5z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">Belum ada aplikasi terdaftar</p>
          <p className="mt-1 text-xs text-gray-400">Gunakan form di atas untuk mendaftarkan aplikasi pertama</p>
        </div>
      )}
    </div>
  );
}
