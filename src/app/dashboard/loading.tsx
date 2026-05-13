import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 p-2">
            <Image
              src="/logo-uniga.png"
              alt="Logo UNIGA"
              width={48}
              height={48}
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
        </div>
        <p className="text-sm text-gray-500">Memuat halaman...</p>
      </div>
    </div>
  );
}
