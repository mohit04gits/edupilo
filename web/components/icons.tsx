import type { SVGProps } from "react";

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 34 26" fill="none" aria-hidden="true" {...props}>
      <rect x="1.5" y="1.5" width="31" height="23" rx="6" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="11.5" cy="10.5" r="4" fill="#F2A93B" />
      <path
        d="M5 20.5C12 14.5 22 14.5 29 20.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
