import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/crypto";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { client_id?: string; redirect_uri?: string; state?: string };
}) {
  const session = await getSSOSession();
  const { client_id: clientId, redirect_uri: redirectUri, state } = searchParams;

  // Already logged in → either redirect to the requesting app or to SSO dashboard
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
              U
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              UNIGA SSO
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Masuk ke semua aplikasi Universitas Gajayana
            </p>
          </div>

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

          <p className="mt-6 text-center text-xs text-gray-400">
            Universitas Gajayana Malang &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
