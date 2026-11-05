import type { DbGroup, DbPerson } from "@/lib/supabase";

export type ReminderKind = "group_remaining" | "drafts" | "not_started";

export interface ReminderItem {
  id: string;
  kind: ReminderKind;
  title: string;
  description?: string;
  href:
    | { to: "/groups/$groupId"; params: { groupId: string } }
    | { to: "/letter/$personId"; params: { personId: string } }
    | { to: "/groups" };
  count: number;
}

/** Build in-app reminders from groups + people only. */
export function buildReminders(
  groups: DbGroup[],
  people: DbPerson[],
  options?: { maxItems?: number },
): ReminderItem[] {
  const maxItems = options?.maxItems ?? 8;
  const items: ReminderItem[] = [];

  const drafts = people.filter((p) => p.status === "draft");
  if (drafts.length > 0) {
    const first = drafts[0];
    items.push({
      id: "drafts",
      kind: "drafts",
      title: `${drafts.length} טיוטות מחכות להשלמה`,
      description:
        drafts.length === 1
          ? first.name
          : `${first.name} ועוד ${drafts.length - 1}`,
      href:
        drafts.length === 1
          ? { to: "/letter/$personId", params: { personId: first.id } }
          : { to: "/groups" },
      count: drafts.length,
    });
  }

  for (const group of groups) {
    const inGroup = people.filter((p) => p.group_id === group.id);
    const remaining = inGroup.filter((p) => p.status !== "completed");
    if (remaining.length === 0 || inGroup.length === 0) continue;

    items.push({
      id: `group-${group.id}`,
      kind: "group_remaining",
      title: `נשארו ${remaining.length} מכתבים בקבוצה ${group.name}`,
      description: `${inGroup.length - remaining.length}/${inGroup.length} הושלמו`,
      href: { to: "/groups/$groupId", params: { groupId: group.id } },
      count: remaining.length,
    });
  }

  const notStarted = people.filter((p) => p.status === "not_started");
  // Surface when there are several not-started and no draft tip already
  if (notStarted.length >= 2 && drafts.length === 0) {
    items.unshift({
      id: "not-started",
      kind: "not_started",
      title: `${notStarted.length} מכתבים עדיין לא התחילו`,
      description: "כדאי להתחיל מהקבוצות עם הכי הרבה ממתינים",
      href: { to: "/groups" },
      count: notStarted.length,
    });
  }

  // Prefer actionable group + draft items; cap list
  return items
    .sort((a, b) => {
      const rank = (k: ReminderKind) =>
        k === "drafts" ? 0 : k === "not_started" ? 1 : 2;
      const r = rank(a.kind) - rank(b.kind);
      if (r !== 0) return r;
      return b.count - a.count;
    })
    .slice(0, maxItems);
}
