import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Circle, Clock, FileText, Loader2, Palette, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { fetchPersonById } from "@/lib/api/people";
import { fetchGroupById } from "@/lib/api/groups";
import { useUpdatePerson, useUpdateLetterStatus } from "@/hooks/use-people";
import { useContentItems } from "@/hooks/use-content";
import { useAiEditor } from "@/hooks/use-ai-editor";
import { useLetterVersions } from "@/hooks/use-letter-versions";
import { LetterVersionsPanel } from "@/components/letter-versions-panel";
import { ExportLetterPanel } from "@/components/export-letter-panel";
import { LetterDesignPanel } from "@/components/letter-design-panel";
import { defaultDesign, getDesignBorderStyle, type LetterDesignConfig } from "@/lib/design-themes";
import type { DbGroup, DbPerson, LetterStatus } from "@/lib/supabase";

const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "בטיוטה",
  completed: "הושלם",
};

export const Route = createFileRoute("/letter/$personId")({
  loader: async ({ params }) => {
    try {
      const person = await fetchPersonById(params.personId);
      const group = await fetchGroupById(person.group_id);
      return { person, group };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `מכתב ל${loaderData.person.name}` : "עורך מכתבים",
      },
      { name: "description", content: "עורך מכתבים אישי." },
    ],
  }),
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

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function LetterEditorPage() {
  const { person: initialPerson, group } = Route.useLoaderData();
  const { data: contentItems = [] } = useContentItems();
  const updatePerson = useUpdatePerson(initialPerson.id, initialPerson.group_id);
  const updateStatus = useUpdateLetterStatus(initialPerson.id, initialPerson.group_id);

  // Local state for all editable fields
  const [letterContent, setLetterContent] = useState(initialPerson.letter_content);
  const [notes, setNotes] = useState(initialPerson.personal_notes);
  const [ideas, setIdeas] = useState(initialPerson.personal_ideas);
  const [traits, setTraits] = useState(initialPerson.personal_traits);
  const [personalInfo, setPersonalInfo] = useState(initialPerson.personal_info);
  const [status, setStatus] = useState<LetterStatus>(initialPerson.status);
  const [saving, setSaving] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [designConfig, setDesignConfig] = useState<LetterDesignConfig>(defaultDesign);
  const aiEditor = useAiEditor();
  const { data: versions = [] } = useLetterVersions(initialPerson.id);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced values (500ms) — auto-save
  const debouncedLetter = useDebounce(letterContent, 500);
  const debouncedNotes = useDebounce(notes, 500);
  const debouncedIdeas = useDebounce(ideas, 500);
  const debouncedTraits = useDebounce(traits, 500);
  const debouncedInfo = useDebounce(personalInfo, 500);

  // Track first render to avoid saving on mount
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    setSaving(true);
    updatePerson.mutate(
      {
        letter_content: debouncedLetter,
        personal_notes: debouncedNotes,
        personal_ideas: debouncedIdeas,
        personal_traits: debouncedTraits,
        personal_info: debouncedInfo,
      },
      {
        onSettled: () => setSaving(false),
        onError: () => toast.error("שגיאה בשמירה"),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLetter, debouncedNotes, debouncedIdeas, debouncedTraits, debouncedInfo]);

  const insertContent = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setLetterContent((prev) => prev + (prev ? "\n" : "") + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = letterContent.slice(0, start);
    const after = letterContent.slice(end);
    const separator = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const updated = before + separator + text + "\n" + after;
    setLetterContent(updated);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = (before + separator + text + "\n").length;
      ta.setSelectionRange(pos, pos);
    });
  }, [letterContent]);

  const handleStatusChange = async (newStatus: LetterStatus) => {
    setStatus(newStatus);
    await updateStatus.mutateAsync(newStatus, {
      onSuccess: () => toast.success(`סטטוס עודכן: ${statusLabels[newStatus]}`),
      onError: () => toast.error("שגיאה בעדכון הסטטוס"),
    });
  };

  const openings = contentItems.filter((i) => i.type === "opening");
  const compliments = contentItems.filter((i) => i.type === "compliment");
  const closings = contentItems.filter((i) => i.type === "closing");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/groups/$groupId"
            params={{ groupId: group.id }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="חזרה לקבוצה"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{initialPerson.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{group.name}</span>
              <Badge variant="outline">{statusLabels[status]}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              שומר...
            </span>
          )}

          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <Printer className="h-4 w-4 ms-1" />
            הדפס / ייצא
          </Button>

          <Button variant="outline" size="sm" onClick={() => setDesignOpen(true)}>
            <Palette className="h-4 w-4 ms-1" />
            עיצוב
          </Button>

          <Button variant="outline" size="sm" onClick={() => setVersionsOpen(true)}>
            <Clock className="h-4 w-4 ms-1" />
            גרסאות{versions.length > 0 && ` (${versions.length})`}
          </Button>

          {/* Status selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {status === "completed" ? (
                  <CheckCircle className="h-4 w-4 ms-1 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 ms-1" />
                )}
                {statusLabels[status]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("not_started")}>
                לא התחיל
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                בטיוטה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                הושלם
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`grid gap-4 ${aiEditor.state === "review" ? "lg:grid-cols-[280px_1fr_1fr]" : "lg:grid-cols-[280px_1fr_280px]"}`}>
        {/* Content library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">מאגר תוכן</CardTitle>
            <p className="text-xs text-muted-foreground">לחץ להוספה למכתב</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="opening">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="opening">פתיחות</TabsTrigger>
                <TabsTrigger value="compliment">מחמאות</TabsTrigger>
                <TabsTrigger value="closing">סיומים</TabsTrigger>
              </TabsList>

              {[
                { key: "opening", items: openings },
                { key: "compliment", items: compliments },
                { key: "closing", items: closings },
              ].map(({ key, items }) => (
                <TabsContent key={key} value={key} className="mt-2 space-y-1.5">
                  {items.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      אין פריטים — הוסף בספריית התוכן
                    </p>
                  ) : (
                    items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => insertContent(item.content)}
                        className="w-full rounded-md border p-2 text-start text-sm hover:bg-accent transition-colors"
                      >
                        {item.category && (
                          <span className="mb-1 block text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        )}
                        {item.content}
                      </button>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Letter */}
        <Card
          className="relative overflow-hidden"
          style={{
            backgroundColor: designConfig.backgroundColor,
            border: getDesignBorderStyle(designConfig) || undefined,
            backgroundImage: designConfig.backgroundImageUrl
              ? `url(${designConfig.backgroundImageUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {designConfig.backgroundImageUrl && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundColor: designConfig.backgroundColor,
                opacity: 1 - (designConfig.backgroundOpacity ?? 0.15),
              }}
            />
          )}
          <div className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm" style={{ color: designConfig.titleColor }}>
                  {aiEditor.state === "review" ? "מקור" : "המכתב"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {designConfig.logoUrl && (
                    <img src={designConfig.logoUrl} alt="לוגו" className="h-7 object-contain" />
                  )}
                  <span className="text-xs text-muted-foreground">{letterContent.length} תווים</span>
                  {aiEditor.state !== "review" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!letterContent.trim() || aiEditor.state === "loading"}
                      onClick={() => aiEditor.run(letterContent)}
                    >
                      {aiEditor.state === "loading" ? (
                        <Loader2 className="h-3.5 w-3.5 ms-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 ms-1 text-purple-500" />
                      )}
                      AI Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                readOnly={aiEditor.state === "review"}
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                placeholder="בחר פריטים ממאגר התוכן או התחל לכתוב..."
                className={`min-h-[500px] resize-none leading-relaxed${aiEditor.state === "review" ? " bg-muted/40" : ""}`}
                style={{
                  backgroundColor: "transparent",
                  color: designConfig.textColor,
                }}
              />
            </CardContent>
          </div>
        </Card>

        {/* AI result (review mode) OR Personal card */}
        {aiEditor.state === "review" ? (
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 text-sm text-purple-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI מעוצב
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={aiEditor.reset}>
                    ביטול
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setLetterContent(aiEditor.formatted);
                      aiEditor.reset();
                    }}
                  >
                    החלף
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={aiEditor.formatted}
                className="min-h-[500px] resize-none border-purple-200 bg-purple-50/40 leading-relaxed"
              />
            </CardContent>
          </Card>
        ) : (
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
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">רעיונות</Label>
                <Textarea
                  rows={3}
                  value={ideas}
                  onChange={(e) => setIdeas(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">תכונות</Label>
                <Textarea
                  rows={2}
                  value={traits}
                  onChange={(e) => setTraits(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">מידע אישי</Label>
                <Textarea
                  rows={2}
                  value={personalInfo}
                  onChange={(e) => setPersonalInfo(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ExportLetterPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        personName={initialPerson.name}
        personId={initialPerson.id}
        currentContent={letterContent}
        designConfig={designConfig}
      />

      <LetterDesignPanel
        open={designOpen}
        onClose={() => setDesignOpen(false)}
        personId={initialPerson.id}
        currentContent={letterContent}
        designConfig={designConfig}
        onDesignChange={setDesignConfig}
      />

      <LetterVersionsPanel
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        personId={initialPerson.id}
        currentContent={letterContent}
        onRestore={(content, designConfig) => {
          setLetterContent(content)
          if (designConfig) setDesignConfig(designConfig)
        }}
      />
    </div>
  );
}
