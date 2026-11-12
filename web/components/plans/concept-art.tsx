import type { ReactNode } from "react";
import type { ConceptTheme } from "@/lib/lessons/concept-theme";

/**
 * Topic-themed illustration built from project-owned reusable shapes, without characters. Decorative only; it is not a frame of any rendered video.
 */
const SCENES: Record<ConceptTheme, { sky: string; label: string; art: ReactNode }> = {
  SPACE: {
    sky: "from-[#141a46] to-[#2f3a7a]",
    label: "Night sky",
    art: (
      <>
        {[[12, 14], [28, 30], [46, 10], [62, 24], [80, 12], [90, 34], [20, 46], [70, 44]].map(
          ([l, t], i) => (
            <span
              key={i}
              className="absolute size-1.5 rounded-full bg-white"
              style={{ left: `${l}%`, top: `${t}%`, opacity: 0.5 + (i % 3) * 0.2 }}
            />
          ),
        )}
        <div className="absolute right-[12%] top-[12%] size-20 rounded-full bg-[#fff1b8] shadow-[0_0_40px_rgba(255,241,184,.5)]">
          <div className="absolute -right-2 -top-1 size-20 rounded-full bg-[#1f2860]" />
        </div>
        <div className="absolute left-[46%] top-[40%] size-10 rounded-full bg-[#f2a93b]">
          <div className="absolute left-1/2 top-1/2 h-3 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[50%] border-2 border-[#ffd997]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[22%] rounded-t-[50%] bg-[#3b4588]" />
      </>
    ),
  },
  WEATHER: {
    sky: "from-[#9fb8cf] to-[#dbe7f1]",
    label: "Weather",
    art: (
      <>
        <div className="absolute right-[10%] top-[12%] h-12 w-28 rounded-full bg-white">
          <div className="absolute -top-6 left-5 size-14 rounded-full bg-white" />
          <div className="absolute -top-3 left-14 size-11 rounded-full bg-white" />
        </div>
        {[16, 22, 28, 20, 26].map((top, i) => (
          <span
            key={i}
            className="absolute h-4 w-1.5 rounded-full bg-[#5b8def]"
            style={{ right: `${14 + i * 5}%`, top: `${top + 12}%` }}
          />
        ))}
        <div className="absolute left-[36%] top-[30%] size-36 rounded-full border-[10px] border-[#e5735a] [clip-path:inset(0_0_50%_0)]">
          <div className="absolute inset-0 rounded-full border-[10px] border-[#f2a93b]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#7dc251]" />
      </>
    ),
  },
  HYGIENE: {
    sky: "from-[#cfeefb] to-[#f1fbff]",
    label: "Healthy habits",
    art: (
      <>
        {[[52, 18, 14], [70, 10, 20], [84, 30, 12], [62, 40, 10], [44, 34, 8]].map(
          ([l, t, s], i) => (
            <span
              key={i}
              className="absolute rounded-full border-2 border-white bg-white/40"
              style={{ left: `${l}%`, top: `${t}%`, width: `${s * 4}px`, height: `${s * 4}px` }}
            />
          ),
        )}
        <div className="absolute bottom-[26%] right-[14%] h-12 w-24 rounded-2xl bg-[#f7a6c1]" />
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#bfe0ee]" />
      </>
    ),
  },
  PLANTS: {
    sky: "from-[#bfe4f6] to-[#e3f3fb]",
    label: "Nature",
    art: (
      <>
        <div className="absolute right-[10%] top-[10%] size-14 rounded-full bg-[#ffd65a]" />
        <div className="absolute bottom-[24%] right-[26%] h-32 w-2 bg-[#3f8a3a]" />
        <div className="absolute bottom-[42%] right-[27%] h-8 w-14 -rotate-12 rounded-[50%_0] bg-[#5ca63d]" />
        <div className="absolute bottom-[34%] right-[20%] h-8 w-14 rotate-12 rounded-[0_50%] bg-[#5ca63d]" />
        <div className="absolute bottom-[56%] right-[24.4%] size-10 rounded-full bg-[#e5735a] ring-8 ring-[#ffb3a1]" />
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#8b5a3c]" />
      </>
    ),
  },
  ANIMALS: {
    sky: "from-[#bfe4f6] to-[#e3f3fb]",
    label: "Animals",
    art: (
      <>
        <div className="absolute right-[10%] top-[10%] size-12 rounded-full bg-[#ffd65a]" />
        {[[58, 24], [70, 16], [82, 28]].map(([l, t], i) => (
          <span key={i} className="absolute h-3 w-7 rounded-t-full border-t-[3px] border-ink/60" style={{ left: `${l}%`, top: `${t}%` }} />
        ))}
        <div className="absolute -right-12 bottom-[16%] h-32 w-64 rounded-[50%] bg-[#7dc251]" />
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#6fb546]" />
      </>
    ),
  },
  WATER: {
    sky: "from-[#bfe4f6] to-[#e3f3fb]",
    label: "Water",
    art: (
      <>
        <div className="absolute right-[10%] top-[10%] size-12 rounded-full bg-[#ffd65a]" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#4fa3d9]" />
        <div className="absolute inset-x-0 bottom-[30%] h-6 bg-[radial-gradient(circle_at_12px_0,transparent_12px,#4fa3d9_13px)] bg-[length:24px_24px]" />
        <div className="absolute bottom-[14%] right-[18%] h-6 w-20 rounded-b-full bg-[#e5735a]" />
      </>
    ),
  },
  LETTERS: {
    sky: "from-[#fff4dc] to-[#fffaf0]",
    label: "Words",
    art: (
      <>
        {[
          ["A", "bg-[#e5735a]", 22, 22, -8],
          ["b", "bg-[#5b8def]", 42, 36, 6],
          ["C", "bg-green", 62, 18, -4],
        ].map(([ch, bg, l, t, r]) => (
          <span
            key={ch as string}
            className={`display absolute flex size-14 items-center justify-center rounded-2xl text-3xl text-white shadow-md ${bg}`}
            style={{ left: `${l}%`, top: `${t}%`, rotate: `${r}deg` }}
          >
            {ch}
          </span>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#f2dfb8]" />
      </>
    ),
  },
  MATHS: {
    sky: "from-[#fff4dc] to-[#fffaf0]",
    label: "Numbers",
    art: (
      <>
        {[
          ["1", "bg-[#e5735a]", 22, 26],
          ["2", "bg-orange", 42, 14],
          ["3", "bg-green", 62, 28],
        ].map(([n, bg, l, t]) => (
          <span
            key={n}
            className={`display absolute flex size-14 items-center justify-center rounded-2xl text-3xl text-white shadow-md ${bg}`}
            style={{ left: `${l}%`, top: `${t}%` }}
          >
            {n}
          </span>
        ))}
        <span className="display absolute left-[36%] top-[52%] text-4xl text-ink/30">+ ×</span>
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#f2dfb8]" />
      </>
    ),
  },
  DEFAULT: {
    sky: "from-[#bfe4f6] to-[#e3f3fb]",
    label: "Learning",
    art: (
      <>
        <div className="absolute right-[9%] top-[10%] size-14 rounded-full bg-[#ffd65a]" />
        <div className="absolute -right-12 bottom-[16%] h-32 w-64 rounded-[50%] bg-[#7dc251]" />
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#6fb546]" />
      </>
    ),
  },
};

export function ConceptArt({ theme }: { theme: ConceptTheme }) {
  const scene = SCENES[theme];
  return (
    <div
      role="img"
      aria-label={`${scene.label} illustration`}
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-gradient-to-b ${scene.sky}`}
    >
      {scene.art}
      <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white">
        {scene.label} · illustration, not a video
      </span>
    </div>
  );
}
