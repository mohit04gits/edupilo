import { Brand } from "../brand";
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="body-grid min-h-screen px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex">
          <Brand href="/" label="Edupilo home" />
        </div>
        <div className="mt-8 grid overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_35px_90px_-45px_rgb(21_24_58/.45)] lg:grid-cols-[1.05fr_.95fr]">
          <section className="relative hidden min-h-[650px] overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-16 -top-16 size-52 rounded-full bg-orange/90" />
            <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-green" />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-sun">
                Made for grown-ups who help children learn
              </p>
              <h2 className="display mt-5 max-w-xl text-6xl leading-[.95]">
                A difficult lesson can become a story.
              </h2>
              <p className="mt-6 max-w-md text-lg text-white/75">
                Create age-appropriate illustrated explanations in English or Hindi—and review every
                scene before anything is generated.
              </p>
            </div>
            <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="font-bold text-sun">Adult-operated by design</p>
              <p className="mt-1 text-sm text-white/75">
                No child account, photo, voice or school information is required.
              </p>
            </div>
          </section>
          <section className="p-6 sm:p-10 lg:p-14">
            <p className="text-sm font-extrabold uppercase tracking-[.15em] text-green">
              {eyebrow}
            </p>
            <h1 className="display mt-3 text-[clamp(42px,5vw,64px)] font-medium">{title}</h1>
            <p className="mt-4 text-ink-2">{description}</p>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
