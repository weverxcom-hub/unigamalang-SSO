import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/crypto";
import Image from "next/image";
import LoginForm from "./login-form";
import { googleAvailable } from "@/lib/google-oauth";

const GOOGLE_ERRORS: Record<string, string> = {
  google_domain: "Hanya akun Google @unigamalang.ac.id yang dapat digunakan.",
  google_unregistered:
    "Akun Google Anda belum terdaftar di SSO. Hubungi administrator.",
  google_failed: "Login dengan Google gagal. Silakan coba lagi.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: {
    client_id?: string;
    redirect_uri?: string;
    state?: string;
    error?: string;
  };
}) {
  const session = await getSSOSession();
  const { client_id: clientId, redirect_uri: redirectUri, state } = searchParams;
  const googleError = searchParams.error ? GOOGLE_ERRORS[searchParams.error] : undefined;
  const googleParams = new URLSearchParams();
  if (clientId) googleParams.set("client_id", clientId);
  if (redirectUri) googleParams.set("redirect_uri", redirectUri);
  if (state) googleParams.set("state", state);

  if (session) {
    if (clientId && redirectUri) {
      const app = await prisma.app.findUnique({ where: { clientId } });
      if (app && app.redirectUri === redirectUri) {
        const code = generateCode();
        await prisma.authCode.create({
          data: {
            code,
            userId: session.userId,
            appId: app.id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set("code", code);
        if (state) callbackUrl.searchParams.set("state", state);
        redirect(callbackUrl.toString());
      }
    }
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <Image
              src="/logo-uniga.png"
              alt="Logo Universitas Gajayana Malang"
              width={64}
              height={64}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Universitas Gajayana Malang
          </h1>
          <p className="mt-1 text-sm text-blue-200">
            Single Sign-On (SSO)
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-2 text-center text-lg font-semibold text-gray-800">
            Masuk ke Akun Anda
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            Gunakan email institusi @unigamalang.ac.id
          </p>

          {clientId && (
            <div className="mb-6 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700 border border-blue-100">
              Anda akan diarahkan kembali ke{" "}
              <strong className="font-semibold">{clientId}</strong> setelah login
            </div>
          )}

          {googleError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {googleError}
            </div>
          )}

          {googleAvailable() && (
            <>
              <a
                href={`/auth/google/start?${googleParams.toString()}`}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                  <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.1z" />
                  <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-8.1 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                </svg>
                Masuk dengan Google
              </a>
              <div className="mb-5 flex items-center gap-3 text-xs text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                atau
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            </>
          )}

          <LoginForm
            clientId={clientId}
            redirectUri={redirectUri}
            state={state}
          />
        </div>

        <p className="mt-6 text-center text-xs text-blue-300">
          &copy; {new Date().getFullYear()} Universitas Gajayana Malang
        </p>
      </div>
    </div>
  );
}
