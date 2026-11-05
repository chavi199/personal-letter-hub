export type DiffPart = {
  type: "equal" | "add" | "del"
  text: string
}

/** Split Hebrew/RTL-friendly: keep whitespace as separate tokens. */
function tokenize(text: string): string[] {
  if (!text) return []
  return text.match(/\S+|\s+/g) ?? [text]
}

function lcsTable(a: string[], b: string[]): number[][] {
  const rows = a.length
  const cols = b.length
  const dp: number[][] = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0))
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp
}

/**
 * Word-level LCS diff: green = added in `next`, red = removed from `prev`.
 * Works with Hebrew and RTL when rendered with `dir="rtl"`.
 */
export function diffTexts(prev: string, next: string): DiffPart[] {
  if (prev === next) return prev ? [{ type: "equal", text: prev }] : []

  const a = tokenize(prev)
  const b = tokenize(next)
  const dp = lcsTable(a, b)
  const parts: DiffPart[] = []

  let i = a.length
  let j = b.length
  const reverse: DiffPart[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      reverse.push({ type: "equal", text: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      reverse.push({ type: "add", text: b[j - 1] })
      j--
    } else if (i > 0) {
      reverse.push({ type: "del", text: a[i - 1] })
      i--
    }
  }

  for (let k = reverse.length - 1; k >= 0; k--) {
    const part = reverse[k]
    const last = parts[parts.length - 1]
    if (last && last.type === part.type) last.text += part.text
    else parts.push({ ...part })
  }

  return parts
}

export function countDiffChanges(parts: DiffPart[]): { added: number; removed: number } {
  let added = 0
  let removed = 0
  for (const part of parts) {
    if (part.type === "add") added += part.text.replace(/\s+/g, "").length
    if (part.type === "del") removed += part.text.replace(/\s+/g, "").length
  }
  return { added, removed }
}
