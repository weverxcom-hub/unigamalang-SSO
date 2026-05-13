"use client";

import { useState } from "react";

interface App {
  id: string;
  clientId: string;
  name: string;
  redirectUri: string;
}

export function AutoSetupForm({ apps }: { apps: App[] }) {
  const [selectedApp, setSelectedApp] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<string[]>([]);

  const app = apps.find((a) => a.id === selectedApp);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!app || !vercelToken || !projectName || !clientSecret) return;

    setStatus("loading");
    setMessage("");
    setDetails([]);

    try {
      const res = await fetch("/api/auto-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vercelToken,
          projectName,
          clientId: app.clientId,
          clientSecret,
          redirectUri: app.redirectUri,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Environment variables berhasil dipasang!");
        setDetails(data.details || []);
      } else {
        setStatus("error");
        setMessage(data.error || "Gagal memasang env vars.");
      }
    } catch {
      setStatus("error");
      setMessage("Terjadi kesalahan jaringan. Coba lagi.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="border-b bg-gray-50 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Pasang Env Vars Otomatis</h2>
        <p className="mt-0.5 text-sm text-gray-500">Pilih aplikasi dan isi form — kami yang urus sisanya</p>
      </div>

      <div className="p-6 space-y-4">
        {status === "success" && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">{message}</p>
            {details.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-green-700">
                {details.map((d, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-green-700 font-medium">
              Sekarang buka Vercel → project &quot;{projectName}&quot; → Deployments → klik Redeploy
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Aplikasi SSO
            </label>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— Pilih aplikasi —</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.clientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Project Vercel
            </label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              placeholder="contoh: unigamalang-persuratan"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Nama project di Vercel dashboard (bukan domain)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Secret
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
            placeholder="Secret yang didapat saat mendaftarkan app"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Client Secret yang Anda simpan saat mendaftarkan aplikasi di SSO
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vercel Access Token
          </label>
          <input
            type="password"
            value={vercelToken}
            onChange={(e) => setVercelToken(e.target.value)}
            required
            placeholder="Paste token dari vercel.com/account/tokens"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Token tidak disimpan — hanya digunakan sekali untuk setup. Lihat panduan di bawah untuk cara membuatnya.
          </p>
        </div>

        {app && (
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
            <p className="text-xs font-medium text-blue-800 mb-1">Preview env vars yang akan dipasang:</p>
            <div className="text-xs font-mono text-blue-700 space-y-0.5">
              <div>SSO_BASE_URL = https://unigamalang-sso.vercel.app</div>
              <div>SSO_CLIENT_ID = {app.clientId}</div>
              <div>SSO_CLIENT_SECRET = ••••••••</div>
              <div>SSO_REDIRECT_URI = {app.redirectUri}</div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "loading" || !selectedApp || !vercelToken || !projectName || !clientSecret}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? "Memasang..." : "Pasang Environment Variables"}
          </button>
        </div>
      </div>
    </form>
  );
}
