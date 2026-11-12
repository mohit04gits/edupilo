type LessonArtProps = {
  scene?: number;
  animated?: boolean;
  className?: string;
};

export function LessonArt({ scene = 5, animated = false, className = "" }: LessonArtProps) {
  const baskets = scene >= 2;
  const carrots = scene >= 3;
  return (
    <div
      role="img"
      aria-label="Ria the rabbit beside three baskets with two carrots in each"
      className={`relative aspect-video w-full min-w-0 max-w-full overflow-hidden rounded-[20px] bg-[#bfe4f6] ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 h-[31%] bg-[#7dc251]" />
      <div className="absolute -left-8 bottom-[22%] size-28 rounded-full bg-[#5ca63d] opacity-50" />
      <div className="absolute right-[8%] top-[11%] size-12 rounded-full bg-[#ffd65a]" />
      <img
        src="/assets/rabbit.svg"
        alt=""
        className={`absolute bottom-[12%] left-[4%] h-[57%] w-auto ${animated ? "rabbit-float" : ""}`}
      />
      {baskets &&
        [38, 58, 78].map((left, i) => (
          <div
            key={left}
            className="absolute bottom-[13%] h-[23%] w-[17%]"
            style={{ left: `${left}%` }}
          >
            {carrots && (
              <>
                <img
                  src="/assets/carrot.svg"
                  alt=""
                  className="absolute bottom-[46%] left-[24%] h-[62%] rotate-[-8deg]"
                />
                <img
                  src="/assets/carrot.svg"
                  alt=""
                  className="absolute bottom-[46%] right-[20%] h-[62%] rotate-[8deg]"
                />
              </>
            )}
            <img src="/assets/basket.svg" alt="" className="absolute inset-x-0 bottom-0 w-full" />
            {scene >= 3 && (
              <span className="absolute -bottom-7 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-white">
                2
              </span>
            )}
          </div>
        ))}
      {scene >= 4 && (
        <div className="display absolute left-1/2 top-[10%] -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-4 py-2 text-[clamp(16px,4vw,42px)] font-semibold shadow-md">
          2 + 2 + 2 = 6
        </div>
      )}
      {scene >= 5 && (
        <div className="display absolute left-1/2 top-[30%] -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-4 py-2 text-[clamp(15px,3.5vw,36px)] font-semibold text-white">
          3 <span className="text-orange">×</span> 2 = 6
        </div>
      )}
    </div>
  );
}
