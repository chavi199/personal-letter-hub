import { hasLetterDesign, normalizeDesign, type LetterDesignConfig } from "./design-themes"

function key(personId: string) {
  return `letter-design:${personId}`
}

export function readLocalDesign(personId: string): LetterDesignConfig | null {
  try {
    const raw = localStorage.getItem(key(personId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { explicit?: boolean; design?: LetterDesignConfig }
    if (!parsed.explicit || !hasLetterDesign(parsed.design)) return null
    return normalizeDesign(parsed.design)
  } catch {
    return null
  }
}

export function writeLocalDesign(personId: string, design: LetterDesignConfig) {
  localStorage.setItem(key(personId), JSON.stringify({ explicit: true, design }))
}
