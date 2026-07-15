import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Mail, CheckCircle2, TrendingUp, Plus, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockGroups, mockPeople } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const groupsCount = mockGroups.length;
  const peopleCount = mockPeople.length;
  const completed = mockPeople.filter((p) => p.status === "completed").length;
  const progress = peopleCount ? Math.round((completed / peopleCount) * 100) : 0;

  const stats = [
    { label: "קבוצות", value: groupsCount, icon: Users },
    { label: "אנשים", value: peopleCount, icon: Mail },
    { label: "מכתבים שהושלמו", value: completed, icon: CheckCircle2 },
    { label: "אחוז התקדמות", value: `${progress}%`, icon: TrendingUp },
  ];

  const recentGroups = [...mockGroups]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  const dateFormatter = new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">לוח בקרה</h1>
          <p className="text-sm text-muted-foreground">סקירה כללית של פעילות הכתיבה שלך</p>
        </div>
        <Button size="sm" asChild>
          <Link to="/groups">
            <Plus className="h-4 w-4 ms-1" />
            צור קבוצה חדשה
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">התקדמות כללית</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
          <p className="mt-2 text-sm text-muted-foreground">
            {completed} מתוך {peopleCount} מכתבים הושלמו
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">קבוצות אחרונות</CardTitle>
          <Link
            to="/groups"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            כל הקבוצות
          </Link>
        </CardHeader>
        <CardContent>
          {recentGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין קבוצות עדיין.</p>
          ) : (
            <ul className="divide-y">
              {recentGroups.map((g) => {
                const people = mockPeople.filter((p) => p.groupId === g.id);
                const done = people.filter((p) => p.status === "completed").length;
                return (
                  <li key={g.id}>
                    <Link
                      to="/groups/$groupId"
                      params={{ groupId: g.id }}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/50 -mx-2 px-2 rounded-md"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{g.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          נוצר ב־{dateFormatter.format(new Date(g.createdAt))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <span>
                          {done}/{people.length} מכתבים
                        </span>
                        <ChevronLeft className="h-4 w-4" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
