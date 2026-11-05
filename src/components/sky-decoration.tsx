export function SkyDecoration({
  className = "",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const motion = animated ? "sky-motion" : "";

  return (
    <svg
      aria-hidden
      viewBox="0 0 420 260"
      fill="none"
      className={`${motion} ${className}`.trim()}
    >
      {/* Soft stars */}
      <g className="sky-stars" opacity="0.55">
        <circle className="sky-star" cx="48" cy="36" r="1.6" fill="oklch(0.92 0.06 85)" />
        <circle className="sky-star sky-star--slow" cx="118" cy="22" r="1.2" fill="oklch(0.9 0.05 320)" />
        <circle className="sky-star" cx="196" cy="48" r="1.4" fill="oklch(0.93 0.04 230)" />
        <circle className="sky-star sky-star--slow" cx="268" cy="28" r="1.1" fill="oklch(0.92 0.05 350)" />
        <circle className="sky-star" cx="342" cy="42" r="1.5" fill="oklch(0.9 0.06 85)" />
        <circle className="sky-star sky-star--slow" cx="380" cy="70" r="1.2" fill="oklch(0.91 0.04 280)" />
      </g>

      {/* Rainbow arcs */}
      <path
        d="M30 210C30 90 390 90 390 210"
        stroke="oklch(0.8 0.13 25)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M52 210C52 112 368 112 368 210"
        stroke="oklch(0.86 0.13 80)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M74 210C74 132 346 132 346 210"
        stroke="oklch(0.82 0.11 155)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M96 210C96 152 324 152 324 210"
        stroke="oklch(0.78 0.09 220)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M118 210C118 170 302 170 302 210"
        stroke="oklch(0.74 0.11 290)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M140 210C140 186 280 186 280 210"
        stroke="oklch(0.76 0.12 340)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Drifting clouds */}
      <g className="sky-cloud sky-cloud--a">
        <ellipse cx="78" cy="206" rx="58" ry="22" fill="white" fillOpacity="0.92" />
        <ellipse cx="118" cy="198" rx="40" ry="18" fill="white" />
      </g>
      <g className="sky-cloud sky-cloud--b">
        <ellipse cx="330" cy="208" rx="64" ry="24" fill="white" fillOpacity="0.95" />
        <ellipse cx="286" cy="198" rx="36" ry="16" fill="white" />
      </g>
      <g className="sky-cloud sky-cloud--c">
        <ellipse cx="210" cy="214" rx="46" ry="16" fill="white" fillOpacity="0.9" />
      </g>

      {/* Soft petals / leaves */}
      <g className="sky-petals" opacity="0.45">
        <path
          className="sky-petal"
          d="M54 118c10-2 16-10 14-18-9 2-16 9-14 18z"
          fill="oklch(0.78 0.1 350)"
        />
        <path
          className="sky-petal sky-petal--slow"
          d="M360 126c-9-1-15-8-13-15 8 1 14 7 13 15z"
          fill="oklch(0.8 0.1 155)"
        />
        <path
          className="sky-petal"
          d="M188 96c8 0 13-6 12-12-7 1-12 6-12 12z"
          fill="oklch(0.82 0.08 85)"
        />
      </g>
    </svg>
  );
}

/** Full-bleed ambient sky behind app content — very low opacity. */
export function AmbientSky() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <SkyDecoration className="absolute -top-8 start-[-8%] h-[42vh] w-[70vw] max-w-4xl opacity-[0.18]" />
      <SkyDecoration className="absolute bottom-[-10%] end-[-12%] h-[36vh] w-[55vw] max-w-3xl rotate-180 opacity-[0.12]" />
      <div className="ambient-stars absolute inset-0 opacity-40" />
    </div>
  );
}
