"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./icons";

type SessionState = "unknown" | "signed-in" | "signed-out";

/**
 * The homepage is statically prerendered, so it learns about the session on the client.
 * Re-checking on `pageshow` covers pages restored from the back/forward cache (e.g. pressing
 * Back from the dashboard), which would otherwise keep showing "Log in" to a signed-in adult.
 */
function useSessionState(): SessionState {
  const [state, setState] = useState<SessionState>("unknown");
  useEffect(() => {
    let active = true;
    const check = () =>
      fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { authenticated?: boolean } | null) => {
          if (active) setState(body?.authenticated ? "signed-in" : "signed-out");
        })
        .catch(() => {
          if (active) setState("signed-out");
        });
    check();
    window.addEventListener("pageshow", check);
    return () => {
      active = false;
      window.removeEventListener("pageshow", check);
    };
  }, []);
  return state;
}

const links = [
  ["How it works", "#how"],
  ["Example lesson", "#lesson"],
  ["For parents & teachers", "#adults"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const signedIn = useSessionState() === "signed-in";
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <a
          href="#top"
          aria-label="Edupilo, back to top"
          className="flex min-h-11 items-center gap-2.5 rounded-lg"
        >
          <LogoMark className="h-[26px] w-[34px]" />
          <span className="display text-[27px] font-semibold">edupilo</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-xl px-3.5 py-2 text-[15.5px] font-medium text-ink-2 hover:bg-ink/5 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          {signedIn ? (
            <a
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-[18px] text-[15.5px] font-semibold text-white hover:bg-ink-hover"
            >
              My stories
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="hidden min-h-11 items-center px-2 font-semibold sm:inline-flex"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-[18px] text-[15.5px] font-semibold text-white hover:bg-ink-hover"
              >
                Get Started
              </a>
            </>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-white md:hidden"
          >
            <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-line bg-paper px-5 pb-3 md:hidden">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-13 items-center border-b border-line font-semibold"
            >
              {label}
            </a>
          ))}
          {!signedIn && (
            <a href="/login" className="flex min-h-13 items-center font-semibold sm:hidden">
              Log in
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
