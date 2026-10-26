import { useMemo, useState } from "react"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useGroups } from "@/hooks/use-groups"
import { useAllPeople } from "@/hooks/use-people"
import { applyVersionToPeople, type ApplyResult } from "@/lib/api/apply-version"

interface Props {
  open: boolean
  onClose: () => void
  letterContent: string
  sourcePersonId: string
}

type Phase = "select" | "running" | "done"

export function ApplyVersionSheet({ open, onClose, letterContent, sourcePersonId }: Props) {
  const { data: groups = [] } = useGroups()
  const { data: allPeople = [] } = useAllPeople()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<Phase>("select")
  const [results, setResults] = useState<ApplyResult[]>([])

  const peopleByGroup = useMemo(() => {
    const map = new Map<string, typeof allPeople>()
    for (const p of allPeople) {
      if (p.id === sourcePersonId) continue
      if (!map.has(p.group_id)) map.set(p.group_id, [])
      map.get(p.group_id)!.push(p)
    }
    return map
  }, [allPeople, sourcePersonId])

  function togglePerson(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleGroup(groupId: string) {
    const people = peopleByGroup.get(groupId) ?? []
    const allSelected = people.every((p) => selected.has(p.id))
    setSelected((prev) => {
      const next = new Set(prev)
      for (const p of people) allSelected ? next.delete(p.id) : next.add(p.id)
      return next
    })
  }

  async function handleApply() {
    const targets = allPeople
      .filter((p) => selected.has(p.id))
      .map((p) => ({ id: p.id, name: p.name }))

    setPhase("running")
    const res = await applyVersionToPeople(letterContent, targets)
    setResults(res)
    setPhase("done")
  }

  function handleClose() {
    setSelected(new Set())
    setPhase("select")
    setResults([])
    onClose()
  }

  const successCount = results.filter((r) => r.success).length
  const failCount = results.filter((r) => !r.success).length

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="flex w-[420px] flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-base">החל גרסה על אנשים</SheetTitle>
        </SheetHeader>

        {phase === "running" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">מחיל גרסה...</p>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{successCount} הצליחו</span>
              </div>
              {failCount > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{failCount} נכשלו</span>
                </div>
              )}
            </div>
            {failCount > 0 && (
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {results.filter((r) => !r.success).map((r) => (
                    <div key={r.personId} className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                      {r.personName}: {r.error}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <Button onClick={handleClose}>סגור</Button>
          </div>
        )}

        {phase === "select" && (
          <>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {groups.map((group) => {
                  const people = peopleByGroup.get(group.id) ?? []
                  if (people.length === 0) return null
                  const allChecked = people.every((p) => selected.has(p.id))
                  const someChecked = people.some((p) => selected.has(p.id))

                  return (
                    <div key={group.id}>
                      <div
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <Checkbox
                          checked={allChecked}
                          data-state={someChecked && !allChecked ? "indeterminate" : undefined}
                          onCheckedChange={() => toggleGroup(group.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm font-medium">{group.name}</span>
                        <span className="text-xs text-muted-foreground">({people.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5 pr-4">
                        {people.map((person) => (
                          <div
                            key={person.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                            onClick={() => togglePerson(person.id)}
                          >
                            <Checkbox
                              checked={selected.has(person.id)}
                              onCheckedChange={() => togglePerson(person.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm">{person.name}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <Button
                className="w-full"
                disabled={selected.size === 0}
                onClick={handleApply}
              >
                החל על {selected.size > 0 ? `${selected.size} אנשים` : "נבחרים"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
