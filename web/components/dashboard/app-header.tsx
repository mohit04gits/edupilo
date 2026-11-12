import type { PublicUser } from "@/lib/auth";
import { Brand } from "../brand";
import { AppNav } from "./profile-menu";

export function roleLabel(user: PublicUser): "Teacher" | "Parent" {
  return user.rolePreference === "TEACHER" ? "Teacher" : "Parent";
}

export function AppHeader({ user }: { user: PublicUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Brand href="/dashboard" label="Edupilo, my stories" />
        <AppNav email={user.email} roleLabel={roleLabel(user)} />
      </div>
    </header>
  );
}

export function AppShell({
  user,
  children,
  width = "wide",
}: {
  user: PublicUser;
  children: React.ReactNode;
  width?: "wide" | "narrow";
}) {
  return (
    <div className="min-h-screen bg-paper">
      <AppHeader user={user} />
      <main
        className={`mx-auto px-5 py-8 sm:px-8 sm:py-12 ${width === "wide" ? "max-w-[1180px]" : "max-w-[960px]"}`}
      >
        {children}
      </main>
    </div>
  );
}
