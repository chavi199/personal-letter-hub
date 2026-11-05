import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Screen-only effects (tilt / fold). Keep false for export targets. */
  interactive?: boolean;
  inkPulse?: boolean;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LivingLetterPaper({
  children,
  className,
  style,
  interactive = true,
  inkPulse = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = prefersReducedMotion();
  const enableTilt = interactive && !isMobile && !reduceMotion;

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        x: +(py * -3).toFixed(2),
        y: +(px * 3).toFixed(2),
      });
    },
    [enableTilt],
  );

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!enableTilt) setTilt({ x: 0, y: 0 });
  }, [enableTilt]);

  return (
    <div
      ref={ref}
      className={cn(
        "living-letter relative overflow-hidden",
        interactive && "living-letter--screen",
        inkPulse && "living-letter--ink",
        className,
      )}
      style={{
        ...style,
        transform: enableTilt
          ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
          : undefined,
        transition: enableTilt ? "transform 180ms ease-out" : undefined,
        willChange: enableTilt ? "transform" : undefined,
      }}
      onMouseMove={enableTilt ? onMove : undefined}
      onMouseLeave={enableTilt ? onLeave : undefined}
    >
      {interactive && <span aria-hidden className="living-letter__fold" />}
      {children}
    </div>
  );
}
