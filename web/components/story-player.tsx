"use client";

import { useState } from "react";
import { LessonArt } from "./lesson-art";

const scenes = [
  {
    title: "Meet Ria",
    purpose: "Set up the story",
    narration: "This is Ria the rabbit. She has carrots to share with her friends.",
    why: "One friendly character stays exactly the same in every scene.",
  },
  {
    title: "Three baskets",
    purpose: "Make the groups visible",
    narration: "Ria puts out three baskets.",
    why: "Wide gaps make three separate groups easy to see.",
  },
  {
    title: "Two in each",
    purpose: "Show equal groups",
    narration: "She puts two carrots in each basket.",
    why: "Each carrot is placed from the lesson’s numbers, never guessed.",
  },
  {
    title: "Add them up",
    purpose: "Connect to repeated addition",
    narration: "Two, plus two, plus two, makes six.",
    why: "Repeated addition comes first, so the new symbol has meaning.",
  },
  {
    title: "Multiply",
    purpose: "Name the operation",
    narration: "Three groups of two make six. Three times two is six!",
    why: "The recap ties the × sign back to the baskets.",
  },
];

export function StoryPlayer() {
  const [index, setIndex] = useState(4);
  const scene = scenes[index];
  return (
    <div className="grid min-w-0 items-start gap-7 lg:grid-cols-[1.65fr_1fr] lg:gap-10">
      <div className="min-w-0">
        <LessonArt scene={index + 1} className="lesson-shadow" />
        <div className="mt-3.5 flex max-w-full gap-2 overflow-x-auto pb-2">
          {scenes.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={`min-h-[58px] min-w-[132px] flex-1 rounded-xl border p-2.5 text-left text-sm font-semibold leading-tight ${i === index ? "border-white bg-white text-ink" : "border-white/15 bg-white/5 text-[#dddaea] hover:bg-white/10"}`}
            >
              <span
                className={`mb-1 block text-[11px] tracking-wider ${i === index ? "text-[#8f5400]" : "text-[#a8a5c0]"}`}
              >
                SCENE {i + 1}
              </span>
              {s.title}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-[#b9b6cc]">
          Illustrated preview. Real lessons are narrated in the chosen language.
        </p>
      </div>
      <aside
        className="rounded-[20px] border border-white/10 bg-[#1d2150] p-5 sm:p-7"
        aria-live="polite"
      >
        <p className="text-xs font-bold uppercase tracking-[.09em] text-orange">
          Scene {index + 1} of 5 · {scene.title}
        </p>
        <h3 className="display mt-2 text-[clamp(28px,3vw,38px)] font-medium leading-tight text-white">
          {scene.purpose}
        </h3>
        <div className="mt-4 border-t border-white/10 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a8a5c0]">Narration</p>
          <p className="display mt-1 text-xl font-medium text-white">“{scene.narration}”</p>
        </div>
        <div className="border-t border-white/10 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a8a5c0]">Why it works</p>
          <p className="mt-1 text-[#eeebf6]">{scene.why}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          {[
            [3, "groups"],
            [2, "in each"],
            [6, "in total"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-white/7 p-2.5">
              <b className="block text-2xl text-white">{n}</b>
              <span className="text-xs text-[#c7c4d8]">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            disabled={index === 0}
            onClick={() => setIndex((v) => v - 1)}
            className="min-h-11 flex-1 rounded-xl border border-white/30 text-sm font-semibold text-white disabled:opacity-35"
          >
            Previous
          </button>
          <button
            disabled={index === 4}
            onClick={() => setIndex((v) => v + 1)}
            className="min-h-11 flex-1 rounded-xl bg-white text-sm font-semibold text-ink disabled:opacity-35"
          >
            Next scene
          </button>
        </div>
      </aside>
    </div>
  );
}
