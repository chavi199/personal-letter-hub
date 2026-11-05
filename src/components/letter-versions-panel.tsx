import { useMemo, useState } from "react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Copy, GitCompareArrows, RotateCcw, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { LetterDecor } from "@/components/letter-decor"
import { TextDiffView } from "@/components/text-diff-view"
import { useLetterVersions, useSaveVersion, useDeleteVersion, useUpdateVersion } from "@/hooks/use-letter-versions"
import { ApplyVersionSheet } from "@/components/apply-version-sheet"
import { summarizeDesignDiff } from "@/lib/design-diff"
import { diffTexts } from "@/lib/text-diff"
import type { DbLetterVersion } from "@/lib/supabase"
import {
  fontStack,
  getDesignBorderStyle,
  hasLetterDesign,
  normalizeDesign,
  sizeStyle,
  themeLabel,
  type LetterDesignConfig,
} from "@/lib/design-themes"

interface Props {
  open: boolean
  onClose: () => void
  personId: string
  currentContent: string
  designConfig: LetterDesignConfig
  onRestore: (content: string, designConfig?: LetterDesignConfig | null) => void
}

const CURRENT_KEY = "current"

export function LetterVersionsPanel({
  open,
  onClose,
  personId,
  currentContent,
  designConfig,
  onRestore,
}: Props) {
  const { data: versions = [], isLoading } = useLetterVersions(personId)
  const saveVersion = useSaveVersion(personId)
  const deleteVersion = useDeleteVersion(personId)
  const updateVersion = useUpdateVersion(personId)
  const [preview, setPreview] = useState<DbLetterVersion | null>(null)
  const [applyVersion, setApplyVersion] = useState<DbLetterVersion | null>(null)
  const [versionName, setVersionName] = useState("")
  const [compareOpen, setCompareOpen] = useState(false)
  const [leftKey, setLeftKey] = useState(CURRENT_KEY)
  const [rightKey, setRightKey] = useState("")

  const ordered = [...versions].sort((a, b) => {
    const pin = Number(Boolean(b.design_config?.pinned)) - Number(Boolean(a.design_config?.pinned))
    if (pin !== 0) return pin
    return a.created_at < b.created_at ? 1 : -1
  })

  function resolveSide(key: string): { label: string; content: string; design: LetterDesignConfig | null } {
    if (key === CURRENT_KEY) {
      return {
        label: "גרסה נוכחית",
        content: currentContent,
        design: hasLetterDesign(designConfig) ? designConfig : null,
      }
    }
    const version = versions.find((v) => v.id === key)
    return {
      label: version
        ? version.design_config?.label ||
          format(new Date(version.created_at), "d בMMMM yyyy, HH:mm", { locale: he })
        : "גרסה",
      content: version?.letter_content ?? "",
      design: hasLetterDesign(version?.design_config) ? version!.design_config : null,
    }
  }

  const compare = useMemo(() => {
    if (!compareOpen || !rightKey) return null
    const left = resolveSide(leftKey)
    const right = resolveSide(rightKey)
    return {
      left,
      right,
      parts: diffTexts(left.content, right.content),
      designChanges: summarizeDesignDiff(left.design, right.design),
    }
  }, [compareOpen, leftKey, rightKey, currentContent, designConfig, versions])

  function handleSave() {
    if (!currentContent.trim()) {
      toast.error("המכתב ריק — אין מה לשמור")
      return
    }
    saveVersion.mutate(
      {
        content: currentContent,
        designConfig: { ...normalizeDesign(designConfig), label: versionName.trim() || undefined, pinned: false },
      },
      {
        onSuccess: () => {
          setVersionName("")
          toast.success("גרסה נשמרה")
        },
        onError: () => toast.error("שגיאה בשמירה"),
      },
    )
  }

  function handleRestore(version: DbLetterVersion) {
    onRestore(version.letter_content, hasLetterDesign(version.design_config) ? version.design_config : null)
    setPreview(null)
    onClose()
    toast.success("גרסה שוחזרה")
  }

  function handleDelete(id: string) {
    deleteVersion.mutate(id, {
      onSuccess: () => {
        if (preview?.id === id) setPreview(null)
        if (leftKey === id) setLeftKey(CURRENT_KEY)
        if (rightKey === id) setRightKey("")
        toast.success("גרסה נמחקה")
      },
      onError: () => toast.error("שגיאה במחיקה"),
    })
  }

  function patchDesign(version: DbLetterVersion, patch: Partial<LetterDesignConfig>) {
    const next = { ...(version.design_config ?? {}), ...patch }
    updateVersion.mutate(
      { id: version.id, designConfig: next as LetterDesignConfig },
      { onError: () => toast.error("שגיאה בעדכון הגרסה") },
    )
  }

  function openCompare(seedRightId?: string) {
    setLeftKey(CURRENT_KEY)
    setRightKey(seedRightId ?? ordered[0]?.id ?? "")
    setCompareOpen(true)
  }

  return (
    <>
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            גרסאות שמורות
          </SheetTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            כתיבה → שמירת גרסה → שיפור. אפשר לנסות ניסוחים ולחזור לגרסה קודמת בלי פחד.
          </p>
        </SheetHeader>

        <div className="space-y-2 border-b p-4">
          <Input
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="שם לגרסה, למשל טיוטה רכה"
          />
          <Button className="w-full" variant="outline" onClick={handleSave} disabled={saveVersion.isPending}>
            שמור עותק של המכתב והעיצוב
          </Button>
          {ordered.length > 0 && (
            <Button className="w-full" variant="secondary" onClick={() => openCompare()}>
              <GitCompareArrows className="h-4 w-4 ms-1" />
              השוואת גרסאות
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            טוען...
          </div>
        ) : ordered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium">עדיין אין גרסאות שמורות</p>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              שמרו גרסה כדי לשמור ניסוח ולחזור אליו אחר כך. כל שמירה כוללת גם את הטקסט וגם את העיצוב.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {ordered.map((v) => {
                const design = v.design_config
                const title = design?.label || format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })
                return (
                <div
                  key={v.id}
                  className={`cursor-pointer rounded-xl border p-3 transition-colors hover:bg-accent ${preview?.id === v.id ? "border-primary bg-accent" : ""}`}
                  onClick={() => setPreview(preview?.id === v.id ? null : v)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {design?.backgroundColor && (
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: design.backgroundColor }}
                        />
                      )}
                      <span className="truncate text-sm font-medium">{title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openCompare(v.id) }}
                        className="text-muted-foreground hover:text-primary"
                        aria-label="השווה גרסה"
                        title="השווה לנוכחית"
                      >
                        <GitCompareArrows className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); patchDesign(v, { pinned: !design?.pinned }) }}
                        className={design?.pinned ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}
                        aria-label="נעץ גרסה"
                        title="נעץ למעלה"
                      >
                        <Star className={`h-3.5 w-3.5 ${design?.pinned ? "fill-current" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setApplyVersion(v) }}
                        className="text-muted-foreground hover:text-primary"
                        aria-label="החל גרסה"
                        title="החל על אנשים אחרים"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="מחק גרסה"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })}
                    {design?.theme ? ` · ${themeLabel(design.theme)}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {v.letter_content.slice(0, 120) || "(מכתב ריק)"}
                  </p>

                  {preview?.id === v.id && (
                    <VersionPreview
                      version={v}
                      onRestore={() => handleRestore(v)}
                      onRename={(label) => patchDesign(v, { label })}
                      onCompare={() => openCompare(v.id)}
                    />
                  )}
                </div>
              )})}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>

    <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4" />
            השוואת גרסאות
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3 border-b p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">לפני (בסיס)</Label>
              <Select value={leftKey} onValueChange={setLeftKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENT_KEY}>גרסה נוכחית</SelectItem>
                  {ordered.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.design_config?.label ||
                        format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">אחרי (השוואה)</Label>
              <Select value={rightKey || undefined} onValueChange={setRightKey}>
                <SelectTrigger>
                  <SelectValue placeholder="בחרי גרסה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENT_KEY}>גרסה נוכחית</SelectItem>
                  {ordered.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.design_config?.label ||
                        format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            ירוק = נוסף באחרי · אדום מחוק = הוסר מהבסיס
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {compare ? (
              <>
                {compare.designChanges.length > 0 ? (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="mb-1.5 text-xs font-medium">שינויי עיצוב</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {compare.designChanges.map((change) => (
                        <li key={change}>· {change}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">אין שינוי בעיצוב (theme / wash / font).</p>
                )}
                <TextDiffView parts={compare.parts} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">בחרי שתי גרסאות להשוואה.</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    {applyVersion && (
      <ApplyVersionSheet
        open={!!applyVersion}
        onClose={() => setApplyVersion(null)}
        letterContent={applyVersion.letter_content}
        sourcePersonId={personId}
      />
    )}
  </>
  )
}

function VersionPreview({
  version,
  onRestore,
  onRename,
  onCompare,
}: {
  version: DbLetterVersion
  onRestore: () => void
  onRename: (label: string) => void
  onCompare: () => void
}) {
  const design = hasLetterDesign(version.design_config) ? normalizeDesign(version.design_config) : null
  const [name, setName] = useState(version.design_config?.label ?? "")

  return (
    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
      <Separator />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() !== (version.design_config?.label ?? "")) onRename(name.trim())
        }}
        placeholder="שם לגרסה"
      />
      <div
        className="relative overflow-hidden rounded-md text-sm leading-relaxed"
        style={
          design
            ? {
                backgroundColor: design.backgroundColor,
                color: design.textColor,
                border: getDesignBorderStyle(design) || "1px solid #e5e7eb",
                backgroundImage: design.backgroundImageUrl ? `url(${design.backgroundImageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                direction: "rtl",
                fontFamily: fontStack(design.fontFamily),
                fontSize: sizeStyle(design.fontSize).fontSize,
                textAlign: design.align,
              }
            : { direction: "rtl", border: "1px solid #e5e7eb" }
        }
      >
        {design && <LetterDecor design={design} />}
        {design?.backgroundImageUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: design.backgroundColor,
              opacity: 1 - (design.backgroundOpacity ?? 0.15),
            }}
          />
        )}
        <div className="relative max-h-[220px] overflow-y-auto p-3" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {design?.logoUrl && <img src={design.logoUrl} alt="לוגו" className="mb-1.5 h-6 object-contain" />}
          {version.letter_content || "(מכתב ריק)"}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={onRestore}>
          <RotateCcw className="h-3.5 w-3.5 ms-1" />
          החלף במכתב הנוכחי
        </Button>
        <Button size="sm" variant="outline" onClick={onCompare}>
          <GitCompareArrows className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
