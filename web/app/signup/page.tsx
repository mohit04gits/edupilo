import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);
  if (await getCurrentUser()) redirect(nextPath);
  return (
    <AuthShell
      eyebrow="Create your account"
      title="Bring a lesson to life."
      description="For parents and teachers creating safe, reviewed educational stories."
    >
      <AuthForm mode="signup" nextPath={nextPath} />
    </AuthShell>
  );
}
