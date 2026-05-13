import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/crypto";
import Image from "next/image";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { client_id?: string; redirect_uri?: string; state?: string };
}) {
  const session = await getSSOSession();
  const { client_id: clientId, redirect_uri: redirectUri, state } = searchParams;

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
