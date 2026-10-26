import { useState } from "react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useLetterVersions } from "@/hooks/use-letter-versions"
import { exportLetterToPDF, exportLetterToWord } from "@/lib/export"
import type { LetterDesignConfig } from "@/lib/design-themes"

interface Props {
  open: boolean
  onClose: () => void
  personName: string
  personId: string
  currentContent: string
  designConfig?: LetterDesignConfig
}

export function ExportLetterPanel({ open, onClose, personName, personId, currentContent, designConfig }: Props) {
  const { data: versions = [] } = useLetterVersions(personId)
  const [selectedKey, setSelectedKey] = useState("current")

  const selectedVersion = versions.find((v) => v.id === selectedKey)
  const selectedContent =
    selectedKey === "current"
      ? currentContent
      : (selectedVersion?.letter_content ?? currentContent)

  const effectiveDesign =
    selectedKey === "current"
      ? designConfig
      : (selectedVersion?.design_config ?? designConfig)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-[420px] flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-base">הדפסה / ייצוא — {personName}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">גרסה לייצוא</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">גרסה נוכחית</SelectItem>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {format(new Date(v.created_at), "d בMMMM yyyy, HH:mm", { locale: he })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 flex-1">
            <Label className="text-xs text-muted-foreground">תצוגה מקדימה</Label>
            <Textarea
              readOnly
              value={selectedContent}
              className="min-h-[340px] resize-none bg-muted/40 text-sm leading-relaxed"
              placeholder="(המכתב ריק)"
            />
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => exportLetterToPDF(personName, selectedContent, effectiveDesign)}
            >
              <Printer className="h-4 w-4 ms-1" />
              הדפס PDF
            </Button>
            <Button
              className="flex-1"
              onClick={() => exportLetterToWord(personName, selectedContent)}
            >
              <Download className="h-4 w-4 ms-1" />
              ייצא Word
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
