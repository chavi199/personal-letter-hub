"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { SoftConfetti } from "@/components/soft-confetti";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const pct = value || 0;
  const complete = pct >= 100;
  const [celebrate, setCelebrate] = React.useState(false);
  const prev = React.useRef(pct);

  React.useEffect(() => {
    if (pct >= 100 && prev.current < 100) {
      setCelebrate(true);
    }
    prev.current = pct;
  }, [pct]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        complete && "progress-complete",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="rainbow-fill progress-indicator h-full"
        style={{ width: `${pct}%` }}
      />
      <SoftConfetti active={celebrate} onDone={() => setCelebrate(false)} />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
