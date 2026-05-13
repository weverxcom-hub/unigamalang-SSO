import { prisma } from "@/lib/prisma";
import { AutoSetupForm } from "./auto-setup-form";

export const dynamic = "force-dynamic";

export default async function AutoSetupPage() {
  const apps = await prisma.app.findMany({
    orderBy: { name: "asc" },
    select: { id: true, clientId: true, name: true, redirectUri: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auto-Setup Vercel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Otomatis pasang environment variables SSO ke project Vercel tanpa perlu buka dashboard Vercel.
          Cukup pilih aplikasi dan masukkan Vercel Token — selesai!
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <h3 className="text-sm font-semibold text-green-900">Cara Kerja</h3>
        <p className="mt-1 text-sm text-green-800">
          Tool ini akan otomatis menambahkan 4 environment variables ke project Vercel yang Anda pilih:
        </p>
        <div className="mt-2 rounded-md bg-white/60 p-3 text-xs font-mono text-green-900">
          <div>SSO_BASE_URL</div>
          <div>SSO_CLIENT_ID</div>
          <div>SSO_CLIENT_SECRET</div>
          <div>SSO_REDIRECT_URI</div>
        </div>
        <p className="mt-2 text-xs text-green-700">
          Setelah env vars terpasang, Anda hanya perlu <strong>Redeploy</strong> project di Vercel agar perubahan aktif.
        </p>
      </div>

      <AutoSetupForm apps={apps} />

      {/* Help: get token */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Cara Mendapatkan Vercel Token</h3>
        <ol className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">1</span>
            <span>Buka <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener" className="text-blue-600 underline hover:text-blue-800">vercel.com/account/tokens</a></span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">2</span>
            <span>Klik <strong>&quot;Create Token&quot;</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">3</span>
            <span>Name: <code className="rounded bg-gray-100 px-1">sso-setup</code>, Scope: <strong>Full Account</strong>, lalu klik Create</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">4</span>
            <span>Copy token dan paste di form di atas</span>
          </li>
        </ol>
        <p className="mt-3 text-xs text-gray-400">
          Token hanya digunakan sekali untuk memasang env vars dan tidak disimpan di server.
        </p>
      </div>
    </div>
  );
}
