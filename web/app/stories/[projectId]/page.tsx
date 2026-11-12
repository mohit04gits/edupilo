import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-header";
import { DeleteIdeaButton } from "@/components/lessons/delete-idea-button";
import { ConceptArt } from "@/components/plans/concept-art";
import { PlanActions } from "@/components/plans/plan-actions";
import { eyebrow } from "@/components/ui/styles";
import { requireCurrentUser } from "@/lib/auth";
import type { StoryboardVersion } from "@/lib/domain";
import { findOwnedProject } from "@/lib/lessons";
import { conceptTheme } from "@/lib/lessons/concept-theme";
import { localeLabel, preferenceLabel } from "@/lib/lessons/presentation";
import { LEARNER_LABELS } from "@/lib/lessons/taxonomy";
import { findLatestOwnedPlan } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Concept preview — Edupilo" };

const STYLE: Record<StoryboardVersion["presentationMode"], { name: string; note: string }> = {
  STORYTELLING: { name: "Story adventure", note: "A friendly tale carries the idea" },
  VISUAL_EXPLORATION: { name: "Visual explainer", note: "Clear pictures and simple labels" },
  ANIMATED_DEMONSTRATION: { name: "Animated demo", note: "Watch it happen step by step" },
  EXPLANATION: { name: "Gentle explanation", note: "A calm, clear walk-through" },
};

const firstSentence = (text: string) => {
  const match = text.match(/^.*?[.!?।](\s|$)/);
  return (match ? match[0] : text).trim();
};

function Pill({ children, tone = "white" }: { children: React.ReactNode; tone?: "white" | "cream" }) {
  return (
    <span
      className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
        tone === "cream" ? "bg-cream text-ink" : "bg-white text-ink ring-1 ring-line"
      }`}
    >
      {children}
    </span>
  );
}

export default async function ConceptPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireCurrentUser(`/stories/${encodeURIComponent(projectId)}`);
  const project = await findOwnedProject(user.id, projectId);
  if (!project) notFound();
  const plan = await findLatestOwnedPlan(user.id, projectId);
  const style = plan ? STYLE[plan.presentationMode] : null;
  const approved = plan?.status === "APPROVED";
  const description = plan
    ? (plan.storyPremise ?? firstSentence(plan.scenes[0]?.narration ?? plan.explanationApproach))
    : null;

  return (
    <AppShell user={user}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center font-bold text-ink-2 hover:text-ink"
        >
          ← My stories
        </Link>
        <DeleteIdeaButton projectId={projectId} redirectTo="/dashboard" />
      </div>

      {!plan ? (
        <>
          <header className="mt-3">
            <p className={`${eyebrow} text-orange`}>Your idea</p>
            <h1 className="display mt-3 text-[clamp(34px,5vw,56px)]">{project.instruction}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{LEARNER_LABELS[project.learnerLevel]}</Pill>
              <Pill>{localeLabel(project.locale)}</Pill>
              {project.creativePreferences?.map((p) => (
                <Pill key={p} tone="cream">
                  {preferenceLabel(p)}
                </Pill>
              ))}
            </div>
          </header>
          <div className="mt-8">
            <PlanActions projectId={projectId} plan={null} />
          </div>
        </>
      ) : (
        <>
          <section
            aria-labelledby="concept-title"
            className="mt-3 overflow-hidden rounded-[28px] border border-line bg-white soft-shadow"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-cream px-6 py-3 sm:px-8">
              <span className="rounded-full bg-orange px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-ink">
                Concept preview
              </span>
              <span className="text-sm font-semibold text-ink-2">
                {approved
                  ? "Approved. The video itself hasn’t been made yet."
                  : "This is the plan for your video. No video has been made yet."}
              </span>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center">
              <div>
                <h1 id="concept-title" className="display text-[clamp(34px,4.6vw,54px)] leading-[1.02]">
                  {plan.title}
                </h1>
                {description && (
                  <p className="mt-4 text-lg leading-relaxed text-ink-2">{description}</p>
                )}
                <div className="mt-6 rounded-2xl bg-mint p-5">
                  <p className={`${eyebrow} text-green`}>What your child will learn</p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-ink">
                    {plan.learningObjective}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>{LEARNER_LABELS[project.learnerLevel]}</Pill>
                  <Pill>{localeLabel(project.locale)}</Pill>
                  {style && <Pill tone="cream">{style.name}</Pill>}
                </div>
              </div>
              <ConceptArt theme={conceptTheme(project.instruction, plan.title, plan.learningObjective)} />
            </div>

            <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
              {[
                { label: "How it’s explained", value: style?.name, note: style?.note },
                {
                  label: "Told in",
                  value: localeLabel(project.locale),
                  note: "Friendly narration with on-screen words",
                },
                {
                  label: "Made for",
                  value: LEARNER_LABELS[project.learnerLevel],
                  note: "Words and pace suited to this age",
                },
              ].map((item) => (
                <div key={item.label} className="bg-white px-6 py-5 sm:px-8">
                  <p className="text-xs font-extrabold uppercase tracking-[.14em] text-ink-2">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-extrabold">{item.value}</p>
                  <p className="text-sm text-ink-2">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <details className="group mt-6 rounded-[22px] border border-line bg-white p-5 sm:px-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
              <span>Read what your child will hear</span>
              <span aria-hidden className="text-ink-2 transition group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-4 space-y-3 text-lg leading-relaxed text-ink">
              {plan.scenes.map((scene) => (
                <p key={scene.id}>{scene.narration}</p>
              ))}
            </div>
            {!approved && plan.validation.findings.length > 0 && (
              <div className="mt-5 rounded-xl bg-cream p-4 text-sm text-ink-2">
                <p className="font-bold text-ink">Notes from our safety and accuracy check</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {plan.validation.findings.map((f, i) => (
                    <li key={`${f.code}-${i}`}>{f.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </details>

          <div className="mt-6">
            <PlanActions projectId={projectId} plan={plan} />
          </div>
        </>
      )}
    </AppShell>
  );
}
