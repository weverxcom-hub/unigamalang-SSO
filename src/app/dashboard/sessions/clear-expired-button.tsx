"use client";

import { useFormStatus } from "react-dom";
import { clearExpiredSessionsAction } from "./actions";

function Button({ expiredCount }: { expiredCount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || expiredCount === 0}
      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors border border-red-200"
    >
      {pending ? "Membersihkan..." : `Hapus ${expiredCount} Sesi Kedaluwarsa`}
    </button>
  );
}

export function ClearExpiredButton({ expiredCount }: { expiredCount: number }) {
  return (
    <form action={clearExpiredSessionsAction}>
      <Button expiredCount={expiredCount} />
    </form>
  );
}
