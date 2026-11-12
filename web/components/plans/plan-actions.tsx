"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoryboardVersion } from "@/lib/domain";
import { NETWORK_ERROR_MESSAGE, readApiResponse } from "@/lib/http/client";
import { alertError } from "@/components/ui/styles";

type Busy = "generate" | "approve" | null;

function Writing() {
  return (
    <div role="status" className="rounded-[24px] bg-ink p-8 text-center text-white">
      <div aria-hidden className="mx-auto flex w-fit gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-3 animate-bounce rounded-full bg-orange"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="display mt-5 text-3xl">Writing your story…</p>
      <p className="mt-2 text-white/70">
        Picking the clearest way to explain it and checking it’s right for this age. This
        usually takes under a minute.
      </p>
    </div>
  );
}

export function PlanActions({
  projectId,
  plan,
}: {
  projectId: string;
  plan: StoryboardVersion | null;
}) {
  const router = useRouter();
  const [revision, setRevision] = useState("");
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");

  async function call(kind: Exclude<Busy, null>, url: string, body?: object) {
    setBusy(kind);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const result = await readApiResponse<{ plan: StoryboardVersion }>(response);
      if (!result.ok) return setError(result.message);
      setRevision("");
      setChanging(false);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setBusy(null);
    }
  }

  const generate = () =>
    call(
      "generate",
      `/api/lesson-projects/${projectId}/plans`,
      revision.trim() ? { revisionRequest: revision } : {},
    );
  const approve = () =>
    plan && call("approve", `/api/lesson-projects/${projectId}/plans/${plan.id}/approve`);

  if (busy === "generate") return <Writing />;

  if (!plan) {
    return (
      <div className="rounded-[24px] bg-ink p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
        <div>
          <p className="display text-3xl">Ready when you are</p>
          <p className="mt-2 text-white/70">
            We’ll write the scenes and narration first. You’ll see everything before any video
            is made.
          </p>
        </div>
        <button
          onClick={generate}
          className="mt-5 min-h-12 shrink-0 whitespace-nowrap rounded-xl bg-orange px-7 text-lg font-extrabold text-ink hover:bg-orange-hover sm:mt-0"
        >
          Make my video →
        </button>
        {error && <p role="alert" className="mt-4 w-full text-sm text-red-200">{error}</p>}
      </div>
    );
  }

  if (plan.status === "APPROVED") {
    return (
      <div className="flex flex-col gap-4 rounded-[24px] bg-green p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-green"
        >
          ✓
        </span>
        <div>
          <p className="display text-3xl">Concept approved</p>
          <p className="mt-1 text-white/80">
            Video creation isn’t switched on in Edupilo yet. When it is, we’ll make the video from
            exactly this approved concept. Nothing will change without you.
          </p>
        </div>
      </div>
    );
  }

  const approvable =
    plan.status === "REVIEW_READY" &&
    plan.validation.deterministicValid &&
    plan.validation.semanticDisposition !== "BLOCK";

  return (
    <section className="rounded-[24px] bg-ink p-6 text-white sm:p-8">
      <p className="display text-3xl">
        {approvable ? "Does this feel right for your child?" : "Let’s improve this one"}
      </p>
      <p className="mt-2 text-white/70">
        {approvable
          ? "You’re in control. Edit the idea in your own words, or approve this concept."
          : "Our check found something that isn’t right for a child yet. Tell us what to change, or try again."}
      </p>

      {changing || !approvable ? (
        <label className="mt-5 block">
          <span className="text-sm font-bold text-white/80">What would you like to change?</span>
          <textarea
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus={changing}
            className="mt-2 w-full rounded-xl border border-white/20 bg-white p-3 text-ink outline-none focus:ring-4 focus:ring-orange/40"
            placeholder="For example: make it shorter, use animals, or explain it with pictures instead of a story."
          />
        </label>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {approvable && (
          <button
            onClick={approve}
            disabled={!!busy}
            className="min-h-12 rounded-xl bg-orange px-6 font-extrabold text-ink transition hover:bg-orange-hover disabled:opacity-60"
          >
            {busy === "approve" ? "Approving…" : "Approve & Create Video"}
          </button>
        )}
        {changing || !approvable ? (
          <button
            onClick={generate}
            disabled={!!busy || (revision.trim().length > 0 && revision.trim().length < 5)}
            className="min-h-12 rounded-xl border border-white/30 px-6 font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {revision.trim() ? "Update concept" : "Try again"}
          </button>
        ) : (
          <button
            onClick={() => setChanging(true)}
            className="min-h-12 rounded-xl border border-white/30 px-6 font-bold text-white transition hover:bg-white/10"
          >
            Edit idea
          </button>
        )}
      </div>
      {approvable && (
        <p className="mt-4 text-sm text-white/60">
          Approving saves this concept. Video creation is coming soon, so no video will be made
          yet.
        </p>
      )}
      {error && <p role="alert" className={`mt-4 ${alertError}`}>{error}</p>}
    </section>
  );
}
