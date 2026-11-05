import { LetterDecor } from "@/components/letter-decor"
import { LivingLetterPaper } from "@/components/living-letter-paper"
import {
  fontStack,
  getDesignBorderStyle,
  hasLetterDesign,
  normalizeDesign,
  sizeStyle,
  type LetterDesignConfig,
} from "@/lib/design-themes"

type Props = {
  recipientName: string
  content: string
  designConfig?: LetterDesignConfig | null
}

export function SharedLetterView({ recipientName, content, designConfig }: Props) {
  const design = hasLetterDesign(designConfig) ? normalizeDesign(designConfig) : normalizeDesign()
  const size = sizeStyle(design.fontSize)

  return (
    <LivingLetterPaper
      interactive={false}
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-black/5 shadow-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.textColor,
        border: getDesignBorderStyle(design) || "1px solid rgba(0,0,0,0.08)",
        fontFamily: fontStack(design.fontFamily),
        fontSize: size.fontSize,
        lineHeight: size.lineHeight,
        backgroundImage: design.backgroundImageUrl ? `url(${design.backgroundImageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        direction: "rtl",
        textAlign: design.align,
      }}
    >
      <LetterDecor design={design} />
      {design.backgroundImageUrl && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: design.backgroundColor,
            opacity: 1 - (design.backgroundOpacity ?? 0.15),
          }}
        />
      )}
      <div className="relative space-y-4 p-6 sm:p-10">
        {design.logoUrl && (
          <img src={design.logoUrl} alt="" className="mx-auto h-10 object-contain sm:h-12" />
        )}
        {recipientName.trim() && (
          <h1
            className="text-xl font-semibold tracking-tight sm:text-2xl"
            style={{ color: design.titleColor, textAlign: design.align }}
          >
            מכתב ל{recipientName.trim()}
          </h1>
        )}
        <div
          className="whitespace-pre-wrap break-words"
          style={{ wordBreak: "break-word" }}
        >
          {content.trim() || "המכתב ריק."}
        </div>
      </div>
    </LivingLetterPaper>
  )
}
