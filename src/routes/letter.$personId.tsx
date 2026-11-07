import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookmarkPlus,
  CheckCircle,
  Circle,
  Clock,
  Focus,
  Loader2,
  Mail,
  NotebookPen,
  Palette,
  Pause,
  PenLine,
  Play,
  Printer,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchPersonById } from "@/lib/api/people";
import { fetchGroupById } from "@/lib/api/groups";
import { useUpdatePerson, useUpdateLetterStatus } from "@/hooks/use-people";
import { useContentItems, useCreateContentItem } from "@/hooks/use-content";
import { useAiEditor } from "@/hooks/use-ai-editor";
import { useLetterVersions } from "@/hooks/use-letter-versions";
import { LetterVersionsPanel } from "@/components/letter-versions-panel";
import { ExportLetterPanel } from "@/components/export-letter-panel";
import { LetterDesignPanel } from "@/components/letter-design-panel";
import { LetterDecor } from "@/components/letter-decor";
import { LivingLetterPaper } from "@/components/living-letter-paper";
import { SoftConfetti } from "@/components/soft-confetti";
import { useSidebar } from "@/components/ui/sidebar";
import {
  defaultDesign,
  fontStack,
  getDesignBorderStyle,
  hasLetterDesign,
  normalizeDesign,
  sizeStyle,
  type LetterDesignConfig,
} from "@/lib/design-themes";
import { readLocalDesign, writeLocalDesign } from "@/lib/letter-design-storage";
import type { LetterStatus } from "@/lib/supabase";

type ContentKind = "opening" | "compliment" | "closing";

const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "בטיוטה",
  completed: "הושלם",
};

const contentKindLabels: Record<ContentKind, string> = {
  opening: "פתיחה",
  compliment: "מחמאה",
  closing: "סיום",
};

const FOCUS_PREF_KEY = "letter-hub-focus-pref";

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

function formatTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function LetterEditorPage() {
  const { person: initialPerson, group } = Route.useLoaderData();
  const { data: contentItems = [] } = useContentItems();
  const createContentItem = useCreateContentItem();
  const updatePerson = useUpdatePerson(initialPerson.id, initialPerson.group_id);
  const updateStatus = useUpdateLetterStatus(initialPerson.id, initialPerson.group_id);
  const { setOpen: setSidebarOpen } = useSidebar();

  const [letterContent, setLetterContent] = useState(initialPerson.letter_content);
  const [notes, setNotes] = useState(initialPerson.personal_notes);
  const [ideas, setIdeas] = useState(initialPerson.personal_ideas);
  const [traits, setTraits] = useState(initialPerson.personal_traits);
  const [personalInfo, setPersonalInfo] = useState(initialPerson.personal_info);
  const [status, setStatus] = useState<LetterStatus>(initialPerson.status);
  const [saving, setSaving] = useState(false);
  const [savedQuietly, setSavedQuietly] = useState(false);
  const [inkPulse, setInkPulse] = useState(false);
  const savedHintTimer = useRef<number | null>(null);
  const [statusCelebrate, setStatusCelebrate] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [personalCardOpen, setPersonalCardOpen] = useState(false);
  const [designConfig, setDesignConfig] = useState<LetterDesignConfig>(normalizeDesign(defaultDesign));
  const [focusMode, setFocusMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const designReady = useRef(false);
  const prevSidebarOpen = useRef(true);
  const aiEditor = useAiEditor();
  const { data: versions = [] } = useLetterVersions(initialPerson.id);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (designReady.current) return;
    const stored = readLocalDesign(initialPerson.id);
    if (stored) {
      designReady.current = true;
      setDesignConfig(stored);
      return;
    }
    const saved = versions.find((version) => hasLetterDesign(version.design_config));
    if (!saved?.design_config) return;
    designReady.current = true;
    const next = normalizeDesign(saved.design_config);
    setDesignConfig(next);
    writeLocalDesign(initialPerson.id, next);
  }, [versions, initialPerson.id]);

  function rememberDesign(next: LetterDesignConfig) {
    designReady.current = true;
    setDesignConfig(next);
    writeLocalDesign(initialPerson.id, next);
  }

  const enterFocusMode = useCallback(() => {
    prevSidebarOpen.current = true;
    setSidebarOpen(false);
    setFocusMode(true);
    document.documentElement.classList.add("focus-mode-root");
    window.localStorage.setItem(FOCUS_PREF_KEY, "1");
  }, [setSidebarOpen]);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
    setTimerRunning(false);
    document.documentElement.classList.remove("focus-mode-root");
    setSidebarOpen(prevSidebarOpen.current);
    window.localStorage.setItem(FOCUS_PREF_KEY, "0");
  }, [setSidebarOpen]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("focus-mode-root");
    };
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitFocusMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, exitFocusMode]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          toast.success("זמן הפוקוס הסתיים — יפה!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Longer pause before autosave — less noise while typing.
  const debouncedLetter = useDebounce(letterContent, 1400);
  const debouncedNotes = useDebounce(notes, 1400);
  const debouncedIdeas = useDebounce(ideas, 1400);
  const debouncedTraits = useDebounce(traits, 1400);
  const debouncedInfo = useDebounce(personalInfo, 1400);

  useEffect(() => {
    return () => {
      if (savedHintTimer.current) window.clearTimeout(savedHintTimer.current);
    };
  }, []);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    setSaving(true);
    setSavedQuietly(false);
    if (savedHintTimer.current) window.clearTimeout(savedHintTimer.current);
    updatePerson.mutate(
      {
        letter_content: debouncedLetter,
        personal_notes: debouncedNotes,
        personal_ideas: debouncedIdeas,
        personal_traits: debouncedTraits,
        personal_info: debouncedInfo,
      },
      {
        onSuccess: () => {
          setInkPulse(true);
          window.setTimeout(() => setInkPulse(false), 720);
          // Quiet toolbar hint only — no toast popup while writing.
          setSavedQuietly(true);
          savedHintTimer.current = window.setTimeout(() => setSavedQuietly(false), 2200);
        },
        onSettled: () => setSaving(false),
        onError: () => toast.error("שגיאה בשמירה"),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLetter, debouncedNotes, debouncedIdeas, debouncedTraits, debouncedInfo]);

  const syncSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) {
      setSelectedText("");
      return;
    }
    const text = ta.value.slice(ta.selectionStart, ta.selectionEnd).trim();
    setSelectedText(text);
  }, []);

  const insertContent = useCallback(
    (text: string, kind: ContentKind) => {
      const ta = textareaRef.current;
      const snippet = text.trim();
      if (!snippet) return;

      if (kind === "compliment") {
        if (!ta) {
          setLetterContent((prev) => {
            if (!prev) return snippet;
            return prev + (/\s$/.test(prev) ? "" : " ") + snippet;
          });
          return;
        }
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = letterContent.slice(0, start);
        const after = letterContent.slice(end);
        const lead = before.length > 0 && !/\s$/.test(before) ? " " : "";
        const trail = after.length > 0 && !/^\s/.test(after) ? " " : "";
        const updated = before + lead + snippet + trail + after;
        setLetterContent(updated);
        requestAnimationFrame(() => {
          ta.focus();
          const pos = (before + lead + snippet).length;
          ta.setSelectionRange(pos, pos);
          setSelectedText("");
        });
        return;
      }

      if (!ta) {
        setLetterContent((prev) => prev + (prev ? "\n" : "") + snippet + "\n");
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = letterContent.slice(0, start);
      const after = letterContent.slice(end);
      const separator = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      const updated = before + separator + snippet + "\n" + after;
      setLetterContent(updated);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = (before + separator + snippet + "\n").length;
        ta.setSelectionRange(pos, pos);
        setSelectedText("");
      });
    },
    [letterContent],
  );

  const saveSelectionToBank = useCallback(
    (kind: ContentKind) => {
      const text = selectedText.trim();
      if (!text) {
        toast.error("סמנו קודם מילים במכתב");
        return;
      }
      createContentItem.mutate(
        { type: kind, content: text },
        {
          onSuccess: () => {
            toast.success(`נשמר למאגר כ${contentKindLabels[kind]}`);
            setSelectedText("");
          },
          onError: () => toast.error("שגיאה בשמירה למאגר"),
        },
      );
    },
    [createContentItem, selectedText],
  );

  const handleStatusChange = async (newStatus: LetterStatus) => {
    setStatus(newStatus);
    await updateStatus.mutateAsync(newStatus, {
      onSuccess: () => {
        if (newStatus === "completed") {
          setStatusCelebrate(true);
          toast.success("המכתב הושלם! ✨", { duration: 2800 });
        } else {
          toast.success(`סטטוס עודכן: ${statusLabels[newStatus]}`);
        }
      },
      onError: () => toast.error("שגיאה בעדכון הסטטוס"),
    });
  };

  const openings = contentItems.filter((i) => i.type === "opening");
  const compliments = contentItems.filter((i) => i.type === "compliment");
  const closings = contentItems.filter((i) => i.type === "closing");
  const hasPersonalNotes = Boolean(notes.trim() || ideas.trim() || traits.trim() || personalInfo.trim());

  const letterCard = (
    <LivingLetterPaper
      interactive
      inkPulse={inkPulse}
      className="relative overflow-hidden rounded-2xl border border-white/70 bg-card text-card-foreground backdrop-blur-md dark:border-white/10"
      style={{
        backgroundColor: designConfig.backgroundColor,
        border: getDesignBorderStyle(designConfig) || undefined,
        fontFamily: fontStack(designConfig.fontFamily),
        backgroundImage: designConfig.backgroundImageUrl
          ? `url(${designConfig.backgroundImageUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <LetterDecor design={designConfig} />
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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
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
          {aiEditor.state !== "review" && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              כתבו בחופשיות · סמנו מילים לשמירה למאגר · מחמאות נכנסות באותה שורה
            </p>
          )}
          {!letterContent.trim() && aiEditor.state !== "review" && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                התחילו מפתיחה מהמאגר, או כתבו ישירות. הערות אישיות נפתחות בלחיצה על ״כרטיס אישי״.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => textareaRef.current?.focus()}
              >
                <PenLine className="h-3.5 w-3.5 ms-1" />
                התחל לכתוב
              </Button>
            </div>
          )}
          {selectedText && aiEditor.state !== "review" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-background/80 p-2 shadow-sm backdrop-blur">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <BookmarkPlus className="h-3.5 w-3.5" />
                שמור בחירה כ־
              </span>
              {(["opening", "compliment", "closing"] as ContentKind[]).map((kind) => (
                <Button
                  key={kind}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={createContentItem.isPending}
                  onClick={() => saveSelectionToBank(kind)}
                >
                  {contentKindLabels[kind]}
                </Button>
              ))}
              <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedText("")}>
                ביטול
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            readOnly={aiEditor.state === "review"}
            value={letterContent}
            onChange={(e) => {
              setLetterContent(e.target.value);
              syncSelection();
            }}
            onSelect={syncSelection}
            onKeyUp={syncSelection}
            onMouseUp={syncSelection}
            placeholder={"כתבו כאן בנחת...\nאפשר לבחור פתיחה מהמאגר, ואז להוסיף מחמאות בתוך המשפט."}
            className={`write-presence-caret min-h-[560px] resize-none border-0 bg-transparent px-1 py-2 leading-[1.9] shadow-none focus-visible:ring-0${aiEditor.state === "review" ? " bg-muted/40" : ""}`}
            style={{
              backgroundColor: "transparent",
              color: designConfig.textColor,
              fontFamily: "inherit",
              fontSize: sizeStyle(designConfig.fontSize).fontSize,
              lineHeight: sizeStyle(designConfig.fontSize).lineHeight,
              textAlign: designConfig.align ?? "right",
            }}
          />
        </CardContent>
      </div>
    </LivingLetterPaper>
  );

  return (
    <div className="space-y-4">
      {focusMode && (
        <div className="focus-mode-banner">
          <div className="flex items-center gap-3">
            <Focus className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">מצב פוקוס</div>
              <div className="text-xs text-muted-foreground">Esc ליציאה · טיימר אופציונלי</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="tabular-nums text-sm font-medium">{formatTimer(timerSeconds)}</span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={timerRunning ? "השהה טיימר" : "התחל טיימר"}
              onClick={() => setTimerRunning((v) => !v)}
            >
              {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="איפוס טיימר"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(25 * 60);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exitFocusMode}>
              <X className="h-4 w-4 ms-1" />
              יציאה
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {!focusMode && (
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
            <h1 className="text-2xl font-semibold tracking-tight">
              מכתב ל{initialPerson.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{group.name}</span>
              <Badge
                variant="outline"
                className={statusCelebrate || status === "completed" ? "status-celebrate border-green-400/60 text-green-700 dark:text-green-300" : ""}
              >
                {statusLabels[status]}
              </Badge>
              <span className="text-xs">כתיבה → שמירת גרסה → עיצוב → ייצוא</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 flex-wrap">
          <SoftConfetti active={statusCelebrate} onDone={() => setStatusCelebrate(false)} />
          {saving ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              שומר...
            </span>
          ) : savedQuietly ? (
            <span className="text-xs text-muted-foreground">נשמר</span>
          ) : null}

          {!focusMode && (
            <Button variant="outline" size="sm" onClick={enterFocusMode}>
              <Focus className="h-4 w-4 ms-1" />
              מצב פוקוס
            </Button>
          )}

          {!focusMode && (
            <Button
              variant={personalCardOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPersonalCardOpen(true)}
            >
              <NotebookPen className="h-4 w-4 ms-1" />
              כרטיס אישי
              {hasPersonalNotes && (
                <span className="ms-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          )}

          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="new-feature-chip pe-2.5"
          >
            <Star className="new-feature-chip__star" fill="currentColor" />
            <Star className="new-feature-chip__star" fill="currentColor" />
            <Star className="new-feature-chip__star" fill="currentColor" />
            <Mail className="h-3.5 w-3.5" />
            חדש · אפשרות שליחה במייל
          </button>

          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <Printer className="h-4 w-4 ms-1" />
            הדפס / ייצא
          </Button>

          <Button variant="outline" size="sm" onClick={() => setDesignOpen(true)}>
            <Palette className="h-4 w-4 ms-1" />
            עיצוב
          </Button>

          {!focusMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVersionsOpen(true)}
              title={
                versions.length === 0
                  ? "שמרו גרסה ידנית כדי לשמור ניסוח ולחזור אליו"
                  : `${versions.length} גרסאות שמורות · הטיוטה הנוכחית נשמרת אוטומטית`
              }
            >
              <Clock className="h-4 w-4 ms-1" />
              גרסאות{versions.length > 0 ? ` (${versions.length})` : ""}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={statusCelebrate ? "status-celebrate" : undefined}>
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

      <div
        className={`grid gap-4 ${
          focusMode
            ? "grid-cols-1 max-w-3xl mx-auto"
            : aiEditor.state === "review"
              ? "lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)_minmax(280px,1fr)]"
              : "lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]"
        }`}
      >
        {!focusMode && (
          <Card className="min-h-[640px]">
            <CardHeader>
              <CardTitle className="text-sm">מאגר תוכן</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                פתיחה/סיום יורדים שורה · מחמאה נכנסת באותה שורה
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="opening">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="opening">פתיחות</TabsTrigger>
                  <TabsTrigger value="compliment">מחמאות</TabsTrigger>
                  <TabsTrigger value="closing">סיומים</TabsTrigger>
                </TabsList>

                {(
                  [
                    { key: "opening" as const, items: openings },
                    { key: "compliment" as const, items: compliments },
                    { key: "closing" as const, items: closings },
                  ]
                ).map(({ key, items }) => (
                  <TabsContent key={key} value={key} className="mt-2 max-h-[520px] space-y-1.5 overflow-y-auto pe-1">
                    {items.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        אין פריטים — סמנו מילים במכתב ושמרו למאגר, או הוסיפו בספריית התוכן
                      </p>
                    ) : (
                      items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => insertContent(item.content, key)}
                          className="w-full rounded-md border p-2.5 text-start text-sm hover:bg-accent transition-colors"
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
        )}

        {letterCard}

        {!focusMode &&
          aiEditor.state === "review" && (
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
          )}
      </div>

      <Sheet open={personalCardOpen} onOpenChange={setPersonalCardOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4" />
              כרטיס אישי — {initialPerson.name}
            </SheetTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">
              הערות ורעיונות לעצמך בלבד — לא מופיעים במכתב ולא מיוצאים.
            </p>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto p-4">
            <div>
              <Label className="text-xs">הערות</Label>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">רעיונות</Label>
              <Textarea rows={4} value={ideas} onChange={(e) => setIdeas(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">תכונות</Label>
              <Textarea rows={3} value={traits} onChange={(e) => setTraits(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">מידע אישי</Label>
              <Textarea
                rows={3}
                value={personalInfo}
                onChange={(e) => setPersonalInfo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
        onDesignChange={rememberDesign}
      />

      <LetterVersionsPanel
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        personId={initialPerson.id}
        currentContent={letterContent}
        designConfig={designConfig}
        onRestore={(content, restoredDesign) => {
          setLetterContent(content);
          if (restoredDesign) rememberDesign(normalizeDesign(restoredDesign));
        }}
      />
    </div>
  );
}
