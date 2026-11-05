import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Download, CheckCircle2, CircleDashed, FileEdit } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useGroups } from "@/hooks/use-groups";
import { useAllPeople } from "@/hooks/use-people";
import { exportGroupToPDF, exportGroupToWord } from "@/lib/export";
import type { DbPerson, LetterStatus } from "@/lib/supabase";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "סטטיסטיקות — מכתבים אישיים" },
      { name: "description", content: "מעקב אחר התקדמות כתיבת המכתבים." },
    ],
  }),
  component: StatisticsPage,
});

const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "טיוטה",
  completed: "הושלם",
};

const statusChartConfig = {
  not_started: { label: "לא התחיל", color: "oklch(0.72 0.1 350)" },
  draft: { label: "טיוטה", color: "oklch(0.78 0.12 85)" },
  completed: { label: "הושלם", color: "oklch(0.72 0.12 155)" },
} satisfies ChartConfig;

const weeklyChartConfig = {
  added: { label: "נוספו", color: "oklch(0.7 0.1 230)" },
  completedApprox: { label: "הושלמו (קירוב)", color: "oklch(0.72 0.12 155)" },
} satisfies ChartConfig;

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 Sun … 6 Sat — use Sunday as week start for he-IL-ish grouping
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function weekKey(d: Date): string {
  return startOfWeek(d).toISOString().slice(0, 10);
}

function weekLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short" }).format(d);
}

/** Weekly activity approximated from created_at (no updated_at in DB). */
function buildWeeklySeries(people: DbPerson[]) {
  const now = new Date();
  const weeks: { key: string; label: string; added: number; completedApprox: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now);
    ref.setDate(ref.getDate() - i * 7);
    const key = weekKey(ref);
    weeks.push({ key, label: weekLabel(key), added: 0, completedApprox: 0 });
  }

  const byKey = new Map(weeks.map((w) => [w.key, w]));

  for (const p of people) {
    const created = new Date(p.created_at);
    const key = weekKey(created);
    const bucket = byKey.get(key);
    if (bucket) {
      bucket.added += 1;
      // Approximation: completed people counted in their creation week (no status-change timestamp)
      if (p.status === "completed") bucket.completedApprox += 1;
    }
  }

  return weeks;
}

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
  const drafts = allPeople.filter((p) => p.status === "draft").length;
  const notStarted = allPeople.filter((p) => p.status === "not_started").length;
  const remaining = total - completed;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const statusPie = (
    [
      { key: "completed" as const, value: completed },
      { key: "draft" as const, value: drafts },
      { key: "not_started" as const, value: notStarted },
    ] as const
  ).filter((d) => d.value > 0);

  const weekly = buildWeeklySeries(allPeople);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">התפלגות סטטוסים</CardTitle>
            <p className="text-xs text-muted-foreground">מי הושלם, בטיוטה או טרם התחיל</p>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">אין אנשים עדיין.</p>
            ) : (
              <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[240px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                  <Pie
                    data={statusPie.map((d) => ({ ...d, name: statusLabels[d.key] }))}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={52}
                    outerRadius={80}
                    strokeWidth={2}
                  >
                    {statusPie.map((d) => (
                      <Cell key={d.key} fill={`var(--color-${d.key})`} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="key" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">פעילות לפי שבוע</CardTitle>
            <p className="text-xs text-muted-foreground">
              קירוב לפי תאריך יצירה (אין חותמת זמן לעדכון סטטוס במסד)
            </p>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">אין נתונים להצגה.</p>
            ) : (
              <ChartContainer config={weeklyChartConfig} className="aspect-[4/3] max-h-[240px] w-full">
                <BarChart data={weekly} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="added" fill="var(--color-added)" radius={4} />
                  <Bar dataKey="completedApprox" fill="var(--color-completedApprox)" radius={4} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">מפת התקדמות לפי קבוצה</CardTitle>
          <p className="text-xs text-muted-foreground">מי נשאר ומי הושלם בכל קבוצה</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין קבוצות עדיין.</p>
          ) : (
            groups.map((g) => {
              const people = allPeople.filter((p) => p.group_id === g.id);
              const donePeople = people.filter((p) => p.status === "completed");
              const leftPeople = people.filter((p) => p.status !== "completed");
              const done = donePeople.length;
              const pct = people.length ? Math.round((done / people.length) * 100) : 0;

              return (
                <div
                  key={g.id}
                  className="rounded-2xl border border-border/60 bg-background/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      to="/groups/$groupId"
                      params={{ groupId: g.id }}
                      className="font-medium hover:underline"
                    >
                      {g.name}
                    </Link>
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
                            PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportGroupToWord(g.id, g.name)}>
                            Word (.docx)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Progress value={pct} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.12_155)]" />
                        הושלמו ({donePeople.length})
                      </div>
                      {donePeople.length === 0 ? (
                        <p className="text-xs text-muted-foreground">עדיין אין</p>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {donePeople.map((p) => (
                            <li key={p.id}>
                              <Link to="/letter/$personId" params={{ personId: p.id }}>
                                <Badge variant="secondary" className="font-normal">
                                  {p.name}
                                </Badge>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <CircleDashed className="h-3.5 w-3.5" />
                        נשארו ({leftPeople.length})
                      </div>
                      {leftPeople.length === 0 ? (
                        <p className="text-xs text-[oklch(0.45_0.1_155)]">הקבוצה הושלמה!</p>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {leftPeople.map((p) => (
                            <li key={p.id}>
                              <Link to="/letter/$personId" params={{ personId: p.id }}>
                                <Badge
                                  variant="outline"
                                  className="font-normal gap-1"
                                >
                                  {p.status === "draft" ? (
                                    <FileEdit className="h-3 w-3 opacity-70" />
                                  ) : null}
                                  {p.name}
                                </Badge>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
