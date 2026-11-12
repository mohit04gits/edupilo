import Link from "next/link";
import { AppShell, roleLabel } from "@/components/dashboard/app-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { LessonArt } from "@/components/lesson-art";
import { buttonAccent, buttonSecondary, eyebrow } from "@/components/ui/styles";
import { requireCurrentUser } from "@/lib/auth";
import { findRecentOwnedProjects } from "@/lib/lessons";

export const dynamic = "force-dynamic";

const RECENT_LIMIT = 9;

export default async function DashboardPage() {
  const user = await requireCurrentUser("/dashboard");
  const projects = await findRecentOwnedProjects(user.id, RECENT_LIMIT);
  const role = roleLabel(user);
  const hasProjects = projects.length > 0;

  return (
    <AppShell user={user}>
      <section className="relative overflow-hidden rounded-[28px] bg-ink p-7 text-white sm:p-10">
        <div
          aria-hidden
          className="absolute -right-14 -top-20 size-36 rounded-full bg-orange sm:-right-10 sm:-top-16 sm:size-52"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 right-28 hidden size-60 rounded-full bg-green md:block"
        />
        <div className="relative max-w-2xl">
          <p className={`${eyebrow} text-sun`}>{role} workspace</p>
          <h1 className="display mt-3 text-[clamp(38px,6vw,64px)]">
            {hasProjects ? "Welcome back." : "Welcome to Edupilo."}
          </h1>
          <p className="mt-4 max-w-xl text-white/75">
            Describe anything a child is curious about or finds tricky. Edupilo turns it into an
            animated learning video you review first.
          </p>
          <Link href="/stories/new" className={`${buttonAccent} mt-7`}>
            Start with an idea <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="recent-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`${eyebrow} text-green`}>Your workspace</p>
            <h2 id="recent-heading" className="display mt-2 text-4xl sm:text-5xl">
              Recent lesson stories
            </h2>
          </div>
          {hasProjects && (
            <Link href="/stories/new" className={buttonSecondary}>
              New idea
            </Link>
          )}
        </div>

        {hasProjects ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {projects.length === RECENT_LIMIT && (
              <p className="mt-4 text-sm text-ink-2">
                Showing your {RECENT_LIMIT} most recently updated stories.
              </p>
            )}
          </>
        ) : (
          <div className="mt-6 grid items-center gap-7 overflow-hidden rounded-[24px] border border-dashed border-ink/25 bg-white p-6 sm:p-8 md:grid-cols-[.72fr_1.28fr]">
            <LessonArt scene={1} className="mx-auto w-full max-w-[320px]" />
            <div>
              <p className={`${eyebrow} text-orange`}>Nothing here yet</p>
              <h3 className="display mt-2 text-[clamp(32px,5vw,50px)]">
                Your storytelling journey starts here.
              </h3>
              <p className="mt-4 max-w-xl text-ink-2">
                Type a learning idea in your own words — “why does the moon change shape?” is
                enough. We’ll save it so you can come back to it.
              </p>
              <Link
                href="/stories/new"
                className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-green px-6 font-bold text-white transition hover:bg-green-hover"
              >
                Share your first idea
              </Link>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
