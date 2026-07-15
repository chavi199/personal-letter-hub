import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPersonById,
  getGroupById,
  mockContentLibrary,
  statusLabels,
} from "@/lib/mock-data";

export const Route = createFileRoute("/letter/$personId")({
  loader: ({ params }) => {
    const person = getPersonById(params.personId);
    if (!person) throw notFound();
    const group = getGroupById(person.groupId);
    return { person, group };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `מכתב ל${loaderData.person.name}` : "עורך מכתבים",
      },
      { name: "description", content: "עורך מכתבים אישי." },
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
      <p className="text-sm text-muted-foreground">האדם לא נמצא.</p>
      <Link to="/groups" className="text-sm text-primary underline">
        חזרה לקבוצות
      </Link>
    </div>
  ),
  component: LetterEditorPage,
});

function LetterEditorPage() {
  const { person, group } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {group && (
            <Link
              to="/groups/$groupId"
              params={{ groupId: group.id }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="חזרה לקבוצה"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {group && <span>{group.name}</span>}
              <Badge variant="outline">{statusLabels[person.status as keyof typeof statusLabels]}</Badge>
            </div>
          </div>
        </div>
        <Button size="sm">
          <Save className="h-4 w-4 ms-1" />
          שמור
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Content library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">מאגר תוכן</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="openings">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="openings">פתיחות</TabsTrigger>
                <TabsTrigger value="compliments">מחמאות</TabsTrigger>
                <TabsTrigger value="closings">סיומים</TabsTrigger>
              </TabsList>
              {(
                [
                  ["openings", mockContentLibrary.openings],
                  ["compliments", mockContentLibrary.compliments],
                  ["closings", mockContentLibrary.closings],
                ] as const
              ).map(([key, items]) => (
                <TabsContent key={key} value={key} className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full rounded-md border p-2 text-start text-sm hover:bg-accent"
                    >
                      {item.content}
                    </button>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Letter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">המכתב</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              defaultValue={person.letterContent}
              placeholder="בחר פריטים ממאגר התוכן או התחל לכתוב..."
              className="min-h-[500px] resize-none leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Personal card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">כרטיס אישי</CardTitle>
            <p className="text-xs text-muted-foreground">
              המידע אינו מיוצא ואינו מופיע במכתב.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">הערות</Label>
              <Textarea rows={3} defaultValue={person.personalCard.notes} />
            </div>
            <div>
              <Label className="text-xs">רעיונות</Label>
              <Textarea rows={3} defaultValue={person.personalCard.ideas} />
            </div>
            <div>
              <Label className="text-xs">תכונות</Label>
              <Textarea rows={2} defaultValue={person.personalCard.traits} />
            </div>
            <div>
              <Label className="text-xs">מידע אישי</Label>
              <Textarea rows={2} defaultValue={person.personalCard.personalInfo} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
