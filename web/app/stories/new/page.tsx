import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-header";
import { IdeaStudio } from "@/components/lessons/idea-studio";
import { requireCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create — Edupilo" };

const STYLES = [
  { name: "Story adventure", note: "A friendly tale that carries the idea", color: "bg-orange" },
  { name: "Visual explainer", note: "Clear pictures, labels and diagrams", color: "bg-green" },
  { name: "Animated demo", note: "Watch it happen step by step", color: "bg-ink" },
  { name: "Character guide", note: "A buddy who explains along the way", color: "bg-[#e5735a]" },
  { name: "Curiosity journey", note: "Start with a question, discover the answer", color: "bg-[#5b8def]" },
] as const;

const INSPIRATION = [
  { area: "Maths", idea: "Show why 3 × 4 is the same as 4 × 3", tint: "bg-cream" },
  { area: "Science", idea: "Why do we see lightning before thunder?", tint: "bg-mint" },
  { area: "Habits", idea: "Why we wash hands before eating", tint: "bg-[#fde6df]" },
  { area: "English", idea: "Words that rhyme with ‘cat’", tint: "bg-[#e3ecfd]" },
] as const;

function Inspiration() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {INSPIRATION.map(({ area, idea, tint }) => (
        <div key={area} className={`rounded-2xl p-4 ${tint}`}>
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-ink-2">{area}</p>
          <p className="display mt-2 text-xl leading-tight">{idea}</p>
        </div>
      ))}
    </div>
  );
}

export default async function CreatePage() {
  const user = await requireCurrentUser("/stories/new");
  const teacher = user.rolePreference === "TEACHER";

  return (
    <AppShell user={user}>
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center font-bold text-ink-2 hover:text-ink"
      >
        ← My stories
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <section aria-labelledby="studio-heading">
          <div className="relative">
            <p className="relative text-sm font-extrabold uppercase tracking-[.16em] text-orange">
              Creative studio
            </p>
            <h1
              id="studio-heading"
              className="display relative mt-3 text-[clamp(38px,5.4vw,64px)]"
            >
              What would you like to teach or explain?
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-2">
              {teacher
                ? "Describe a concept your class finds tricky, a question they asked, or a habit you want to build."
                : "Describe something your child finds tricky, a question they asked, or a habit you’d like to build."}{" "}
              Edupilo turns it into an animated learning video.
            </p>
          </div>

          <div className="mt-8">
            <IdeaStudio inspirations={<Inspiration />} />
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[24px] bg-green p-6 text-white">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#bce0cc]">
              Edupilo picks the best way
            </p>
            <h2 className="display mt-2 text-3xl">Not every lesson is a story.</h2>
            <p className="mt-3 text-sm text-white/75">
              Based on your idea and the learner’s age, Edupilo suggests the clearest way to
              explain it.
            </p>
            <ul className="mt-5 space-y-2.5">
              {STYLES.map(({ name, note, color }) => (
                <li key={name} className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
                  <span
                    aria-hidden
                    className={`mt-1 size-3.5 shrink-0 rounded-full ring-2 ring-white/70 ${color}`}
                  />
                  <span>
                    <span className="block font-bold">{name}</span>
                    <span className="block text-sm text-white/70">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="font-bold">What happens next</p>
            <ol className="mt-3 space-y-3 text-sm text-ink-2">
              {[
                "We save your idea.",
                "Edupilo drafts a script and scenes for you to review.",
                "You approve every scene before the video is made.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-extrabold text-ink">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
