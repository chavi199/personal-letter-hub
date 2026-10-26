import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGroups } from "@/hooks/use-groups";
import { useAllPeople } from "@/hooks/use-people";
import { exportGroupToPDF, exportGroupToWord } from "@/lib/export";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "סטטיסטיקות — מכתבים אישיים" },
      { name: "description", content: "מעקב אחר התקדמות כתיבת המכתבים." },
    ],
  }),
  component: StatisticsPage,
});


function StatisticsPage() {
  const { data: groups = [], isLoading: loadingGroups } = useGroups();
  const { data: allPeople = [], isLoading: loadingPeople } = useAllPeople();

  if (loadingGroups || loadingPeople) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const total = allPeople.length;
  const completed = allPeople.filter((p) => p.status === "completed").length;
  const remaining = total - completed;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "מכתבים שהושלמו", value: completed },
    { label: "מכתבים שנותרו", value: remaining },
    { label: "אחוז התקדמות", value: `${progress}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">סטטיסטיקות</h1>
        <p className="text-sm text-muted-foreground">מצב ההתקדמות של הכתיבה</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">התקדמות לפי קבוצה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין קבוצות עדיין.</p>
          ) : (
            groups.map((g) => {
              const people = allPeople.filter((p) => p.group_id === g.id);
              const done = people.filter((p) => p.status === "completed").length;
              const pct = people.length ? Math.round((done / people.length) * 100) : 0;
              return (
                <div key={g.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{g.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {done}/{people.length} · {pct}%
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="ייצוא">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => exportGroupToPDF(g.id, g.name)}>
                            PDF (הדפסה)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportGroupToWord(g.id, g.name)}>
                            Word (.docx)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
