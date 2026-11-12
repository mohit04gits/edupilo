"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LogoutButton } from "../auth/logout-button";

const NAV_LINKS = [
  { href: "/dashboard", label: "My stories" },
  { href: "/stories/new", label: "Create" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href;
}

export function AppNav({ email, roleLabel }: { email: string; roleLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Application">
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className="hidden min-h-11 items-center rounded-xl px-3 font-semibold text-ink-2 transition hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink/[.06] aria-[current=page]:text-ink sm:flex"
        >
          {label}
        </Link>
      ))}

      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-2.5 font-semibold transition hover:border-ink/40 sm:px-3"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full bg-orange text-xs font-extrabold text-ink"
          >
            {roleLabel.charAt(0)}
          </span>
          <span className="hidden sm:inline">Account</span>
          <span aria-hidden className={`text-xs transition ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {open && (
          <div
            id={menuId}
            className="absolute right-0 z-40 mt-2 w-[min(18rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-white p-2 shadow-xl"
          >
            <div className="px-3 pb-3 pt-2">
              <p className="font-bold">{roleLabel} account</p>
              <p className="mt-0.5 truncate text-sm text-ink-2" title={email}>
                {email}
              </p>
            </div>
            <div className="border-t border-line py-1 sm:hidden">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-ink/5 aria-[current=page]:text-green"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-line px-1 pb-1 pt-3">
              <LogoutButton className="w-full" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
