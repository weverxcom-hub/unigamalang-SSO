import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";
import Image from "next/image";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSSOSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-white shadow-sm">
        {/* Brand header */}
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <Image
            src="/logo-uniga.png"
            alt="Logo UNIGA"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">UNIGA SSO</p>
            <p className="truncate text-xs text-gray-500">Single Sign-On</p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User footer */}
        <div className="mt-auto border-t px-5 py-4">
          <p className="truncate text-sm font-medium text-gray-900">{session.name}</p>
          <p className="truncate text-xs text-gray-500">{session.email}</p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
