import {
  FONTS,
  type LetterFont,
} from "./design-themes"

const loaded = new Set<string>()
const pending = new Map<string, Promise<void>>()

function fontDef(id?: LetterFont | null) {
  return FONTS.find((font) => font.id === (id ?? "rubik")) ?? FONTS[0]
}

/** Google Fonts stylesheet URL for one (or a few) letter fonts. */
export function googleFontsHref(ids: Array<LetterFont | undefined | null>): string {
  const unique = [...new Set(ids.map((id) => fontDef(id).id))]
  const query = unique
    .map((id) => fontDef(id).google)
    .map((family) => `family=${family}`)
    .join("&")
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}

/** Load a letter font on demand (once). Safe to call from React effects / PDF export. */
export function ensureLetterFont(font?: LetterFont | null): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve()

  const def = fontDef(font)
  if (loaded.has(def.id)) {
    return document.fonts.load(`400 17px "${def.family}"`).then(() => undefined, () => undefined)
  }

  const existing = pending.get(def.id)
  if (existing) return existing

  const promise = new Promise<void>((resolve) => {
    const href = googleFontsHref([def.id])
    const prev = document.querySelector<HTMLLinkElement>(`link[data-letter-font="${def.id}"]`)
    if (prev) {
      loaded.add(def.id)
      pending.delete(def.id)
      document.fonts.load(`400 17px "${def.family}"`).then(() => resolve(), () => resolve())
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.dataset.letterFont = def.id
    link.onload = () => {
      loaded.add(def.id)
      pending.delete(def.id)
      document.fonts.load(`400 17px "${def.family}"`).then(() => resolve(), () => resolve())
    }
    link.onerror = () => {
      pending.delete(def.id)
      resolve()
    }
    document.head.appendChild(link)
  })

  pending.set(def.id, promise)
  return promise
}

export function letterFontFamilyName(font?: LetterFont | null): string {
  return fontDef(font).family
}
