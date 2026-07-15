import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Plus, Upload, Search, PenLine, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getGroupById,
  getPeopleByGroup,
  statusLabels,
  type LetterStatus,
} from "@/lib/mock-data";

export const Route = createFileRoute("/groups/$groupId")({
  loader: ({ params }) => {
    const group = getGroupById(params.groupId);
    if (!group) throw notFound();
    return { group };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.group.name} — קבוצה` : "קבוצה" },
      { name: "description", content: "פרטי קבוצה ורשימת האנשים בה." },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="p-4 text-sm text-destructive">
      אירעה שגיאה: {error.message}
      <Button variant="outline" size="sm" className="ms-2" onClick={reset}>
        נסה שוב
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">הקבוצה לא נמצאה.</p>
      <Link to="/groups" className="text-sm text-primary underline">
        חזרה לקבוצות
      </Link>
    </div>
  ),
  component: GroupDetailsPage,
});

const statusVariant: Record<LetterStatus, "secondary" | "outline" | "default"> = {
  not_started: "outline",
  draft: "secondary",
  completed: "default",
};

function GroupDetailsPage() {
  const { group } = Route.useLoaderData();
  const people = getPeopleByGroup(group.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/groups"
            className="text-muted-foreground hover:text-foreground"
            aria-label="חזרה לקבוצות"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
            <p className="text-sm text-muted-foreground">
              {people.length} אנשים בקבוצה
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ms-1" />
            ייבוא אנשים
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 ms-1" />
            הוסף אדם
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="חיפוש אדם..." className="pe-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {people.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <Badge variant={statusVariant[p.status as LetterStatus]} className="mt-1">
                      {statusLabels[p.status as LetterStatus]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/letter/$personId" params={{ personId: p.id }}>
                      <PenLine className="h-4 w-4 ms-1" />
                      כתוב מכתב
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="מחק">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
