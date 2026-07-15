import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Mail, CheckCircle2, TrendingUp, Plus, Upload } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">לוח בקרה</h1>
          <p className="text-sm text-muted-foreground">סקירה כללית של פעילות הכתיבה שלך</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ms-1" />
            ייבוא נתונים
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 ms-1" />
            צור קבוצה
          </Button>
        </div>
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
        <CardHeader>
          <CardTitle className="text-base">הקבוצות שלי</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {mockGroups.map((g) => {
            const people = mockPeople.filter((p) => p.groupId === g.id);
            const done = people.filter((p) => p.status === "completed").length;
            return (
              <Link
                key={g.id}
                to="/groups/$groupId"
                params={{ groupId: g.id }}
                className="rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="font-medium">{g.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {done}/{people.length} מכתבים
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
