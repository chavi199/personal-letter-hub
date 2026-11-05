import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Library, Search, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/hooks/use-groups";
import { useAllPeople } from "@/hooks/use-people";
import { useContentItems } from "@/hooks/use-content";
import type { LetterStatus } from "@/lib/supabase";

const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "טיוטה",
  completed: "הושלם",
};

const contentTypeLabels = {
  opening: "פתיחה",
  compliment: "מחמאה",
  closing: "סיום",
} as const;

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

interface GlobalSearchProps {
  /** Show header trigger button */
  showTrigger?: boolean;
}

export function GlobalSearch({ showTrigger = true }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: groups = [] } = useGroups();
  const { data: people = [] } = useAllPeople();
  const { data: contentItems = [] } = useContentItems();
  const modKey = isMacPlatform() ? "⌘" : "Ctrl";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const groupNameById = new Map(groups.map((g) => [g.id, g.name]));

  return (
    <>
      {showTrigger ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-9 gap-2 border-white/70 bg-card/70 text-muted-foreground shadow-none hover:bg-accent/60"
          aria-label="חיפוש מהיר"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">חיפוש…</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            {modKey}+K
          </kbd>
        </Button>
      ) : null}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="חיפוש קבוצות, אנשים או תוכן…" />
        <CommandList>
          <CommandEmpty>לא נמצאו תוצאות. נסו מילה אחרת.</CommandEmpty>

          <CommandGroup heading="קבוצות">
            {groups.length === 0 ? (
              <CommandItem disabled value="no-groups">
                אין קבוצות עדיין
              </CommandItem>
            ) : (
              groups.map((g) => (
                <CommandItem
                  key={g.id}
                  value={`קבוצה ${g.name}`}
                  onSelect={() =>
                    go(() =>
                      navigate({ to: "/groups/$groupId", params: { groupId: g.id } }),
                    )
                  }
                >
                  <Users className="opacity-70" />
                  <span>{g.name}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="אנשים">
            {people.length === 0 ? (
              <CommandItem disabled value="no-people">
                אין אנשים עדיין
              </CommandItem>
            ) : (
              people.map((p) => {
                const groupName = groupNameById.get(p.group_id) ?? "";
                return (
                  <CommandItem
                    key={p.id}
                    value={`אדם ${p.name} ${groupName} ${statusLabels[p.status]}`}
                    onSelect={() =>
                      go(() =>
                        navigate({
                          to: "/letter/$personId",
                          params: { personId: p.id },
                        }),
                      )
                    }
                  >
                    <FileText className="opacity-70" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[40%]">
                      {groupName}
                      {groupName ? " · " : ""}
                      {statusLabels[p.status]}
                    </span>
                  </CommandItem>
                );
              })
            )}
          </CommandGroup>

          {contentItems.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="ספריית תוכן">
                {contentItems.slice(0, 40).map((item) => {
                  const preview =
                    item.content.length > 48
                      ? `${item.content.slice(0, 48)}…`
                      : item.content;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`תוכן ${contentTypeLabels[item.type]} ${item.content} ${item.category ?? ""}`}
                      onSelect={() =>
                        go(() => navigate({ to: "/content-library" }))
                      }
                    >
                      <Library className="opacity-70" />
                      <span className="flex-1 truncate">{preview}</span>
                      <span className="text-xs text-muted-foreground">
                        {contentTypeLabels[item.type]}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
