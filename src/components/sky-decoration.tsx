export function SkyDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 260"
      fill="none"
      className={className}
    >
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
      <ellipse cx="78" cy="206" rx="58" ry="22" fill="white" fillOpacity="0.92" />
      <ellipse cx="118" cy="198" rx="40" ry="18" fill="white" />
      <ellipse cx="330" cy="208" rx="64" ry="24" fill="white" fillOpacity="0.95" />
      <ellipse cx="286" cy="198" rx="36" ry="16" fill="white" />
      <ellipse cx="210" cy="214" rx="46" ry="16" fill="white" fillOpacity="0.9" />
    </svg>
  );
}
