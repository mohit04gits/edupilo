"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NETWORK_ERROR_MESSAGE, readApiResponse } from "@/lib/http/client";

export function DeleteIdeaButton({
  projectId,
  redirectTo,
  compact = false,
}: {
  projectId: string;
  /** Where to go after deleting; refreshes the current page when omitted. */
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/lesson-projects/${projectId}`, { method: "DELETE" });
      const result = await readApiResponse<{ deleted: true }>(response);
      if (!result.ok) return setError(result.message);
      if (redirectTo) window.location.replace(redirectTo);
      else router.refresh();
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setBusy(false);
    }
  }

  const base = "rounded-lg font-bold transition disabled:opacity-60";
  const size = compact ? "px-2.5 py-1 text-xs" : "min-h-11 px-4 text-sm";

  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`${base} ${size} text-ink-2 hover:bg-red-50 hover:text-red-700`}
      >
        Delete
      </button>
    );

  return (
    <div role="group" aria-label="Confirm delete" className="flex flex-wrap items-center gap-2">
      <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-red-700`}>
        Delete for good?
      </span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className={`${base} ${size} bg-red-600 text-white hover:bg-red-700`}
      >
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className={`${base} ${size} text-ink-2 hover:text-ink`}
      >
        Cancel
      </button>
      {error && <p role="alert" className="w-full text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
