"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAppAction, type RegisterAppState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
    >
      {pending ? "Mendaftarkan..." : "Daftarkan Aplikasi"}
    </button>
  );
}

export function RegisterAppForm() {
  const [state, formAction] = useFormState<RegisterAppState, FormData>(
    registerAppAction,
    {}
  );

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="border-b bg-gray-50 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Daftarkan Aplikasi Baru</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tambahkan aplikasi ke jaringan SSO agar bisa menggunakan login terpusat
        </p>
      </div>

      <div className="p-6">
        {state.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="mb-4 space-y-3">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {state.success}
            </div>
            {state.clientSecret && (
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-amber-800">
                      Simpan Client Secret Sekarang!
                    </p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Secret ini hanya ditampilkan sekali dan tidak bisa dilihat lagi setelah halaman ditutup.
                    </p>
                    <code className="mt-2 block rounded-md bg-white p-2.5 text-sm font-mono text-gray-900 border select-all break-all">
                      {state.clientSecret}
                    </code>
                    <p className="mt-2 text-xs text-amber-700">
                      Pasang secret ini sebagai <code className="rounded bg-amber-100 px-1">SSO_CLIENT_SECRET</code> di environment variables aplikasi Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                name="client_id"
                required
                placeholder="contoh: e-learning"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Identifier unik, huruf kecil tanpa spasi (contoh: persuratan, inventarisir)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Aplikasi
              </label>
              <input
                name="name"
                required
                placeholder="contoh: UNIGA E-Learning"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Nama tampilan aplikasi yang akan terlihat oleh pengguna
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redirect URI (Callback URL)
            </label>
            <input
              name="redirect_uri"
              required
              type="url"
              placeholder="https://elearning.unigamalang.ac.id/auth/callback"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              URL di aplikasi Anda yang menerima kode otorisasi setelah login SSO.
              Harus diawali dengan <code className="rounded bg-gray-100 px-1">https://</code> dan diakhiri dengan <code className="rounded bg-gray-100 px-1">/auth/callback</code>
            </p>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <SubmitButton />
            <p className="text-xs text-gray-400">
              Setelah mendaftar, Anda akan mendapatkan Client Secret
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
