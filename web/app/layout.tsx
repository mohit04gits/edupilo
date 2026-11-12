import type { Metadata } from "next";
import { Fredoka, Mukta, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-display" });
const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});
const hindi = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-hindi",
});

export const metadata: Metadata = {
  title: "Edupilo — Turn lessons into stories children understand",
  description: "Illustrated educational story videos, reviewed by parents and teachers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${mukta.variable} ${hindi.variable}`}>{children}</body>
    </html>
  );
}
