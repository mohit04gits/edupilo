"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import type { LearnerLevel, Locale, StoryProject } from "@/lib/domain";
import { NETWORK_ERROR_MESSAGE, readApiResponse } from "@/lib/http/client";
import { CREATIVE_PREFERENCES, type CreativePreference } from "@/lib/lessons/idea";
import { LEARNER_LABELS } from "@/lib/lessons/taxonomy";
import { alertError } from "../ui/styles";

const IDEA_MIN = 10;
const IDEA_MAX = 2000;

export const IDEA_EXAMPLES = [
  "My child does not understand multiplication.",
  "Explain why the moon changes shape.",
  "Teach good habits in a fun way.",
  "Explain how plants grow from a seed.",
  "Fractions are confusing for my child.",
  "Why do airplanes not fall from the sky?",
] as const;

const LEVEL_HINTS: Record<LearnerLevel, string> = {
  NURSERY: "3–4 yrs",
  KG: "4–6 yrs",
  CLASS_1: "6–7 yrs",
  CLASS_2: "7–8 yrs",
  CLASS_3: "8–9 yrs",
  CLASS_4: "9–10 yrs",
};

const pill =
  "cursor-pointer select-none rounded-full border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink-2 transition hover:border-ink/40 hover:text-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/30";

export function IdeaStudio({ inspirations }: { inspirations?: React.ReactNode }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [idea, setIdea] = useState("");
  const [level, setLevel] = useState<LearnerLevel>("CLASS_2");
  const [locale, setLocale] = useState<Locale>("en-IN");
  const [preferences, setPreferences] = useState<CreativePreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const length = idea.trim().length;

  function applyExample(text: string) {
    setIdea(text);
    setError("");
    textareaRef.current?.focus();
  }

  function togglePreference(key: CreativePreference) {
    setPreferences((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (length < IDEA_MIN) {
      setError("Tell us a little more — a sentence or two is perfect.");
      textareaRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/lesson-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerLevel: level,
          locale,
          instruction: idea,
          creativePreferences: preferences,
        }),
      });
      const result = await readApiResponse<{ project: StoryProject }>(response);
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }
      // Replace so Back from the saved idea returns to the dashboard, not a submitted form.
      router.replace(`/stories/${result.data.project.id}`);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {/* Primary input */}
      <div className="relative rounded-[28px] border border-line bg-white p-2 soft-shadow focus-within:border-ink/40 focus-within:ring-4 focus-within:ring-orange/20">
        <label htmlFor="idea" className="sr-only">
          What would you like to teach or explain?
        </label>
        <textarea
          ref={textareaRef}
          id="idea"
          name="instruction"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          maxLength={IDEA_MAX}
          rows={5}
          aria-describedby="idea-help"
          placeholder="e.g. My child gets confused when we share sweets equally between friends…"
          className="block min-h-[170px] w-full resize-y rounded-[22px] bg-transparent px-5 py-4 text-lg leading-relaxed text-ink outline-none placeholder:text-ink-2/55 sm:text-xl"
        />
        <div className="flex items-center justify-between gap-3 px-5 pb-3 text-sm">
          <span id="idea-help" className="text-ink-2">
            Write it your way — rough is fine. Please leave out children’s names or personal
            details.
          </span>
          <span className="shrink-0 tabular-nums text-ink-2">
            {idea.length}/{IDEA_MAX}
          </span>
        </div>
      </div>

      {/* Example prompts */}
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[.14em] text-green">
          Try asking about…
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEA_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => applyExample(example)}
              className="rounded-full border border-dashed border-ink/25 bg-paper px-3.5 py-2 text-left text-sm font-semibold text-ink transition hover:border-solid hover:border-orange hover:bg-cream"
            >
              {example}
            </button>
          ))}
        </div>
        {inspirations && <div className="mt-6">{inspirations}</div>}
      </div>

      {/* Light supporting controls */}
      <div className="grid gap-6 rounded-[24px] border border-line bg-white/70 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
        <fieldset>
          <legend className="text-sm font-extrabold text-ink">Who is it for?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(LEARNER_LABELS) as LearnerLevel[]).map((key) => (
              <label key={key} className={pill}>
                <input
                  type="radio"
                  name="learnerLevel"
                  value={key}
                  checked={level === key}
                  onChange={() => setLevel(key)}
                  className="sr-only"
                />
                {LEARNER_LABELS[key]}
                <span className="ml-1.5 font-semibold opacity-60">{LEVEL_HINTS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-extrabold text-ink">Narration language</legend>
          <div className="mt-3 flex gap-2">
            {(
              [
                ["en-IN", "English"],
                ["hi-IN", "हिन्दी Hindi"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={pill}>
                <input
                  type="radio"
                  name="locale"
                  value={key}
                  checked={locale === key}
                  onChange={() => setLocale(key)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Optional creative preferences */}
      <fieldset>
        <legend className="text-sm font-extrabold text-ink">
          Make it yours <span className="font-semibold text-ink-2">— optional</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.entries(CREATIVE_PREFERENCES) as [CreativePreference, string][]).map(
            ([key, label]) => (
              <label
                key={key}
                className="cursor-pointer select-none rounded-full border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink-2 transition hover:border-green/50 has-[:checked]:border-green has-[:checked]:bg-mint has-[:checked]:text-green has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green/25"
              >
                <input
                  type="checkbox"
                  checked={preferences.includes(key)}
                  onChange={() => togglePreference(key)}
                  className="sr-only"
                />
                <span aria-hidden className="mr-1.5">
                  {preferences.includes(key) ? "✓" : "+"}
                </span>
                {label}
              </label>
            ),
          )}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className={alertError}>
          {error}
        </p>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-4 rounded-[24px] bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="max-w-md text-sm text-white/75">
          <strong className="block text-base text-white">You stay in control.</strong>
          We’ll save your idea first. You’ll review the plan before any video is created.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-orange px-7 text-lg font-extrabold text-ink transition hover:bg-orange-hover disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {loading ? "Saving your idea…" : "Turn this into a video"}
          {!loading && <span aria-hidden>→</span>}
        </button>
      </div>
    </form>
  );
}
