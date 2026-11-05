import { paperBackground, type LetterDesignConfig, type LetterOrnament } from "@/lib/design-themes"

const spots = [
  [4, 6, 34, 0.55, -14],
  [16, 3, 16, 0.35, 10],
  [30, 7, 12, 0.28, -6],
  [46, 3, 18, 0.32, 8],
  [62, 6, 14, 0.3, -10],
  [78, 3, 22, 0.4, 12],
  [92, 7, 30, 0.5, -8],
  [3, 22, 14, 0.28, 6],
  [96, 24, 16, 0.3, -12],
  [5, 42, 20, 0.22, 14],
  [94, 46, 18, 0.24, -8],
  [4, 64, 16, 0.26, -10],
  [96, 68, 22, 0.32, 8],
  [6, 86, 28, 0.45, 10],
  [20, 94, 14, 0.3, -6],
  [38, 96, 18, 0.28, 8],
  [56, 93, 12, 0.24, -12],
  [74, 96, 16, 0.3, 6],
  [90, 88, 32, 0.48, -14],
  [22, 18, 10, 0.16, 4],
  [70, 22, 11, 0.15, -8],
  [40, 78, 12, 0.14, 10],
  [58, 70, 10, 0.12, -4],
] as const

function shape(type: LetterOrnament, color: string) {
  if (type === "hearts") {
    return <path fill={color} d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.2 9 6.2c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.8 4 4.6C19 15.6 12 20 12 20z" />
  }
  if (type === "leaves") {
    return <path fill={color} d="M5 19c8 1 13-4 14-13-8 1-13 6-14 13z" />
  }
  if (type === "rainbow") {
    return (
      <>
        <circle cx="8" cy="12" r="3.2" fill="#f2a3b5" />
        <circle cx="14" cy="8" r="2.4" fill="#f3d27a" />
        <circle cx="18" cy="14" r="2.8" fill="#8eb7ee" />
      </>
    )
  }
  return <path fill={color} d="M12 2.6 14.4 9H21l-5.3 3.8 2 6.4L12 15.8 6.3 19.2l2-6.4L3 9h6.6L12 2.6z" />
}

export function LetterDecor({ design }: { design: LetterDesignConfig }) {
  const accent = design.accentColor || design.borderColor
  const ornament = design.ornament ?? "none"
  const wash = paperBackground(design)
  const showMotifs = ornament !== "none"

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {!design.backgroundImageUrl && wash !== design.backgroundColor && (
        <div className="absolute inset-0" style={{ background: wash }} />
      )}
      {showMotifs && (
        <>
          <div
            className="absolute inset-3 rounded-2xl border border-dashed opacity-50"
            style={{ borderColor: accent }}
          />
          {spots.map(([x, y, size, opacity, rotate], index) => (
            <svg
              key={index}
              viewBox="0 0 24 24"
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                opacity,
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
              }}
            >
              {shape(ornament, accent)}
            </svg>
          ))}
        </>
      )}
    </div>
  )
}
