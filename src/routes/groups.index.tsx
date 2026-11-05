import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from "@/hooks/use-groups";
import { useAllPeople } from "@/hooks/use-people";
import type { DbGroup } from "@/lib/supabase";

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
  const { data: groups = [], isLoading } = useGroups();
  const { data: allPeople = [] } = useAllPeople();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DbGroup | null>(null);
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DbGroup | null>(null);

  const openCreate = () => {
    setEditingGroup(null);
    setName("");
    setFormOpen(true);
  };

  const openEdit = (group: DbGroup) => {
    setEditingGroup(group);
    setName(group.name);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editingGroup) {
      await updateGroup.mutateAsync(
        { id: editingGroup.id, name: trimmed },
        {
          onSuccess: () => toast.success("הקבוצה עודכנה"),
          onError: () => toast.error("שגיאה בעדכון הקבוצה"),
        },
      );
    } else {
      await createGroup.mutateAsync(trimmed, {
        onSuccess: () => toast.success("הקבוצה נוצרה"),
        onError: () => toast.error("שגיאה ביצירת הקבוצה"),
      });
    }
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteGroup.mutateAsync(deleteTarget.id, {
      onSuccess: () => toast.success("הקבוצה נמחקה"),
      onError: () => toast.error("שגיאה במחיקת הקבוצה"),
    });
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">קבוצות</h1>
          <p className="text-sm text-muted-foreground">
            קבוצה → אנשים → מכתבים. כאן מתחילים את המסלול
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 ms-1" />
          צור קבוצה חדשה
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="הקבוצה הראשונה מחכה לך"
          description="בחרו שם שמרגיש נכון — למשל משפחה, חברים מהעבודה או כיתה. אחרי זה מוסיפים אנשים וכותבים לכל אחד מכתב אישי."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 ms-1" />
              צור קבוצה ראשונה
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const people = allPeople.filter((p) => p.group_id === g.id);
            const done = people.filter((p) => p.status === "completed").length;
            return (
              <Card key={g.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-lg font-medium truncate">{g.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        נוצרה ב־{g.created_at.slice(0, 10)}
                      </div>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {people.length} אנשים · {done} מכתבים הושלמו
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2 border-t pt-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="ערוך קבוצה"
                        onClick={() => openEdit(g)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="מחק קבוצה"
                        onClick={() => setDeleteTarget(g)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/groups/$groupId" params={{ groupId: g.id }}>
                        פתח
                        <ArrowLeft className="h-4 w-4 ms-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "עריכת קבוצה" : "צור קבוצה חדשה"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup
                  ? "עדכן את שם הקבוצה."
                  : "תן שם לקבוצה החדשה שלך."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="group-name">שם הקבוצה</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: משפחה"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={
                  !name.trim() ||
                  createGroup.isPending ||
                  updateGroup.isPending
                }
              >
                {createGroup.isPending || updateGroup.isPending
                  ? "שומר..."
                  : editingGroup
                    ? "שמור"
                    : "צור"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הקבוצה?</AlertDialogTitle>
            <AlertDialogDescription>
              הקבוצה "{deleteTarget?.name}" ומכתביה יוסרו לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? "מוחק..." : "מחק"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
