import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Upload, Search, PenLine, Trash2, ArrowRight, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fetchGroupById } from "@/lib/api/groups";
import { exportGroupToPDF, exportGroupToWord } from "@/lib/export";
import {
  usePeopleByGroup,
  useCreatePerson,
  useImportPeople,
  useDeletePerson,
} from "@/hooks/use-people";
import type { LetterStatus } from "@/lib/supabase";

const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "בטיוטה",
  completed: "הושלם",
};

const statusVariant: Record<LetterStatus, "secondary" | "outline" | "default"> = {
  not_started: "outline",
  draft: "secondary",
  completed: "default",
};

export const Route = createFileRoute("/groups/$groupId")({
  loader: async ({ params }) => {
    try {
      const group = await fetchGroupById(params.groupId);
      return { group };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.group.name} — קבוצה` : "קבוצה" },
      { name: "description", content: "פרטי קבוצה ורשימת האנשים בה." },
    ],
  }),
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

function GroupDetailsPage() {
  const { group } = Route.useLoaderData();
  const { data: people = [], isLoading } = usePeopleByGroup(group.id);
  const createPerson = useCreatePerson(group.id);
  const importPeople = useImportPeople(group.id);
  const deletePerson = useDeletePerson(group.id);

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    await createPerson.mutateAsync(name, {
      onSuccess: () => {
        toast.success(`${name} נוסף לקבוצה`);
        setNewName("");
        setAddOpen(false);
      },
      onError: () => toast.error("שגיאה בהוספת האדם"),
    });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const names = text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) {
      toast.error("הקובץ ריק או בפורמט שגוי");
      return;
    }
    await importPeople.mutateAsync(names, {
      onSuccess: () => toast.success(`יובאו ${names.length} אנשים`),
      onError: () => toast.error("שגיאה בייבוא הקובץ"),
    });
    e.target.value = "";
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deletePerson.mutateAsync(deleteTarget.id, {
      onSuccess: () => toast.success("האדם נמחק"),
      onError: () => toast.error("שגיאה במחיקה"),
    });
    setDeleteTarget(null);
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleImportCSV}
          />

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ms-1" />
                ייצוא מכתבים
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportGroupToPDF(group.id, group.name)}>
                PDF (הדפסה)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportGroupToWord(group.id, group.name)}>
                Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importPeople.isPending}
          >
            {importPeople.isPending ? (
              <Loader2 className="h-4 w-4 ms-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 ms-1" />
            )}
            ייבוא אנשים
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 ms-1" />
            הוסף אדם
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש אדם..."
          className="pe-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {search ? "לא נמצאו תוצאות" : "אין אנשים בקבוצה. הוסף את הראשון!"}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <Badge
                        variant={statusVariant[p.status as LetterStatus]}
                        className="mt-1"
                      >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="מחק"
                      onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add Person Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>הוסף אדם לקבוצה</DialogTitle>
              <DialogDescription>הזן את שם האדם שברצונך להוסיף.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="person-name">שם</Label>
              <Input
                id="person-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="לדוגמה: ישראל ישראלי"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={!newName.trim() || createPerson.isPending}>
                {createPerson.isPending ? "מוסיף..." : "הוסף"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              המכתב של {deleteTarget?.name} יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deletePerson.isPending}>
              {deletePerson.isPending ? "מוחק..." : "מחק"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
