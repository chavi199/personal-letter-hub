import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PIECES = [
  { left: "12%", delay: "0ms", color: "oklch(0.72 0.16 350)", rotate: "-18deg" },
  { left: "28%", delay: "40ms", color: "oklch(0.78 0.14 85)", rotate: "12deg" },
  { left: "44%", delay: "80ms", color: "oklch(0.74 0.12 230)", rotate: "-8deg" },
  { left: "60%", delay: "30ms", color: "oklch(0.76 0.12 155)", rotate: "16deg" },
  { left: "76%", delay: "60ms", color: "oklch(0.7 0.14 300)", rotate: "-12deg" },
  { left: "88%", delay: "20ms", color: "oklch(0.72 0.14 25)", rotate: "10deg" },
];

export function SoftConfetti({
  active,
  className,
  onDone,
}: {
  active: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDoneRef.current?.();
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      onDoneRef.current?.();
    }, 900);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!show) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="soft-confetti__piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            background: piece.color,
            ["--spin" as string]: piece.rotate,
          }}
        />
      ))}
    </div>
  );
}
