import { useEffect, useRef, useState } from "react"
import { AlignCenter, AlignJustify, AlignRight, Check, ImageIcon, Loader2, Palette, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { LetterDecor } from "@/components/letter-decor"
import {
  FONTS,
  ORNAMENTS,
  SIZES,
  THEMES,
  defaultDesign,
  fontStack,
  normalizeDesign,
  sizeStyle,
  type LetterAlign,
  type LetterDesignConfig,
  type LetterFont,
  type LetterOrnament,
  type LetterSize,
} from "@/lib/design-themes"
import { useSaveVersion } from "@/hooks/use-letter-versions"
import { useUploadDesignAsset, useDeleteDesignAsset } from "@/hooks/use-design-assets"

interface Props {
  open: boolean
  onClose: () => void
  personId: string
  currentContent: string
  designConfig: LetterDesignConfig
  onDesignChange: (config: LetterDesignConfig) => void
}

export function LetterDesignPanel({
  open,
  onClose,
  personId,
  currentContent,
  designConfig,
  onDesignChange,
}: Props) {
  const [local, setLocal] = useState<LetterDesignConfig>(normalizeDesign(designConfig))
  const [versionName, setVersionName] = useState("")
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open && !wasOpen.current) setLocal(normalizeDesign(designConfig))
    wasOpen.current = open
  }, [open, designConfig])
  const saveVersion = useSaveVersion(personId)
  const uploadAsset = useUploadDesignAsset()
  const deleteAsset = useDeleteDesignAsset()

  function update(patch: Partial<LetterDesignConfig>) {
    const next = { ...local, ...patch }
    setLocal(next)
    onDesignChange(next)
  }

  function applyTheme(themeId: string) {
    const theme = THEMES.find((t) => t.id === themeId)
    if (!theme) return
    const next = {
      ...theme.config,
      logoUrl: local.logoUrl,
      backgroundImageUrl: local.backgroundImageUrl,
      backgroundOpacity: local.backgroundOpacity,
      label: local.label,
      pinned: local.pinned,
    }
    setLocal(next)
    onDesignChange(next)
  }

  function handleFileUpload(file: File, type: "logo" | "background") {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("קובץ גדול מדי — מקסימום 5MB")
      return
    }
    uploadAsset.mutate(
      { file, type },
      {
        onSuccess: (url) => {
          if (type === "logo") {
            update({ logoUrl: url })
          } else {
            update({ backgroundImageUrl: url, backgroundOpacity: local.backgroundOpacity ?? 0.15 })
          }
          toast.success(type === "logo" ? "לוגו הועלה" : "תמונת רקע הועלתה")
        },
        onError: () => toast.error("שגיאה בהעלאה"),
      },
    )
  }

  function handleRemove(type: "logo" | "background") {
    const url = type === "logo" ? local.logoUrl : local.backgroundImageUrl
    if (url) deleteAsset.mutate(url)
    if (type === "logo") {
      update({ logoUrl: undefined })
    } else {
      update({ backgroundImageUrl: undefined, backgroundOpacity: undefined })
    }
  }

  function handleSave() {
    if (!currentContent.trim()) {
      toast.error("המכתב ריק — אין מה לשמור")
      return
    }
    saveVersion.mutate(
      { content: currentContent, designConfig: { ...local, label: versionName.trim() || local.label } },
      {
        onSuccess: () => {
          setVersionName("")
          toast.success("עיצוב נשמר כגרסה חדשה")
        },
        onError: () => toast.error("שגיאה בשמירה"),
      },
    )
  }

  const borderEnabled = local.borderStyle !== "none"
  const previewBorder = borderEnabled
    ? local.borderStyle === "double"
      ? `4px double ${local.borderColor}`
      : local.borderStyle === "dashed"
        ? `2px dashed ${local.borderColor}`
        : `2px solid ${local.borderColor}`
    : "none"

  const bgOpacity = local.backgroundOpacity ?? 0.15

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[460px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            עיצוב מכתב
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 p-4">

          {/* Theme selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ערכת נושא</Label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => applyTheme(theme.id)}
                  className={`relative flex h-14 flex-col items-start justify-end overflow-hidden rounded-xl border-2 px-2 py-1.5 text-start transition-all ${
                    local.theme === theme.id
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-muted-foreground/40"
                  }`}
                  style={{ backgroundColor: theme.config.backgroundColor }}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: theme.config.accentColor || theme.config.borderColor }}
                  />
                  <span className="text-xs font-medium" style={{ color: theme.config.titleColor }}>
                    {theme.name}
                  </span>
                  {local.theme === theme.id && (
                    <Check className="absolute end-1.5 top-2 h-3.5 w-3.5" style={{ color: theme.config.textColor }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">כתיבה</Label>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">גופן</Label>
              <Select
                value={local.fontFamily ?? "rubik"}
                onValueChange={(value) => update({ fontFamily: value as LetterFont, theme: "custom" })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font.id} value={font.id}>
                      <span style={{ fontFamily: font.stack }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">גודל</Label>
                <div className="flex rounded-lg border bg-muted p-0.5">
                  {SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => update({ fontSize: size.id as LetterSize, theme: "custom" })}
                      className={`flex-1 rounded-md py-1 text-xs ${
                        (local.fontSize ?? "md") === size.id ? "bg-background shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">יישור</Label>
                <div className="flex rounded-lg border bg-muted p-0.5">
                  {(
                    [
                      { id: "right", icon: AlignRight },
                      { id: "center", icon: AlignCenter },
                      { id: "justify", icon: AlignJustify },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={item.id}
                      onClick={() => update({ align: item.id as LetterAlign, theme: "custom" })}
                      className={`flex flex-1 items-center justify-center rounded-md py-1 ${
                        (local.align ?? "right") === item.id ? "bg-background shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">צבעים</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "backgroundColor" as const, label: "רקע" },
                { key: "textColor" as const, label: "טקסט" },
                { key: "titleColor" as const, label: "כותרת" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={local[key] as string}
                      onChange={(e) => update({ [key]: e.target.value, theme: "custom" })}
                      className="h-8 w-8 cursor-pointer rounded border"
                    />
                    <span className="text-xs text-muted-foreground">{local[key] as string}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Border */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">מסגרת</Label>
              <Switch
                checked={borderEnabled}
                onCheckedChange={(v) => update({ borderStyle: v ? "simple" : "none", theme: "custom" })}
              />
            </div>
            {borderEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">סגנון</Label>
                  <Select
                    value={local.borderStyle}
                    onValueChange={(v) => update({ borderStyle: v as LetterDesignConfig["borderStyle"], theme: "custom" })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">רגיל</SelectItem>
                      <SelectItem value="double">כפול</SelectItem>
                      <SelectItem value="dashed">מקווקו</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">צבע מסגרת</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={local.borderColor}
                      onChange={(e) => update({ borderColor: e.target.value, theme: "custom" })}
                      className="h-8 w-8 cursor-pointer rounded border"
                    />
                    <span className="text-xs text-muted-foreground">{local.borderColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">קישוט</Label>
            <div className="flex flex-wrap gap-1.5">
              {ORNAMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ ornament: item.id as LetterOrnament, theme: "custom" })}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    (local.ornament ?? "none") === item.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">לוגו</Label>
            {local.logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={local.logoUrl} alt="לוגו" className="h-10 max-w-[120px] rounded border object-contain" />
                <Button size="sm" variant="ghost" onClick={() => handleRemove("logo")} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5 ms-1" />
                  הסר
                </Button>
              </div>
            ) : (
              <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 transition-colors hover:bg-accent ${uploadAsset.isPending ? "pointer-events-none opacity-60" : ""}`}>
                {uploadAsset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">בחר תמונה (PNG/JPG עד 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "logo")}
                />
              </label>
            )}
          </div>

          {/* Background image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">תמונת רקע</Label>
            {local.backgroundImageUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={local.backgroundImageUrl} alt="רקע" className="h-10 w-16 rounded border object-cover" />
                  <Button size="sm" variant="ghost" onClick={() => handleRemove("background")} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5 ms-1" />
                    הסר
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    עוצמת הרקע: {Math.round(bgOpacity * 100)}%
                  </Label>
                  <Slider
                    min={5}
                    max={40}
                    step={5}
                    value={[bgOpacity * 100]}
                    onValueChange={([v]) => update({ backgroundOpacity: v / 100 })}
                  />
                </div>
              </div>
            ) : (
              <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 transition-colors hover:bg-accent ${uploadAsset.isPending ? "pointer-events-none opacity-60" : ""}`}>
                {uploadAsset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">בחר תמונה (PNG/JPG עד 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "background")}
                />
              </label>
            )}
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">תצוגה מקדימה</Label>
            <div
              className="relative min-h-[160px] overflow-hidden rounded-md p-4 leading-relaxed"
              style={{
                backgroundColor: local.backgroundColor,
                color: local.textColor,
                border: previewBorder,
                direction: "rtl",
                fontFamily: fontStack(local.fontFamily),
                fontSize: sizeStyle(local.fontSize).fontSize,
                lineHeight: sizeStyle(local.fontSize).lineHeight,
                textAlign: local.align ?? "right",
                backgroundImage: local.backgroundImageUrl ? `url(${local.backgroundImageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <LetterDecor design={local} />
              {local.backgroundImageUrl && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: local.backgroundColor, opacity: 1 - bgOpacity }}
                />
              )}
              <div className="relative">
                {local.logoUrl && (
                  <img src={local.logoUrl} alt="לוגו" className="mb-2 h-8 object-contain" />
                )}
                <p className="mb-2 font-semibold" style={{ color: local.titleColor }}>
                  שלום [שם],
                </p>
                <p className="whitespace-pre-wrap break-words">
                  {currentContent.slice(0, 200) || "תוכן המכתב יופיע כאן..."}
                  {currentContent.length > 200 && "..."}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pb-2">
            <Label className="text-xs text-muted-foreground">שם לגרסה (אופציונלי)</Label>
            <Input
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="למשל: טיוטה חמה"
            />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={saveVersion.isPending}>
              שמור עיצוב כגרסה
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const reset = { ...defaultDesign, logoUrl: undefined, backgroundImageUrl: undefined, backgroundOpacity: undefined }
                setLocal(reset)
                onDesignChange(reset)
              }}
            >
              איפוס
            </Button>
          </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
