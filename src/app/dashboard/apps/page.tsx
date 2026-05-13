import { prisma } from "@/lib/prisma";
import { RegisterAppForm } from "./register-app-form";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { authCodes: true, appRoles: true } },
    },
  });

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
        {apps.map((app) => (
          <div key={app.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                    {app.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">
                      Client ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{app.clientId}</code>
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Aktif
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500">Redirect URI</p>
                    <p className="truncate text-sm text-gray-700" title={app.redirectUri}>{app.redirectUri}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{app._count.appRoles} pengguna dengan role</span>
                  <span>Dibuat {app.createdAt.toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Env vars guide */}
            <div className="border-t bg-gray-50 px-5 py-3">
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">
                  <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  Lihat Environment Variables
                </summary>
                <div className="mt-2 rounded-md bg-gray-900 p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                  <div>SSO_BASE_URL=https://unigamalang-sso.vercel.app</div>
                  <div>SSO_CLIENT_ID={app.clientId}</div>
                  <div>SSO_CLIENT_SECRET=<span className="text-amber-400">&lt;secret saat mendaftar&gt;</span></div>
                  <div>SSO_REDIRECT_URI={app.redirectUri}</div>
                </div>
              </details>
            </div>
          </div>
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
