import {
  FONTS,
  ORNAMENTS,
  WASHES,
  themeLabel,
  type LetterDesignConfig,
} from "./design-themes"

function fontName(id?: string) {
  return FONTS.find((f) => f.id === id)?.name ?? "ברירת מחדל"
}

function washName(id?: string) {
  return WASHES.find((w) => w.id === id)?.name ?? "אחיד"
}

function ornamentName(id?: string) {
  return ORNAMENTS.find((o) => o.id === id)?.name ?? "בלי"
}

function sizeName(id?: string) {
  if (id === "sm") return "קטן"
  if (id === "lg") return "גדול"
  return "רגיל"
}

/** Short Hebrew summary of design field changes (not pixel-level). */
export function summarizeDesignDiff(
  prev?: LetterDesignConfig | null,
  next?: LetterDesignConfig | null,
): string[] {
  const a = prev ?? null
  const b = next ?? null
  if (!a && !b) return []
  if (!a && b) return ["נוסף עיצוב למכתב"]
  if (a && !b) return ["הוסר עיצוב מהמכתב"]

  const changes: string[] = []
  if (a!.theme !== b!.theme) {
    changes.push(`ערכת נושא: ${themeLabel(a!.theme)} → ${themeLabel(b!.theme)}`)
  }
  if ((a!.wash ?? "flat") !== (b!.wash ?? "flat")) {
    changes.push(`רקע: ${washName(a!.wash)} → ${washName(b!.wash)}`)
  }
  if ((a!.fontFamily ?? "rubik") !== (b!.fontFamily ?? "rubik")) {
    changes.push(`גופן: ${fontName(a!.fontFamily)} → ${fontName(b!.fontFamily)}`)
  }
  if ((a!.fontSize ?? "md") !== (b!.fontSize ?? "md")) {
    changes.push(`גודל: ${sizeName(a!.fontSize)} → ${sizeName(b!.fontSize)}`)
  }
  if ((a!.ornament ?? "none") !== (b!.ornament ?? "none")) {
    changes.push(`קישוט: ${ornamentName(a!.ornament)} → ${ornamentName(b!.ornament)}`)
  }
  if (a!.backgroundColor !== b!.backgroundColor) {
    changes.push("צבע רקע השתנה")
  }
  if (a!.textColor !== b!.textColor) {
    changes.push("צבע טקסט השתנה")
  }
  if ((a!.align ?? "right") !== (b!.align ?? "right")) {
    changes.push("יישור השתנה")
  }
  if (Boolean(a!.logoUrl) !== Boolean(b!.logoUrl) || a!.logoUrl !== b!.logoUrl) {
    changes.push("לוגו השתנה")
  }
  if (
    Boolean(a!.backgroundImageUrl) !== Boolean(b!.backgroundImageUrl) ||
    a!.backgroundImageUrl !== b!.backgroundImageUrl
  ) {
    changes.push("תמונת רקע השתנתה")
  }

  return changes
}
