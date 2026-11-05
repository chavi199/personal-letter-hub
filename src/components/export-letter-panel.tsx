import { useState } from "react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Download, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useLetterVersions } from "@/hooks/use-letter-versions"
import { exportLetterToPDF, exportLetterToWord } from "@/lib/export"
import { renderLetterPdfBase64 } from "@/lib/letter-pdf"
import { sendLetterEmail } from "@/lib/api/send-letter-email"
import { supabase } from "@/lib/supabase"
import type { LetterDesignConfig } from "@/lib/design-themes"

interface Props {
  open: boolean
  onClose: () => void
  personName: string
  personId: string
  currentContent: string
  designConfig?: LetterDesignConfig
}

function errorText(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "שליחת המייל נכשלה"
}

export function ExportLetterPanel({ open, onClose, personName, personId, currentContent, designConfig }: Props) {
  const { data: versions = [] } = useLetterVersions(personId)
  const [selectedKey, setSelectedKey] = useState("current")
  const [emails, setEmails] = useState("")
  const [sending, setSending] = useState(false)

  const selectedVersion = versions.find((v) => v.id === selectedKey)
  const selectedContent =
    selectedKey === "current"
      ? currentContent
      : (selectedVersion?.letter_content ?? currentContent)

  const effectiveDesign =
    selectedKey === "current"
      ? designConfig
      : (selectedVersion?.design_config ?? designConfig)

  async function handleSendEmail() {
    const to = [...new Set(emails.split(/[,;\s]+/).map((item) => item.trim().toLowerCase()).filter(Boolean))]
    if (!selectedContent.trim()) {
      toast.error("המכתב ריק — אין מה לשלוח")
      return
    }
    if (to.length === 0) {
      toast.error("כתבי כתובת מייל אחת לפחות")
      return
    }
    if (to.length > 8 || to.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      toast.error(to.length > 8 ? "אפשר לשלוח עד 8 כתובות בבת אחת" : "אחת מכתובות המייל לא תקינה")
      return
    }

    setSending(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        toast.error("צריך להתחבר לפני שליחה")
        return
      }
      const pdfBase64 = await renderLetterPdfBase64(personName, selectedContent, effectiveDesign ?? undefined)
      const result = await sendLetterEmail({
        data: { accessToken, to, personName, pdfBase64 },
      })
      toast.success(result.sent === 1 ? "המכתב נשלח" : `המכתב נשלח ל-${result.sent} כתובות`)
      setEmails("")
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setSending(false)
    }
  }

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

          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="letter-emails" className="text-xs">שליחה לחברים</Label>
            <Input
              id="letter-emails"
              dir="ltr"
              value={emails}
              onChange={(event) => setEmails(event.target.value)}
              placeholder="name@mail.com, friend@mail.com"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">כמה כתובות מופרדות בפסיק. יישלח PDF של העמוד.</p>
            <Button className="w-full" disabled={sending} onClick={handleSendEmail}>
              {sending ? <Loader2 className="h-4 w-4 ms-1 animate-spin" /> : <Mail className="h-4 w-4 ms-1" />}
              שלח PDF במייל
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => exportLetterToPDF(personName, selectedContent, effectiveDesign)}
            >
              <Download className="h-4 w-4 ms-1" />
              הורד PDF
            </Button>
            <Button
              className="flex-1"
              onClick={() => exportLetterToWord(personName, selectedContent, effectiveDesign)}
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
