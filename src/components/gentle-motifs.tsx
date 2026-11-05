function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="oklch(0.78 0.12 10)">
      <path d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.2 9 6.2c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.8 4 4.6C19 15.6 12 20 12 20z" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="oklch(0.86 0.12 85)">
      <path d="M12 2.6 14.4 9H21l-5.3 3.8 2 6.4L12 15.8 6.3 19.2l2-6.4L3 9h6.6L12 2.6z" />
    </svg>
  );
}

function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="oklch(0.75 0.1 300)">
      <path d="M12 1.5 13.4 8 20 9.5 13.4 11 12 17.5 10.6 11 4 9.5 10.6 8 12 1.5z" />
    </svg>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="oklch(0.78 0.1 155)">
      <path d="M5 19c8 1 13-4 14-13-8 1-13 6-14 13z" />
      <path d="M8 16c2-2 5-4 8-6" stroke="oklch(0.96 0.02 150)" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

const pieces = [
  { Icon: Heart, className: "start-[8%] top-28 h-9 w-9 -rotate-12 opacity-70" },
  { Icon: Star, className: "end-[6%] top-36 h-7 w-7 rotate-12 opacity-80" },
  { Icon: Spark, className: "start-[22%] top-[46%] h-5 w-5 opacity-60" },
  { Icon: Leaf, className: "end-[14%] top-[58%] h-10 w-10 -rotate-6 opacity-55" },
  { Icon: Heart, className: "end-[28%] bottom-16 h-6 w-6 rotate-6 opacity-50" },
  { Icon: Star, className: "start-[12%] bottom-24 h-5 w-5 opacity-60" },
  { Icon: Spark, className: "end-[10%] bottom-40 h-4 w-4 opacity-70" },
];

export function GentleMotifs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {pieces.map(({ Icon, className }, index) => (
        <Icon key={index} className={`absolute ${className}`} />
      ))}
    </div>
  );
}
