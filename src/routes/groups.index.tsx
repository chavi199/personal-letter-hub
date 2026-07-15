import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockGroups, mockPeople } from "@/lib/mock-data";

export const Route = createFileRoute("/groups/")({
  head: () => ({
    meta: [
      { title: "קבוצות — מכתבים אישיים" },
      { name: "description", content: "ניהול קבוצות של אנשים לכתיבת מכתבים." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">קבוצות</h1>
          <p className="text-sm text-muted-foreground">כל הקבוצות שלך במקום אחד</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ms-1" />
            ייבוא
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 ms-1" />
            צור קבוצה
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockGroups.map((g) => {
          const people = mockPeople.filter((p) => p.groupId === g.id);
          const done = people.filter((p) => p.status === "completed").length;
          return (
            <Link
              key={g.id}
              to="/groups/$groupId"
              params={{ groupId: g.id }}
              className="block"
            >
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-medium">{g.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        נוצרה ב־{g.createdAt}
                      </div>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {people.length} אנשים · {done} מכתבים הושלמו
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
