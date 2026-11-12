import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);
  if (await getCurrentUser()) redirect(nextPath);
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Continue your learning stories."
      description="Sign in to return to your Edupilo projects."
    >
      <AuthForm mode="login" nextPath={nextPath} />
    </AuthShell>
  );
}
