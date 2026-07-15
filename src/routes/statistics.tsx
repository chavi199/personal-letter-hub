import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockGroups, mockPeople } from "@/lib/mock-data";

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
  const total = mockPeople.length;
  const completed = mockPeople.filter((p) => p.status === "completed").length;
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
          {mockGroups.map((g) => {
            const people = mockPeople.filter((p) => p.groupId === g.id);
            const done = people.filter((p) => p.status === "completed").length;
            const pct = people.length ? Math.round((done / people.length) * 100) : 0;
            return (
              <div key={g.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-muted-foreground">
                    {done}/{people.length} · {pct}%
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
