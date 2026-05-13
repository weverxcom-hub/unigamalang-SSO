"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 transition-colors"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}

export default function LoginForm({
  clientId,
  redirectUri,
  state,
}: {
  clientId?: string;
  redirectUri?: string;
  state?: string;
}) {
  const [formState, formAction] = useFormState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      {clientId && (
        <input type="hidden" name="client_id" value={clientId} />
      )}
      {redirectUri && (
        <input type="hidden" name="redirect_uri" value={redirectUri} />
      )}
      {state && <input type="hidden" name="state" value={state} />}

      {formState.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {formState.error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Email Institusi
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nama@unigamalang.ac.id"
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
