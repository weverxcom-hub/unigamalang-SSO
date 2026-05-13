"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { editAppAction, deleteAppAction, regenerateSecretAction, type EditAppState, type RegisterAppState } from "./actions";

function SubmitBtn({ label, pending }: { label: string; pending?: boolean }) {
  const { pending: formPending } = useFormStatus();
  const isPending = pending || formPending;
  return (
    <button
      type="submit"
      disabled={isPending}
      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
    >
      {isPending ? "Menyimpan..." : label}
    </button>
  );
}

interface AppCardProps {
  app: {
    id: string;
    clientId: string;
    name: string;
    redirectUri: string;
    createdAt: string;
    _count: { appRoles: number };
  };
}

export function AppCard({ app }: AppCardProps) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [editState, editAction] = useFormState<EditAppState, FormData>(editAppAction, {});
  const [secretState, secretAction] = useFormState<RegisterAppState, FormData>(regenerateSecretAction, {});

  if (mode === "edit") {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b bg-blue-50 px-5 py-3">
          <h3 className="text-sm font-semibold text-blue-900">Edit Aplikasi: {app.name}</h3>
        </div>
        <div className="p-5">
          {editState.error && (
            <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {editState.error}
            </div>
          )}
          {editState.success && (
            <div className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {editState.success}
            </div>
          )}
          <form action={editAction} className="space-y-3">
            <input type="hidden" name="app_id" value={app.id} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label>
              <input
                name="name"
                required
                defaultValue={app.name}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
              <input
                name="redirect_uri"
                required
                defaultValue={app.redirectUri}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <SubmitBtn label="Simpan Perubahan" />
              <button
                type="button"
                onClick={() => setMode("view")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b bg-red-50 px-5 py-3">
          <h3 className="text-sm font-semibold text-red-900">Hapus Aplikasi: {app.name}</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-1">
            Apakah Anda yakin ingin menghapus aplikasi <strong>{app.name}</strong>?
          </p>
          <p className="text-xs text-red-600 mb-4">
            Semua role pengguna dan kode otorisasi untuk aplikasi ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-2">
            <form action={deleteAppAction}>
              <input type="hidden" name="app_id" value={app.id} />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </form>
            <button
              onClick={() => setMode("view")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode("edit")}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setMode("delete")}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Hapus"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
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
            <span>Dibuat {new Date(app.createdAt).toLocaleDateString("id-ID")}</span>
          </div>
        </div>

        {/* Regenerate secret */}
        {secretState.clientSecret && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-800">Secret Baru (simpan sekarang!):</p>
            <code className="mt-1 block rounded bg-white p-2 text-xs font-mono text-gray-900 border select-all break-all">
              {secretState.clientSecret}
            </code>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t bg-gray-50 px-5 py-3 flex items-center justify-between">
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
        <form action={secretAction}>
          <input type="hidden" name="app_id" value={app.id} />
          <button
            type="submit"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Regenerate Secret
          </button>
        </form>
      </div>
    </div>
  );
}
