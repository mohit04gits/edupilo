import Link from "next/link";
import { LogoMark } from "./icons";

export function Brand({ href, label }: { href: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} className="flex min-h-11 items-center gap-2.5 rounded-lg">
      <LogoMark className="h-[26px] w-[34px]" />
      <span className="display text-[27px] font-semibold">edupilo</span>
    </Link>
  );
}
