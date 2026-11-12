"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { NETWORK_ERROR_MESSAGE, readApiResponse } from "@/lib/http/client";
import { DEFAULT_AUTHENTICATED_PATH } from "@/lib/navigation";
import { alertError, buttonPrimary, field, fieldLabel } from "../ui/styles";

const ROLE_OPTIONS = [
  ["PARENT", "Parent"],
  ["TEACHER", "Teacher"],
] as const;

export function AuthForm({
  mode,
  nextPath = DEFAULT_AUTHENTICATED_PATH,
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const signup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email address and password.");
      return;
    }
    if (signup && password.length < 10) {
      setError("Use a password with at least 10 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(signup ? { rolePreference: String(form.get("rolePreference") ?? "PARENT") } : {}),
        }),
      });
      const result = await readApiResponse(response);
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }
      // Full navigation (not a client transition) so no pre-login page stays in the router
      // cache, and the auth page is replaced in history: Back from the dashboard never lands
      // on a stale signed-out view.
      window.location.replace(nextPath);
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
      {signup && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-2">I’m creating lessons as a</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(([value, label]) => (
              <label
                key={value}
                className="cursor-pointer rounded-xl border border-line bg-white p-3 text-center font-semibold transition has-[:checked]:border-ink has-[:checked]:bg-cream has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/25"
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="rolePreference"
                  value={value}
                  defaultChecked={value === "PARENT"}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="block">
        <span className={fieldLabel}>Email address</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          className={field}
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className={fieldLabel}>Password</span>
        <span className="relative block">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={signup ? "new-password" : "current-password"}
            required
            minLength={signup ? 10 : undefined}
            className={`${field} pr-20`}
            placeholder={signup ? "At least 10 characters" : "Your password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-1 right-1 rounded-lg px-3 text-sm font-bold text-ink-2 hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      {error && (
        <p role="alert" className={alertError}>
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={`${buttonPrimary} w-full`}>
        {loading
          ? signup
            ? "Creating account…"
            : "Signing in…"
          : signup
            ? "Create my account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-2">
        {signup ? "Already have an account?" : "New to Edupilo?"}{" "}
        <Link
          className="font-bold text-ink underline decoration-orange decoration-2 underline-offset-4"
          href={`${signup ? "/login" : "/signup"}${
            nextPath === DEFAULT_AUTHENTICATED_PATH ? "" : `?next=${encodeURIComponent(nextPath)}`
          }`}
          replace
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
