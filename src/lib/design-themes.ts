export type LetterFont =
  | "rubik"
  | "heebo"
  | "assistant"
  | "frank"
  | "secular"
  | "alef"
  | "david"
  | "miriam"
  | "varela"
  | "bellefair"
  | "karantina"
export type LetterSize = "sm" | "md" | "lg"
export type LetterAlign = "right" | "center" | "justify"
export type LetterOrnament = "none" | "hearts" | "stars" | "leaves" | "rainbow" | "masks" | "candles"
export type LetterWash = "flat" | "blush" | "sky" | "gold" | "mint" | "lilac" | "sunset" | "pastel" | "carnival" | "candlelight"

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
  wash?: LetterWash
  accentColor?: string
  label?: string
  pinned?: boolean
}

export interface LetterTheme {
  id: string
  name: string
  kind?: "occasion"
  config: LetterDesignConfig
}

export const FONTS: { id: LetterFont; name: string; stack: string }[] = [
  { id: "rubik", name: "רגיל", stack: '"Rubik", sans-serif' },
  { id: "heebo", name: "נקי", stack: '"Heebo", sans-serif' },
  { id: "assistant", name: "רך", stack: '"Assistant", sans-serif' },
  { id: "frank", name: "ספרותי", stack: '"Frank Ruhl Libre", serif' },
  { id: "secular", name: "בולט", stack: '"Secular One", sans-serif' },
  { id: "alef", name: "אלף", stack: '"Alef", sans-serif' },
  { id: "david", name: "דוד", stack: '"David Libre", serif' },
  { id: "miriam", name: "מרים", stack: '"Miriam Libre", sans-serif' },
  { id: "varela", name: "עגול", stack: '"Varela Round", sans-serif' },
  { id: "bellefair", name: "אלגנטי", stack: '"Bellefair", serif' },
  { id: "karantina", name: "כותרתי", stack: '"Karantina", sans-serif' },
]

export const SIZES: { id: LetterSize; name: string; fontSize: string; lineHeight: string }[] = [
  { id: "sm", name: "קטן", fontSize: "15px", lineHeight: "1.75" },
  { id: "md", name: "רגיל", fontSize: "17px", lineHeight: "1.9" },
  { id: "lg", name: "גדול", fontSize: "20px", lineHeight: "2" },
]

export const WASHES: { id: LetterWash; name: string; css: string }[] = [
  { id: "flat", name: "אחיד", css: "" },
  {
    id: "blush",
    name: "סומק",
    css: "radial-gradient(ellipse at 8% 0%, #ffd0e0 0%, transparent 52%), radial-gradient(ellipse at 100% 100%, #ffe4c4 0%, transparent 48%), #fff6f4",
  },
  {
    id: "sky",
    name: "שמיים",
    css: "radial-gradient(ellipse at 0% 0%, #d5e7ff 0%, transparent 55%), radial-gradient(ellipse at 100% 18%, #e6d8ff 0%, transparent 42%), #f6faff",
  },
  {
    id: "gold",
    name: "זהב",
    css: "radial-gradient(ellipse at 85% 0%, #ffe6a4 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, #ffdfc0 0%, transparent 48%), #fffaf0",
  },
  {
    id: "mint",
    name: "מנטה",
    css: "radial-gradient(ellipse at 0% 8%, #d4f5e2 0%, transparent 55%), radial-gradient(ellipse at 100% 92%, #e6f6c6 0%, transparent 48%), #f5fdf7",
  },
  {
    id: "lilac",
    name: "לילך",
    css: "radial-gradient(ellipse at 100% 0%, #ead9ff 0%, transparent 52%), radial-gradient(ellipse at 0% 100%, #ffd6ec 0%, transparent 50%), #fbf6ff",
  },
  {
    id: "sunset",
    name: "שקיעה",
    css: "linear-gradient(165deg, #ffe4d2 0%, #fff4e4 42%, #f2e2ff 100%)",
  },
  {
    id: "pastel",
    name: "פסטל",
    css: "radial-gradient(ellipse at 12% 8%, #ffcfe4 0%, transparent 40%), radial-gradient(ellipse at 88% 12%, #e3d2ff 0%, transparent 38%), radial-gradient(ellipse at 50% 100%, #ffe8b4 0%, transparent 46%), #fff7fb",
  },
  {
    id: "carnival",
    name: "קרנבל",
    css: "radial-gradient(ellipse at 8% 0%, #ffd6a5 0%, transparent 45%), radial-gradient(ellipse at 92% 8%, #ffb3c7 0%, transparent 42%), radial-gradient(ellipse at 50% 100%, #c7b3ff 0%, transparent 48%), #fff8f2",
  },
  {
    id: "candlelight",
    name: "אורות",
    css: "radial-gradient(ellipse at 20% 0%, #ffe9b8 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, #f0e2c4 0%, transparent 48%), #fbf6ea",
  },
]

export const ORNAMENTS: { id: LetterOrnament; name: string }[] = [
  { id: "none", name: "בלי" },
  { id: "hearts", name: "לבבות" },
  { id: "stars", name: "כוכבים" },
  { id: "leaves", name: "עלים" },
  { id: "rainbow", name: "קשת" },
  { id: "masks", name: "מסיכות" },
  { id: "candles", name: "אורות" },
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
      wash: "gold",
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
      wash: "sky",
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
      wash: "blush",
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
      wash: "mint",
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
      wash: "sky",
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
      wash: "lilac",
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
      wash: "gold",
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
  {
    id: "birthday",
    name: "יום הולדת",
    kind: "occasion",
    config: {
      theme: "birthday",
      backgroundColor: "#fff8ee",
      textColor: "#4a2d12",
      titleColor: "#b56a12",
      borderStyle: "dashed",
      borderColor: "#e2b15a",
      fontFamily: "secular",
      fontSize: "lg",
      ornament: "stars",
      wash: "sunset",
      accentColor: "#e2a03a",
    },
  },
  {
    id: "princess",
    name: "נסיכה",
    kind: "occasion",
    config: {
      theme: "princess",
      backgroundColor: "#fff7fb",
      textColor: "#6a3158",
      titleColor: "#c2548e",
      borderStyle: "double",
      borderColor: "#e7a3c8",
      fontFamily: "frank",
      fontSize: "lg",
      ornament: "hearts",
      wash: "pastel",
      accentColor: "#e07aab",
    },
  },
  {
    id: "baby-girl",
    name: "נולדה בת",
    kind: "occasion",
    config: {
      theme: "baby-girl",
      backgroundColor: "#fff5f8",
      textColor: "#5c3344",
      titleColor: "#c45b7a",
      borderStyle: "simple",
      borderColor: "#f0b7c8",
      fontFamily: "assistant",
      ornament: "hearts",
      wash: "blush",
      accentColor: "#e989a8",
    },
  },
  {
    id: "baby-boy",
    name: "נולד בן",
    kind: "occasion",
    config: {
      theme: "baby-boy",
      backgroundColor: "#f4f9ff",
      textColor: "#1d3c55",
      titleColor: "#2f6f9a",
      borderStyle: "simple",
      borderColor: "#b7d4ee",
      fontFamily: "heebo",
      ornament: "stars",
      wash: "sky",
      accentColor: "#6aa4d4",
    },
  },
  {
    id: "thanks",
    name: "תודה",
    kind: "occasion",
    config: {
      theme: "thanks",
      backgroundColor: "#f6fbf6",
      textColor: "#234033",
      titleColor: "#2f7a4f",
      borderStyle: "simple",
      borderColor: "#b7e0c4",
      fontFamily: "frank",
      ornament: "leaves",
      wash: "mint",
      accentColor: "#6aaa78",
    },
  },
  {
    id: "purim",
    name: "פורים",
    kind: "occasion",
    config: {
      theme: "purim",
      backgroundColor: "#fff7f0",
      textColor: "#4a2040",
      titleColor: "#b43d6e",
      borderStyle: "dashed",
      borderColor: "#e8a45a",
      fontFamily: "secular",
      fontSize: "lg",
      ornament: "masks",
      wash: "carnival",
      accentColor: "#d96b3c",
    },
  },
  {
    id: "shabbat",
    name: "שבת",
    kind: "occasion",
    config: {
      theme: "shabbat",
      backgroundColor: "#fbf7ee",
      textColor: "#3a3224",
      titleColor: "#7a5c28",
      borderStyle: "double",
      borderColor: "#d4b97a",
      fontFamily: "frank",
      fontSize: "md",
      ornament: "candles",
      wash: "candlelight",
      accentColor: "#c9a24a",
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
    wash: config?.wash ?? "flat",
    accentColor: config?.accentColor ?? config?.borderColor ?? defaultDesign.borderColor,
  }
}

export function paperBackground(config: Pick<LetterDesignConfig, "backgroundColor" | "wash">): string {
  const wash = WASHES.find((item) => item.id === config.wash)
  if (wash && wash.css) return wash.css
  return config.backgroundColor
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
