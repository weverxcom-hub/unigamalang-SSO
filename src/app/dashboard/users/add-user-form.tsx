"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addUserAction, type AddUserState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Menambahkan..." : "Tambah Pengguna"}
    </button>
  );
}

export function AddUserForm() {
  const [state, formAction] = useFormState<AddUserState, FormData>(
    addUserAction,
    {}
  );

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-gray-900">Tambah Pengguna Baru</h2>

      {state.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {state.success}
        </div>
      )}

      <form action={formAction} className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            name="name"
            required
            placeholder="Nama Lengkap"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="nama@unigamalang.ac.id"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Min. 6 karakter"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
