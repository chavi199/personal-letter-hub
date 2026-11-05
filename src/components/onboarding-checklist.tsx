import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CheckCircle2, Circle, ListChecks, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { hasAnyLetterVersion } from "@/lib/api/letter-versions"
import { versionsKey } from "@/hooks/use-letter-versions"
import {
  hideChecklist,
  isChecklistHidden,
} from "@/lib/onboarding"
import type { DbGroup, DbPerson } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface OnboardingChecklistProps {
  groups: DbGroup[]
  people: DbPerson[]
}

export function OnboardingChecklist({ groups, people }: OnboardingChecklistProps) {
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setHidden(isChecklistHidden())
  }, [])

  const { data: hasVersion = false } = useQuery({
    queryKey: versionsKey.any,
    queryFn: hasAnyLetterVersion,
    staleTime: 30_000,
  })

  const hasGroup = groups.length > 0
  const hasPerson = people.length > 0
  const hasLetter = people.some(
    (p) =>
      p.status === "draft" ||
      p.status === "completed" ||
      Boolean(p.letter_content?.trim()),
  )
  const firstPerson = people[0]
  const firstGroup = groups[0]

  const items = [
    {
      id: "group",
      label: "יצירת קבוצה",
      done: hasGroup,
      hint: "מתחילים בקבוצה שמאגדת את האנשים",
      to: "/groups" as const,
      params: undefined,
    },
    {
      id: "person",
      label: "הוספת לפחות אדם אחד",
      done: hasPerson,
      hint: "לכל אדם יהיה מכתב והערות אישיות",
      to: (hasGroup ? "/groups/$groupId" : "/groups") as "/groups" | "/groups/$groupId",
      params: hasGroup && firstGroup ? { groupId: firstGroup.id } : undefined,
    },
    {
      id: "letter",
      label: "כתיבת מכתב ראשון",
      done: hasLetter,
      hint: "טיוטה או מכתב שהושלם — זה נחשב",
      to: (hasPerson ? "/letter/$personId" : hasGroup ? "/groups/$groupId" : "/groups") as
        | "/letter/$personId"
        | "/groups/$groupId"
        | "/groups",
      params: hasPerson && firstPerson
        ? { personId: firstPerson.id }
        : hasGroup && firstGroup
          ? { groupId: firstGroup.id }
          : undefined,
    },
    {
      id: "version",
      label: "שמירת גרסה ראשונה",
      done: hasVersion,
      hint: "שמירת גרסה מאפשרת לנסות ניסוחים ולחזור אחורה",
      to: (hasPerson ? "/letter/$personId" : "/groups") as "/letter/$personId" | "/groups",
      params: hasPerson && firstPerson ? { personId: firstPerson.id } : undefined,
    },
  ]

  const doneCount = items.filter((i) => i.done).length
  const allDone = doneCount === items.length
  const progress = Math.round((doneCount / items.length) * 100)

  if (hidden) return null
  if (allDone) return null

  return (
    <Card className="border-[oklch(0.88_0.04_350)] bg-[oklch(0.98_0.01_350)]/80">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.93_0.05_350)] text-[oklch(0.5_0.14_350)]">
            <ListChecks className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">המסלול הראשון שלך</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              קבוצה → אנשים → מכתב → גרסה. עוד {items.length - doneCount} צעדים.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="הסתר רשימת התקדמות"
          onClick={() => {
            hideChecklist()
            setHidden(true)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <ul className="space-y-2">
          {items.map((item) => {
            const content = (
              <>
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.52_0.12_155)]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      item.done && "text-muted-foreground line-through",
                    )}
                  >
                    {item.label}
                  </div>
                  {!item.done && (
                    <div className="text-xs text-muted-foreground">{item.hint}</div>
                  )}
                </div>
              </>
            )

            if (item.done) {
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2"
                >
                  {content}
                </li>
              )
            }

            if (item.to === "/groups/$groupId" && item.params && "groupId" in item.params) {
              return (
                <li key={item.id}>
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: item.params.groupId }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/60"
                  >
                    {content}
                  </Link>
                </li>
              )
            }

            if (item.to === "/letter/$personId" && item.params && "personId" in item.params) {
              return (
                <li key={item.id}>
                  <Link
                    to="/letter/$personId"
                    params={{ personId: item.params.personId }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/60"
                  >
                    {content}
                  </Link>
                </li>
              )
            }

            return (
              <li key={item.id}>
                <Link
                  to="/groups"
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/60"
                >
                  {content}
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
