export type LetterFont = "rubik" | "heebo" | "assistant" | "frank" | "secular"
export type LetterSize = "sm" | "md" | "lg"
export type LetterAlign = "right" | "center" | "justify"
export type LetterOrnament = "none" | "hearts" | "stars" | "leaves" | "rainbow"

export interface LetterDesignConfig {
  theme: string
  backgroundColor: string
  textColor: string
  titleColor: string
  borderStyle: "none" | "simple" | "double" | "dashed"
  borderColor: string
  logoUrl?: string
  backgroundImageUrl?: string
  backgroundOpacity?: number
  fontFamily?: LetterFont
  fontSize?: LetterSize
  align?: LetterAlign
  ornament?: LetterOrnament
  accentColor?: string
  label?: string
  pinned?: boolean
}

export interface LetterTheme {
  id: string
  name: string
  config: LetterDesignConfig
}

export const FONTS: { id: LetterFont; name: string; stack: string }[] = [
  { id: "rubik", name: "רגיל", stack: '"Rubik", sans-serif' },
  { id: "heebo", name: "נקי", stack: '"Heebo", sans-serif' },
  { id: "assistant", name: "רך", stack: '"Assistant", sans-serif' },
  { id: "frank", name: "ספרותי", stack: '"Frank Ruhl Libre", serif' },
  { id: "secular", name: "בולט", stack: '"Secular One", sans-serif' },
]

export const SIZES: { id: LetterSize; name: string; fontSize: string; lineHeight: string }[] = [
  { id: "sm", name: "קטן", fontSize: "15px", lineHeight: "1.75" },
  { id: "md", name: "רגיל", fontSize: "17px", lineHeight: "1.9" },
  { id: "lg", name: "גדול", fontSize: "20px", lineHeight: "2" },
]

export const ORNAMENTS: { id: LetterOrnament; name: string }[] = [
  { id: "none", name: "בלי" },
  { id: "hearts", name: "לבבות" },
  { id: "stars", name: "כוכבים" },
  { id: "leaves", name: "עלים" },
  { id: "rainbow", name: "קשת" },
]

export const THEMES: LetterTheme[] = [
  {
    id: "classic",
    name: "קלאסי",
    config: {
      theme: "classic",
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
      titleColor: "#1a1a1a",
      borderStyle: "simple",
      borderColor: "#999999",
      fontFamily: "rubik",
      accentColor: "#c8c8c8",
    },
  },
  {
    id: "warm",
    name: "חם",
    config: {
      theme: "warm",
      backgroundColor: "#fdf6ec",
      textColor: "#4a2c0a",
      titleColor: "#7a3e0e",
      borderStyle: "none",
      borderColor: "#c8a97a",
      fontFamily: "frank",
      accentColor: "#c8a97a",
    },
  },
  {
    id: "formal",
    name: "רשמי",
    config: {
      theme: "formal",
      backgroundColor: "#eef3fb",
      textColor: "#1a2e5a",
      titleColor: "#1a3a7a",
      borderStyle: "double",
      borderColor: "#3b6cb7",
      fontFamily: "heebo",
      accentColor: "#3b6cb7",
    },
  },
  {
    id: "minimal",
    name: "מינימלי",
    config: {
      theme: "minimal",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      titleColor: "#555555",
      borderStyle: "none",
      borderColor: "#dddddd",
      fontFamily: "assistant",
      accentColor: "#e5e5e5",
    },
  },
  {
    id: "festive",
    name: "חגיגי",
    config: {
      theme: "festive",
      backgroundColor: "#fffbea",
      textColor: "#3b1f6e",
      titleColor: "#5c2d91",
      borderStyle: "dashed",
      borderColor: "#c9a800",
      fontFamily: "secular",
      fontSize: "lg",
      ornament: "stars",
      accentColor: "#c9a800",
    },
  },
  {
    id: "sky",
    name: "שמיים",
    config: {
      theme: "sky",
      backgroundColor: "#f4f8ff",
      textColor: "#24324a",
      titleColor: "#3a5a9a",
      borderStyle: "none",
      borderColor: "#b9d4ff",
      fontFamily: "rubik",
      ornament: "rainbow",
      accentColor: "#7eb6ff",
    },
  },
  {
    id: "rose",
    name: "ורד",
    config: {
      theme: "rose",
      backgroundColor: "#fff5f7",
      textColor: "#5c3140",
      titleColor: "#a24b68",
      borderStyle: "dashed",
      borderColor: "#e7a3b8",
      fontFamily: "frank",
      ornament: "hearts",
      accentColor: "#e07a98",
    },
  },
  {
    id: "spring",
    name: "אביב",
    config: {
      theme: "spring",
      backgroundColor: "#f3faf4",
      textColor: "#234033",
      titleColor: "#2f7a4f",
      borderStyle: "simple",
      borderColor: "#8fceaa",
      fontFamily: "assistant",
      ornament: "leaves",
      accentColor: "#5eae7a",
    },
  },
  {
    id: "sea",
    name: "ים",
    config: {
      theme: "sea",
      backgroundColor: "#f2fbfb",
      textColor: "#143c42",
      titleColor: "#0e7490",
      borderStyle: "simple",
      borderColor: "#7ec8d4",
      fontFamily: "heebo",
      accentColor: "#14a3b8",
    },
  },
  {
    id: "dusk",
    name: "ליל רך",
    config: {
      theme: "dusk",
      backgroundColor: "#f6f1fb",
      textColor: "#3b2a55",
      titleColor: "#6d4aa8",
      borderStyle: "none",
      borderColor: "#d4c2ee",
      fontFamily: "rubik",
      ornament: "stars",
      accentColor: "#8b6bb8",
    },
  },
  {
    id: "gold",
    name: "זהב",
    config: {
      theme: "gold",
      backgroundColor: "#fffaf0",
      textColor: "#4a3518",
      titleColor: "#8a6420",
      borderStyle: "double",
      borderColor: "#d4b483",
      fontFamily: "frank",
      accentColor: "#c4963a",
    },
  },
  {
    id: "paper",
    name: "נייר",
    config: {
      theme: "paper",
      backgroundColor: "#fbf7f1",
      textColor: "#2c2416",
      titleColor: "#5c4632",
      borderStyle: "simple",
      borderColor: "#e4d5c3",
      fontFamily: "frank",
      fontSize: "md",
      accentColor: "#cbb59a",
    },
  },
]

export const defaultDesign: LetterDesignConfig = THEMES[0].config

export function getThemeById(id: string): LetterTheme | undefined {
  return THEMES.find((t) => t.id === id)
}

export function themeLabel(id?: string | null): string {
  if (!id || id === "custom") return "מותאם אישית"
  return getThemeById(id)?.name ?? "מותאם אישית"
}

export function fontStack(font?: LetterFont): string {
  return FONTS.find((item) => item.id === font)?.stack ?? FONTS[0].stack
}

export function sizeStyle(size?: LetterSize) {
  return SIZES.find((item) => item.id === size) ?? SIZES[1]
}

export function normalizeDesign(config?: Partial<LetterDesignConfig> | null): LetterDesignConfig {
  return {
    ...defaultDesign,
    ...config,
    fontFamily: config?.fontFamily ?? defaultDesign.fontFamily,
    fontSize: config?.fontSize ?? "md",
    align: config?.align ?? "right",
    ornament: config?.ornament ?? "none",
    accentColor: config?.accentColor ?? config?.borderColor ?? defaultDesign.borderColor,
  }
}

export function getDesignBorderStyle(config: LetterDesignConfig): string {
  if (config.borderStyle === "none") return ""
  if (config.borderStyle === "double") return `4px double ${config.borderColor}`
  if (config.borderStyle === "dashed") return `2px dashed ${config.borderColor}`
  return `2px solid ${config.borderColor}`
}

export function hasLetterDesign(config?: Partial<LetterDesignConfig> | null): boolean {
  return Boolean(config?.backgroundColor)
}
