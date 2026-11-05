import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Trash2,
  Pencil,
  Loader2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import {
  useContentItems,
  useCreateContentItem,
  useUpdateContentItem,
  useDeleteContentItem,
  useDeleteContentItems,
  useImportContentItems,
} from "@/hooks/use-content";
import type { DbContentItem } from "@/lib/supabase";

type ContentType = "opening" | "compliment" | "closing";

const lastImportKey = "letter-hub:last-content-import";

function readLastImport(type: ContentType): string[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(lastImportKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { type?: ContentType; ids?: string[] };
    if (parsed.type !== type || !Array.isArray(parsed.ids)) return [];
    return parsed.ids;
  } catch {
    return [];
  }
}

function writeLastImport(type: ContentType, ids: string[]) {
  localStorage.setItem(lastImportKey, JSON.stringify({ type, ids }));
}

function clearLastImport() {
  localStorage.removeItem(lastImportKey);
}

function latestBulkIds(items: DbContentItem[], type: ContentType): string[] {
  const ofType = items
    .filter((item) => item.type === type)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (ofType.length < 2) return [];

  const newestMs = Date.parse(ofType[0].created_at);
  if (!Number.isFinite(newestMs)) return [];

  const batch: string[] = [];
  for (const item of ofType) {
    const createdMs = Date.parse(item.created_at);
    if (!Number.isFinite(createdMs) || newestMs - createdMs > 5000) break;
    batch.push(item.id);
  }
  return batch.length > 1 ? batch : [];
}

const typeLabels: Record<ContentType, string> = {
  opening: "פתיחות",
  compliment: "מחמאות",
  closing: "סיומים",
};

export const Route = createFileRoute("/content-library")({
  head: () => ({
    meta: [
      { title: "ספריית תוכן — מכתבים אישיים" },
      { name: "description", content: "ניהול פתיחות, מחמאות וסיומים." },
    ],
  }),
  component: ContentLibraryPage,
});

function ContentLibraryPage() {
  const { data: allItems = [], isLoading } = useContentItems();
  const createItem = useCreateContentItem();
  const updateItem = useUpdateContentItem();
  const deleteItem = useDeleteContentItem();
  const deleteItems = useDeleteContentItems();
  const importItems = useImportContentItems();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ContentType>("opening");
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DbContentItem | null>(null);
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DbContentItem | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const undoTarget = useMemo(() => {
    const candidates = (["opening", "compliment", "closing"] as ContentType[])
      .map((type) => {
        const stored = readLastImport(type).filter((id) =>
          allItems.some((item) => item.id === id),
        );
        const ids = stored.length > 0 ? stored : latestBulkIds(allItems, type);
        const newest = allItems
          .filter((item) => ids.includes(item.id))
          .reduce((latest, item) => (item.created_at > latest ? item.created_at : latest), "");
        return { type, ids, newest };
      })
      .filter((candidate) => candidate.ids.length > 0)
      .sort((a, b) => b.newest.localeCompare(a.newest));
    return candidates[0] ?? null;
  }, [allItems]);

  const filtered = allItems.filter(
    (item) =>
      item.type === activeTab &&
      (search === "" ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        (item.category ?? "").toLowerCase().includes(search.toLowerCase())),
  );

  const openAdd = () => {
    setEditingItem(null);
    setFormContent("");
    setFormCategory("");
    setAddOpen(true);
  };

  const openEdit = (item: DbContentItem) => {
    setEditingItem(item);
    setFormContent(item.content);
    setFormCategory(item.category ?? "");
    setAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = formContent.trim();
    if (!content) return;
    const category = formCategory.trim() || undefined;

    if (editingItem) {
      await updateItem.mutateAsync(
        { id: editingItem.id, content, category },
        {
          onSuccess: () => toast.success("הפריט עודכן"),
          onError: () => toast.error("שגיאה בעדכון"),
        },
      );
    } else {
      await createItem.mutateAsync(
        { type: activeTab, content, category },
        {
          onSuccess: () => toast.success("הפריט נוסף"),
          onError: () => toast.error("שגיאה בהוספה"),
        },
      );
    }
    setAddOpen(false);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const items = lines.map((line) => {
      const [content, category] = line.split(",").map((s) => s.trim());
      return { content, category };
    });
    try {
      const created = await importItems.mutateAsync({ type: activeTab, items });
      writeLastImport(activeTab, created.map((item) => item.id));
      toast.success(`יובאו ${created.length} פריטים`, {
        action: {
          label: "בטל ייבוא",
          onClick: () => setUndoOpen(true),
        },
      });
    } catch {
      toast.error("שגיאה בייבוא");
    }
    e.target.value = "";
  };

  const confirmUndoImport = async () => {
    const ids = undoTarget?.ids ?? [];
    if (ids.length === 0) return;
    try {
      await deleteItems.mutateAsync(ids);
      clearLastImport();
      toast.success(`הייבוא בוטל, נמחקו ${ids.length} פריטים`);
    } catch {
      toast.error("שגיאה בביטול הייבוא");
    }
    setUndoOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteItem.mutateAsync(deleteTarget.id, {
      onSuccess: () => toast.success("הפריט נמחק"),
      onError: () => toast.error("שגיאה במחיקה"),
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

  const counts = {
    opening: allItems.filter((i) => i.type === "opening").length,
    compliment: allItems.filter((i) => i.type === "compliment").length,
    closing: allItems.filter((i) => i.type === "closing").length,
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importItems.isPending}
          >
            {importItems.isPending ? (
              <Loader2 className="h-4 w-4 ms-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 ms-1" />
            )}
            ייבוא {typeLabels[activeTab]}
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ms-1" />
            הוסף פריט
          </Button>
        </div>
      </div>

      {undoTarget && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
          <p className="text-sm">
            ההעלאה האחרונה הוסיפה {undoTarget.ids.length}{" "}
            {typeLabels[undoTarget.type]}. אפשר למחוק את כולן בבת אחת, בלי למחוק
            שורה-שורה.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 bg-white hover:bg-amber-100"
            onClick={() => setUndoOpen(true)}
            disabled={deleteItems.isPending}
          >
            {deleteItems.isPending ? (
              <Loader2 className="h-4 w-4 ms-1 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4 ms-1" />
            )}
            בטל את ההעלאה האחרונה
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">ניהול המאגר</CardTitle>
            <div className="relative w-64">
              <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש..."
                className="pe-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ContentType)}
          >
            <TabsList>
              <TabsTrigger value="opening">
                פתיחות ({counts.opening})
              </TabsTrigger>
              <TabsTrigger value="compliment">
                מחמאות ({counts.compliment})
              </TabsTrigger>
              <TabsTrigger value="closing">
                סיומים ({counts.closing})
              </TabsTrigger>
            </TabsList>

            {(["opening", "compliment", "closing"] as ContentType[]).map(
              (type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  {filtered.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {search ? "לא נמצאו תוצאות" : `אין ${typeLabels[type]} עדיין.`}
                    </div>
                  ) : (
                    <ul className="divide-y rounded-md border">
                      {filtered.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between gap-3 p-3 text-start"
                        >
                          <div className="min-w-0 flex-1">
                            {item.category && (
                              <Badge variant="outline" className="mb-1">
                                {item.category}
                              </Badge>
                            )}
                            <p className="text-sm">{item.content}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="ערוך"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="מחק"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
              ),
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "עריכת פריט" : `הוסף ${typeLabels[activeTab]}`}
              </DialogTitle>
              <DialogDescription>
                {activeTab === "compliment"
                  ? "ניתן להוסיף גם קטגוריה (אישיות, עבודה, כללי...)"
                  : "הזן את תוכן הפריט."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-content">תוכן</Label>
                <Textarea
                  id="item-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={3}
                  autoFocus
                />
              </div>
              {activeTab === "compliment" && (
                <div className="space-y-2">
                  <Label htmlFor="item-category">קטגוריה (אופציונלי)</Label>
                  <Input
                    id="item-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="לדוגמה: אישיות"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={
                  !formContent.trim() ||
                  createItem.isPending ||
                  updateItem.isPending
                }
              >
                {createItem.isPending || updateItem.isPending
                  ? "שומר..."
                  : editingItem
                    ? "שמור"
                    : "הוסף"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={undoOpen} onOpenChange={setUndoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>לבטל את הייבוא האחרון?</AlertDialogTitle>
            <AlertDialogDescription>
              יימחקו {undoTarget?.ids.length ?? 0} פריטים מהקובץ האחרון שהועלה
              אל {undoTarget ? typeLabels[undoTarget.type] : ""}. פריטים שהיו
              במאגר לפני כן יישארו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>השאר</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUndoImport}
              disabled={deleteItems.isPending}
            >
              {deleteItems.isPending ? "מוחק..." : "מחק את הייבוא"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הפריט?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.content.slice(0, 50)}..." יוסר מהמאגר.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? "מוחק..." : "מחק"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
