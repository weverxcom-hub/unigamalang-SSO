import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSSOSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-lg font-bold text-blue-600"
              >
                UNIGA SSO
              </Link>
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Beranda
                </Link>
                <Link
                  href="/dashboard/apps"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Aplikasi
                </Link>
                <Link
                  href="/dashboard/users"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Pengguna
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{session.name}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
