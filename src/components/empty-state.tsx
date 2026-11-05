import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed bg-card/70", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center text-center",
          compact ? "px-4 py-8" : "px-6 py-12",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.93_0.05_350)] text-[oklch(0.5_0.14_350)]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
