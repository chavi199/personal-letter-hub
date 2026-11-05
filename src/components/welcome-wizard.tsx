import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  BookOpen,
  Palette,
  PenLine,
  History,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { shouldShowWelcome, skipWelcomeThisSession } from "@/lib/onboarding"
import { useGroups } from "@/hooks/use-groups"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: BookOpen,
    title: "מכתבים אישיים — בלי לאבד את החוט",
    body: "כאן מארגנים וכותבים מכתבים אישיים להרבה אנשים, צעד אחר צעד.",
    cta: "המשך",
  },
  {
    icon: Users,
    title: "יוצרים קבוצה",
    body: "מתחילים בקבוצה — למשל חברים מהעבודה, משפחה או כיתה.",
    cta: "המשך",
  },
  {
    icon: UserPlus,
    title: "מוסיפים אנשים",
    body: "לכל אדם בקבוצה יש מקום משלו: הערות, רעיונות ומכתב.",
    cta: "המשך",
  },
  {
    icon: PenLine,
    title: "כותבים מכתב אישי",
    body: "משתמשים בהערות האישיות ובמאגר התוכן כדי לכתוב מכתב שמתאים בדיוק אליו.",
    cta: "המשך",
  },
  {
    icon: History,
    title: "שומרים גרסאות בלי פחד",
    body: "אפשר לנסות ניסוחים שונים, לשמור כמה גרסאות ולחזור אחורה מתי שרוצים.",
    cta: "המשך",
  },
  {
    icon: Palette,
    title: "מעצבים, שומרים ושולחים",
    body: "בסוף מעצבים את המכתב, שומרים, מייצאים או שולחים — והכול נשאר מסודר.",
    cta: "סיום",
  },
] as const

export function WelcomeWizard() {
  const navigate = useNavigate()
  const { data: groups = [], isLoading } = useGroups()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    setOpen(shouldShowWelcome())
  }, [])

  function finish(goToGroups: boolean) {
    skipWelcomeThisSession()
    setOpen(false)
    if (goToGroups && !isLoading && groups.length === 0) {
      navigate({ to: "/groups" })
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      skipWelcomeThisSession()
      setOpen(false)
      return
    }
    setOpen(true)
  }

  const current = steps[step]
  const Icon = current.icon
  const isLast = step === steps.length - 1
  const cta =
    isLast && !isLoading && groups.length === 0 ? "צור קבוצה ראשונה" : current.cta

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-white/70 bg-card/95 sm:rounded-3xl">
        <DialogHeader className="space-y-3 text-center sm:text-center">
          <div
            key={step}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.93_0.05_350)] text-[oklch(0.5_0.14_350)] animate-in fade-in-0 zoom-in-95 duration-300"
          >
            <Icon className="h-6 w-6" />
          </div>
          <DialogTitle
            key={`title-${step}`}
            className="text-xl animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            {current.title}
          </DialogTitle>
          <DialogDescription
            key={`body-${step}`}
            className="text-sm leading-relaxed animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-75"
          >
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground order-2 sm:order-1"
            onClick={() => finish(false)}
          >
            דלג לעכשיו
          </Button>

          <div className="flex gap-2 order-1 sm:order-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronRight className="h-4 w-4 ms-1" />
                הקודם
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (isLast) finish(true)
                else setStep((s) => s + 1)
              }}
            >
              {cta}
              {!isLast && <ChevronLeft className="h-4 w-4 me-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
