import type { LetterDesignConfig, LetterOrnament } from "@/lib/design-themes"

function Motif({ type, color }: { type: LetterOrnament; color: string }) {
  if (type === "hearts") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={color} aria-hidden>
        <path d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.2 9 6.2c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.8 4 4.6C19 15.6 12 20 12 20z" />
      </svg>
    )
  }
  if (type === "stars") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={color} aria-hidden>
        <path d="M12 2.6 14.4 9H21l-5.3 3.8 2 6.4L12 15.8 6.3 19.2l2-6.4L3 9h6.6L12 2.6z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={color} aria-hidden>
      <path d="M5 19c8 1 13-4 14-13-8 1-13 6-14 13z" />
    </svg>
  )
}

export function LetterDecor({ design }: { design: LetterDesignConfig }) {
  const accent = design.accentColor || design.borderColor
  const rainbow =
    "linear-gradient(90deg, #f2a3b5, #f3d27a, #8ed0a8, #8eb7ee, #c4a6e8)"
  const showMotif = design.ornament === "hearts" || design.ornament === "stars" || design.ornament === "leaves"

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
        style={{ background: design.ornament === "rainbow" ? rainbow : accent }}
      />
      {showMotif && (
        <>
          <span className="pointer-events-none absolute start-3 top-4 opacity-70">
            <Motif type={design.ornament!} color={accent} />
          </span>
          <span className="pointer-events-none absolute end-3 bottom-3 opacity-50">
            <Motif type={design.ornament!} color={accent} />
          </span>
        </>
      )}
    </>
  )
}
