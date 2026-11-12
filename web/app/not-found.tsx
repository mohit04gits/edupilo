import Link from "next/link";
import { Brand } from "@/components/brand";
import { buttonPrimary } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="body-grid flex min-h-screen flex-col px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-[1080px]">
        <Brand href="/" label="Edupilo home" />
      </div>
      <div className="mx-auto my-auto max-w-xl py-16 text-center">
        <p className="text-sm font-extrabold uppercase tracking-[.15em] text-orange">
          Page not found
        </p>
        <h1 className="display mt-3 text-[clamp(40px,6vw,60px)]">This page wandered off.</h1>
        <p className="mt-4 text-ink-2">
          The page may have moved, or the story you’re looking for isn’t available to your account.
        </p>
        <Link href="/dashboard" className={`${buttonPrimary} mt-8`}>
          Go to my stories
        </Link>
      </div>
    </main>
  );
}
