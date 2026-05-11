"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAppAction, type RegisterAppState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-gray-900">
        Daftarkan Aplikasi Baru
      </h2>

      {state.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 space-y-2">
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            {state.success}
          </div>
          {state.clientSecret && (
            <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800 mb-1">
                CLIENT SECRET (simpan sekarang!)
              </p>
              <code className="block rounded bg-white p-2 text-sm font-mono text-gray-900 border select-all">
                {state.clientSecret}
              </code>
            </div>
          )}
        </div>
      )}

      <form action={formAction} className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client ID
          </label>
          <input
            name="client_id"
            required
            placeholder="persuratan"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Aplikasi
          </label>
          <input
            name="name"
            required
            placeholder="UNIGA Persuratan"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Redirect URI
          </label>
          <input
            name="redirect_uri"
            required
            placeholder="https://persuratan.unigamalang.ac.id/auth/callback"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="sm:col-span-3">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
