import { Header } from "@/components/header";
import { ArrowRight, Check, LogoMark } from "@/components/icons";
import { LessonArt } from "@/components/lesson-art";
import { StoryPlayer } from "@/components/story-player";

const wrap = "mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12";
const eyebrow = "text-[13px] font-bold uppercase tracking-[.09em] text-ink-2";
const heading = "display mt-3 text-[clamp(36px,4.4vw,62px)] font-medium text-ink";
const button =
  "inline-flex min-h-[50px] items-center justify-center rounded-xl bg-ink px-6 text-[16.5px] font-semibold text-white transition hover:-translate-y-px hover:bg-ink-hover";

function SectionHeading({
  label,
  title,
  children,
  dark = false,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-10 grid items-end gap-5 md:grid-cols-[1.15fr_1fr] lg:mb-[60px] lg:gap-16">
      <div>
        <p className={`${eyebrow} ${dark ? "!text-orange" : ""}`}>{label}</p>
        <h2 className={`${heading} ${dark ? "!text-white" : ""}`}>{title}</h2>
      </div>
      <p className={`m-0 max-w-[50ch] ${dark ? "text-[#c7c4d8]" : "text-ink-2"}`}>{children}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[30px] items-center rounded-lg border border-line bg-paper px-2.5 text-[13.5px] font-semibold">
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section id="top" className="body-grid py-12 lg:py-20">
      <div className={wrap}>
        <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <p className={eyebrow}>For parents and teachers · Nursery to Class 4</p>
            <h1 className="display mt-4 text-[clamp(48px,6.6vw,96px)] font-medium">
              Turn lessons into{" "}
              <span className="relative italic after:absolute after:inset-x-0 after:bottom-[.06em] after:-z-0 after:h-[.11em] after:bg-orange">
                <span className="relative z-10">stories</span>
              </span>{" "}
              children understand.
            </h1>
          </div>
          <div>
            <p className="mb-6 text-[clamp(17px,1.45vw,19.5px)] text-ink-2">
              Describe what a child needs to learn. Edupilo drafts an illustrated story and
              storyboard,{" "}
              <strong className="font-semibold text-ink">you review and approve every scene</strong>
              , and it becomes a short animated lesson in English or Hindi.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a href="/signup" className={button}>
                Get Started
              </a>
              <a href="#how" className="flex min-h-11 items-center gap-2 font-semibold">
                See how it works <ArrowRight className="size-[18px]" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 grid min-w-0 items-start gap-6 lg:grid-cols-[.82fr_1.18fr]">
          <div className="flex min-w-0 flex-col gap-4">
            <article className="soft-shadow rounded-[18px] border border-line bg-white p-5">
              <p className={`${eyebrow} mb-3 flex items-center gap-2`}>
                <span className="flex size-6 items-center justify-center rounded-full bg-ink text-xs text-white">
                  1
                </span>
                You describe
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Chip>Class&nbsp; 2</Chip>
                <Chip>Subject&nbsp; Maths</Chip>
                <Chip>Topic&nbsp; Multiplication</Chip>
                <Chip>English</Chip>
              </div>
              <p className="display my-4 text-[clamp(22px,2.15vw,28px)] font-medium leading-tight">
                “Explain 3 × 2 using a rabbit and carrots.”
              </p>
              <p className="text-sm text-[#61657f]">◇ No child’s name or photo required.</p>
            </article>
            <article className="soft-shadow rounded-[18px] border border-line bg-white p-5">
              <p className={`${eyebrow} mb-3 flex items-center gap-2`}>
                <span className="flex size-6 items-center justify-center rounded-full bg-ink text-xs text-white">
                  2
                </span>
                You review{" "}
                <span className="ml-auto rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] normal-case tracking-normal">
                  Drafted by Edupilo
                </span>
              </p>
              <div className="flex items-baseline justify-between">
                <b className="text-[15.5px]">Ria and the Carrot Baskets</b>
                <span className="text-xs text-[#61657f]">5 scenes</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n}>
                    <LessonArt scene={n} className="!rounded-md" />
                    <p className="mt-1 text-[10px] font-bold">
                      {n}{" "}
                      <span className="hidden sm:inline">
                        {["Meet Ria", "Baskets", "Two each", "Add", "Multiply"][n - 1]}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper p-2.5 text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#61657f]">
                  Facts
                </span>
                <b>3 groups × 2 carrots = 6</b>
                <span className="ml-auto flex items-center gap-1 font-bold text-green">
                  <Check className="size-4" />
                  Checked in code
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 rounded-full border border-green/25 bg-mint px-3 py-1 text-sm font-bold text-green">
                  <Check className="size-4" />
                  Approved by you
                </span>
                <span className="text-xs text-[#61657f]">Nothing is animated before this.</span>
              </div>
            </article>
          </div>
          <div className="min-w-0">
            <p className={`${eyebrow} mb-3 flex items-center gap-2`}>
              <span className="flex size-6 items-center justify-center rounded-full bg-ink text-xs text-white">
                3
              </span>
              Your child watches
            </p>
            <LessonArt animated className="lesson-shadow" />
            <p className="mt-3 text-sm text-[#61657f]">
              ⓘ Illustrated preview of a planned lesson, not AI-generated output.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  [
    "You",
    "Describe the lesson",
    "Pick the class, subject and topic, choose English or Hindi, and say how you’d like it explained.",
  ],
  [
    "Edupilo",
    "Get a story and storyboard",
    "One plan holds the narration, every scene and exact numbers, so words and pictures always agree.",
  ],
  [
    "You",
    "Review and approve",
    "Read the script and scenes together. Ask for changes, or approve when it’s right for your child or class.",
  ],
  [
    "Edupilo",
    "Watch it come to life",
    "Narration, illustration, captions and counting come together as a short video for your child or class.",
  ],
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-[clamp(68px,8.5vw,120px)]">
      <div className={wrap}>
        <SectionHeading
          label="How it works"
          title="From one sentence to a story, with you in charge."
        >
          Edupilo does the scriptwriting, illustration and animation. You make the educational
          decisions: what to teach, how it’s explained, and whether it’s right.
        </SectionHeading>
        <div className="grid gap-9 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map(([who, title, copy], i) => (
            <article
              key={title}
              className={`border-t pt-5 ${i === 2 ? "border-t-4 border-green" : "border-ink"}`}
            >
              <div className="flex items-center justify-between">
                <span className="display text-6xl font-light">{i + 1}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${who === "You" ? "bg-ink text-white" : "border border-line bg-white"}`}
                >
                  {who}
                </span>
              </div>
              <h3 className="display mt-5 text-2xl font-medium leading-tight">{title}</h3>
              <p className="mt-2 text-base text-ink-2">{copy}</p>
              {i === 2 && (
                <p className="mt-4 flex items-center gap-1 text-xs font-bold text-green">
                  ▣ Nothing is animated until you approve
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Example() {
  return (
    <section id="lesson" className="scroll-mt-20 bg-ink py-[clamp(68px,8.5vw,120px)] text-white">
      <div className={wrap}>
        <SectionHeading
          dark
          label="Example lesson · Class 2 Maths"
          title="Three baskets. Two carrots in each. One idea that clicks."
        >
          Step through the storyboard. Every carrot, basket and number comes from the lesson’s
          facts, so what a child sees always matches what they hear.
        </SectionHeading>
        <StoryPlayer />
      </div>
    </section>
  );
}

const roleData = [
  [
    "For parents",
    "When the textbook explanation isn’t landing.",
    "Explain it the way your child already thinks: a favourite animal, a snack, a game. You get a short story you’ve checked yourself.",
    [
      "You approve every scene before anything is animated.",
      "Counts and equations are calculated, never guessed.",
      "Adults hold the account. Children never need one.",
    ],
  ],
  [
    "For teachers",
    "A visual explanation for the whole class.",
    "Turn this week’s topic into a short story pitched at your class level, ready to play on the classroom screen.",
    [
      "Vocabulary, pacing and captions match the class.",
      "Large, uncluttered labels read from the back of the room.",
      "Not tied to any one board. You decide how it fits.",
    ],
  ],
] as const;

function Adults() {
  return (
    <section id="adults" className="scroll-mt-20 bg-paper py-[clamp(68px,8.5vw,120px)]">
      <div className={wrap}>
        <SectionHeading label="For parents & teachers" title="Made for the adult in charge.">
          AI drafts the lesson. You stay the expert on the child in front of you, and nothing
          reaches them without your approval.
        </SectionHeading>
        <div className="grid gap-5 md:grid-cols-2">
          {roleData.map(([label, title, copy, ticks]) => (
            <article key={label} className="rounded-[22px] border border-line bg-white p-6 lg:p-9">
              <p className={`${eyebrow} !text-[#8f5400]`}>{label}</p>
              <h3 className="display mt-3 text-[clamp(26px,2.4vw,33px)] font-medium leading-tight">
                {title}
              </h3>
              <p className="mt-3 text-ink-2">{copy}</p>
              <ul className="mt-5">
                {ticks.map((t) => (
                  <li
                    key={t}
                    className="flex gap-3 border-t border-[#e7e5ee] py-3 font-medium leading-snug"
                  >
                    <Check className="mt-1 size-5 shrink-0 text-green" />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <article className="rounded-[22px] bg-ink p-6 text-white lg:p-9">
            <p className={`${eyebrow} !text-orange`}>Two languages</p>
            <div className="my-4 flex flex-wrap items-baseline gap-7">
              <span className="display text-[clamp(44px,4.6vw,64px)]">English</span>
              <span
                lang="hi"
                className="font-[var(--font-hindi)] text-[clamp(46px,4.9vw,68px)] text-orange"
              >
                हिन्दी
              </span>
            </div>
            <p className="text-[#c7c4d8]">
              Choose the language for each lesson. Script, narration and captions stay in that
              language from start to finish.
            </p>
          </article>
          <article className="rounded-[22px] border border-line bg-white p-6 lg:p-9">
            <p className={eyebrow}>Captions that grow with the child</p>
            <div className="mt-4 space-y-3">
              <div className="grid items-center gap-2 sm:grid-cols-[120px_1fr]">
                <b className="text-sm">
                  Nursery & KG
                  <span className="block font-normal text-[#61657f]">Single keywords</span>
                </b>
                <div className="rounded-xl bg-[#bfe4f6] p-4 text-center">
                  <span className="rounded-lg bg-white px-4 py-2 text-xl font-extrabold">
                    carrots
                  </span>
                </div>
              </div>
              <div className="grid items-center gap-2 sm:grid-cols-[120px_1fr]">
                <b className="text-sm">
                  Classes 1–4<span className="block font-normal text-[#61657f]">Short phrases</span>
                </b>
                <div className="rounded-xl bg-[#bfe4f6] p-4 text-center">
                  <span className="rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white">
                    two carrots in each basket
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <>
      <section id="get-started" className="scroll-mt-20 py-[clamp(68px,8.5vw,120px)]">
        <div className={`${wrap} grid items-end gap-8 md:grid-cols-[1.25fr_1fr] lg:gap-16`}>
          <div>
            <p className={eyebrow}>Get started</p>
            <h2 className="display mt-3 text-[clamp(42px,5.8vw,84px)] font-medium">
              Which lesson needs a <span className="italic">story</span>?
            </h2>
          </div>
          <div className="rounded-[20px] border border-line bg-paper p-6">
            <p className="font-bold">
              <span className="mr-2 inline-block size-2.5 rounded-full bg-orange" />
              Create your adult account
            </p>
            <p className="mt-2 text-ink-2">
              Sign up as a parent or teacher. Child accounts and personal child details are not
              required.
            </p>
            <a href="/signup" className={`${button} mt-5`}>
              Create an account
            </a>
          </div>
        </div>
      </section>
      <footer className="border-t border-line bg-paper py-7">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-4`}>
          <a href="#top" className="flex items-center gap-2">
            <LogoMark className="h-6 w-8" />
            <span className="display text-2xl font-semibold">edupilo</span>
          </a>
          <span className="display text-lg italic text-ink-2">Learning Comes to Life</span>
          <p className="text-sm text-[#61657f]">
            © 2026 Edupilo · Illustrations are design previews.
          </p>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Example />
        <Adults />
        <Closing />
      </main>
    </>
  );
}
