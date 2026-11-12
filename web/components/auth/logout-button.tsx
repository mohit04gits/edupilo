"use client";

import { useState } from "react";
import { NETWORK_ERROR_MESSAGE, readApiResponse } from "@/lib/http/client";
import { buttonSecondary } from "../ui/styles";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setLoading(true);
    setError("");
    try {
      const result = await readApiResponse(await fetch("/api/auth/logout", { method: "POST" }));
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }
      // Full navigation clears the client router cache, so Back cannot show cached
      // authenticated pages; protected pages are also served no-store by proxy.ts.
      window.location.replace("/login");
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={signOut}
        className={`${buttonSecondary} ${className}`}
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
