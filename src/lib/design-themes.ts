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
}

export interface LetterTheme {
  id: string
  name: string
  config: LetterDesignConfig
}

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
    },
  },
]

export const defaultDesign: LetterDesignConfig = THEMES[0].config

export function getThemeById(id: string): LetterTheme | undefined {
  return THEMES.find((t) => t.id === id)
}

export function getDesignBorderStyle(config: LetterDesignConfig): string {
  if (config.borderStyle === "none") return ""
  if (config.borderStyle === "double") return `4px double ${config.borderColor}`
  if (config.borderStyle === "dashed") return `2px dashed ${config.borderColor}`
  return `2px solid ${config.borderColor}`
}
