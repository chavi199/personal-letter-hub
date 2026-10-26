import { useState } from "react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Copy, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useLetterVersions, useSaveVersion, useDeleteVersion } from "@/hooks/use-letter-versions"
import { ApplyVersionSheet } from "@/components/apply-version-sheet"
import type { DbLetterVersion } from "@/lib/supabase"
import type { LetterDesignConfig } from "@/lib/design-themes"

interface Props {
  open: boolean
  onClose: () => void
  personId: string
  currentContent: string
  onRestore: (content: string, designConfig?: LetterDesignConfig | null) => void
}

function getBorderStyle(config?: LetterDesignConfig | null): string {
  if (!config || config.borderStyle === "none") return "1px solid #e5e7eb"
  if (config.borderStyle === "double") return `4px double ${config.borderColor}`
  if (config.borderStyle === "dashed") return `2px dashed ${config.borderColor}`
  return `2px solid ${config.borderColor}`
}

export function LetterVersionsPanel({ open, onClose, personId, currentContent, onRestore }: Props) {
  const { data: versions = [], isLoading } = useLetterVersions(personId)
  const saveVersion = useSaveVersion(personId)
  const deleteVersion = useDeleteVersion(personId)
  const [preview, setPreview] = useState<DbLetterVersion | null>(null)
  const [applyVersion, setApplyVersion] = useState<DbLetterVersion | null>(null)

  function handleSave() {
    if (!currentContent.trim()) {
      toast.error("המכתב ריק — אין מה לשמור")
      return
    }
    saveVersion.mutate({ content: currentContent }, {
      onSuccess: () => toast.success("גרסה נשמרה"),
      onError: () => toast.error("שגיאה בשמירה"),
    })
  }

  function handleRestore(version: DbLetterVersion) {
    onRestore(version.letter_content, version.design_config)
    setPreview(null)
    onClose()
    toast.success("גרסה שוחזרה")
  }

  function handleDelete(id: string) {
    deleteVersion.mutate(id, {
      onSuccess: () => {
        if (preview?.id === id) setPreview(null)
        toast.success("גרסה נמחקה")
      },
      onError: () => toast.error("שגיאה במחיקה"),
    })
  }

  return (
    <>
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-[400px] flex-col gap-0 p-0 sm:max-w-[400px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            גרסאות שמורות
          </SheetTitle>
        </SheetHeader>

        <div className="border-b p-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleSave}
            disabled={saveVersion.isPending}
          >
            שמור עותק של הגרסה הנוכחית
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            טוען...
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            אין גרסאות שמורות עדיין
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${preview?.id === v.id ? "border-primary bg-accent" : ""}`}
                  onClick={() => setPreview(preview?.id === v.id ? null : v)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {v.design_config && (
                        <span
                          title={`עיצוב: ${v.design_config.theme}`}
                          className="inline-block h-2.5 w-2.5 rounded-full border border-border"
                          style={{ backgroundColor: v.design_config.backgroundColor }}
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
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
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {v.letter_content.slice(0, 120) || "(מכתב ריק)"}
                  </p>

                  {preview?.id === v.id && (
                    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Separator />
                      {v.design_config && (
                        <p className="text-xs text-muted-foreground">
                          ערכת עיצוב: <span className="font-medium">{v.design_config.theme}</span>
                        </p>
                      )}
                      <div
                        className="relative overflow-hidden rounded-md text-sm leading-relaxed"
                        style={{
                          backgroundColor: v.design_config?.backgroundColor ?? "#ffffff",
                          color: v.design_config?.textColor ?? "#1a1a1a",
                          border: getBorderStyle(v.design_config),
                          backgroundImage: v.design_config?.backgroundImageUrl
                            ? `url(${v.design_config.backgroundImageUrl})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          direction: "rtl",
                        }}
                      >
                        {v.design_config?.backgroundImageUrl && (
                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                              backgroundColor: v.design_config.backgroundColor,
                              opacity: 1 - (v.design_config.backgroundOpacity ?? 0.15),
                            }}
                          />
                        )}
                        <div
                          className="relative max-h-[220px] overflow-y-auto p-3"
                          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                          {v.design_config?.logoUrl && (
                            <img
                              src={v.design_config.logoUrl}
                              alt="לוגו"
                              className="mb-1.5 h-6 object-contain"
                            />
                          )}
                          {v.letter_content || "(מכתב ריק)"}
                        </div>
                      </div>
                      <Button size="sm" className="w-full" onClick={() => handleRestore(v)}>
                        <RotateCcw className="h-3.5 w-3.5 ms-1" />
                        החלף במכתב הנוכחי
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
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
