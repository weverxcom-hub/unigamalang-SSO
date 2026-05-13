import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <Image
              src="/logo-uniga.png"
              alt="Logo UNIGA"
              width={64}
              height={64}
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
        </div>
        <p className="text-sm font-medium text-blue-200">Memuat...</p>
      </div>
    </div>
  );
}
