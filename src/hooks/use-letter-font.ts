import { useEffect } from "react"
import { ensureLetterFont } from "@/lib/letter-fonts"
import type { LetterFont } from "@/lib/design-themes"

/** Ensures the selected letter font stylesheet is loaded (lazy, once per font). */
export function useLetterFont(font?: LetterFont | null) {
  useEffect(() => {
    void ensureLetterFont(font)
  }, [font])
}
