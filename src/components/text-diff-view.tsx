import { countDiffChanges, type DiffPart } from "@/lib/text-diff"
import { cn } from "@/lib/utils"

type Props = {
  parts: DiffPart[]
  className?: string
}

export function TextDiffView({ parts, className }: Props) {
  const { added, removed } = countDiffChanges(parts)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          <span className="ms-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/70 align-middle" />
          הוספות ({added})
        </span>
        <span>
          <span className="ms-1 inline-block h-2.5 w-2.5 rounded-sm bg-rose-500/70 align-middle" />
          מחיקות ({removed})
        </span>
      </div>
      <div
        dir="rtl"
        className="rounded-xl border bg-background/80 p-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={{ wordBreak: "break-word" }}
      >
        {parts.length === 0 ? (
          <span className="text-muted-foreground">(אין טקסט)</span>
        ) : (
          parts.map((part, index) => {
            if (part.type === "equal") {
              return <span key={index}>{part.text}</span>
            }
            if (part.type === "add") {
              return (
                <mark
                  key={index}
                  className="rounded-sm bg-emerald-500/25 text-foreground dark:bg-emerald-400/25"
                >
                  {part.text}
                </mark>
              )
            }
            return (
              <mark
                key={index}
                className="rounded-sm bg-rose-500/25 text-foreground line-through decoration-rose-600/70 dark:bg-rose-400/25"
              >
                {part.text}
              </mark>
            )
          })
        )}
      </div>
    </div>
  )
}
