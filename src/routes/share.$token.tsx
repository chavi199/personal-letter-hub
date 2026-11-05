import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { SharedLetterView } from "@/components/shared-letter-view"
import { fetchSharedLetterByToken } from "@/lib/api/letter-share"

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "מכתב משותף" },
      { name: "description", content: "תצוגת קריאה של מכתב ששותף בלינק." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharedLetterPage,
})

function SharedLetterPage() {
  const { token } = Route.useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared_letter", token],
    queryFn: () => fetchSharedLetterByToken(token),
    retry: false,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#fff7f2,_#f3f6ff_55%,_#eef6f3)] px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          טוען מכתב...
        </div>
      </div>
    )
  }

  if (isError || !data || !data.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#fff7f2,_#f3f6ff_55%,_#eef6f3)] px-4">
        <div className="max-w-md rounded-2xl border bg-white/80 p-8 text-center shadow-sm backdrop-blur">
          <h1 className="text-xl font-semibold text-foreground">הלינק לא פעיל</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ייתכן שהלינק בוטל, פג תוקפו, או שאינו תקין. בקשו מהשולח לינק חדש.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#fff7f2,_#f3f6ff_55%,_#eef6f3)] px-4 py-8 sm:py-12">
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <p className="text-xs tracking-wide text-muted-foreground">מכתב לקריאה בלבד</p>
      </div>
      <SharedLetterView
        recipientName={data.recipient_name}
        content={data.letter_content}
        designConfig={data.design_config}
      />
    </div>
  )
}
