import { SmilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const EMOJIS = [
  "❤️",
  "💕",
  "💖",
  "💗",
  "✨",
  "🌟",
  "⭐",
  "🌸",
  "🌺",
  "🌷",
  "🌻",
  "🌼",
  "🍀",
  "🌈",
  "☀️",
  "🌙",
  "🎀",
  "🎁",
  "🥳",
  "🎉",
  "🎈",
  "🦋",
  "🕊️",
  "🙏",
  "😊",
  "🥰",
  "😇",
  "🤗",
  "💫",
  "🕯️",
  "📖",
  "✍️",
  "💌",
  "🤍",
  "💛",
  "💙",
  "💚",
  "🧡",
  "💜",
  "👑",
]

type Props = {
  onPick: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPickerButton({ onPick, disabled }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled} aria-label="הוסף אימוג׳י">
          <SmilePlus className="h-3.5 w-3.5 ms-1" />
          אימוג׳י
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-2">
        <p className="mb-2 px-1 text-xs text-muted-foreground">בחרי אימוג׳י להוספה למכתב</p>
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent"
              onClick={() => onPick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
