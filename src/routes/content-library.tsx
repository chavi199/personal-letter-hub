import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockContentLibrary, type ContentItem } from "@/lib/mock-data";

export const Route = createFileRoute("/content-library")({
  head: () => ({
    meta: [
      { title: "ספריית תוכן — מכתבים אישיים" },
      { name: "description", content: "ניהול פתיחות, מחמאות וסיומים." },
    ],
  }),
  component: ContentLibraryPage,
});

function ItemList({ items }: { items: ContentItem[] }) {
  return (
    <ul className="divide-y rounded-md border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0 flex-1">
            {item.category && (
              <Badge variant="outline" className="mb-1">
                {item.category}
              </Badge>
            )}
            <p className="text-sm">{item.content}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="ערוך">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="מחק">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContentLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ספריית תוכן</h1>
          <p className="text-sm text-muted-foreground">
            מאגר הפתיחות, המחמאות והסיומים שלך
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ms-1" />
            ייבוא
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 ms-1" />
            הוסף פריט
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">ניהול המאגר</CardTitle>
            <div className="relative w-64">
              <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="חיפוש..." className="pe-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openings">
            <TabsList>
              <TabsTrigger value="openings">
                פתיחות ({mockContentLibrary.openings.length})
              </TabsTrigger>
              <TabsTrigger value="compliments">
                מחמאות ({mockContentLibrary.compliments.length})
              </TabsTrigger>
              <TabsTrigger value="closings">
                סיומים ({mockContentLibrary.closings.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="openings" className="mt-4">
              <ItemList items={mockContentLibrary.openings} />
            </TabsContent>
            <TabsContent value="compliments" className="mt-4">
              <ItemList items={mockContentLibrary.compliments} />
            </TabsContent>
            <TabsContent value="closings" className="mt-4">
              <ItemList items={mockContentLibrary.closings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
