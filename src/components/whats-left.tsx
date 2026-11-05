import { Link } from "@tanstack/react-router";
import { Bell, ChevronLeft, FileEdit, Users, CircleDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildReminders, type ReminderItem, type ReminderKind } from "@/lib/reminders";
import type { DbGroup, DbPerson } from "@/lib/supabase";

const kindIcon: Record<ReminderKind, typeof Bell> = {
  drafts: FileEdit,
  group_remaining: Users,
  not_started: CircleDashed,
};

const kindChip: Record<ReminderKind, string> = {
  drafts: "bg-[oklch(0.94_0.07_85)] text-[oklch(0.48_0.12_70)]",
  group_remaining: "bg-[oklch(0.93_0.05_230)] text-[oklch(0.45_0.1_240)]",
  not_started: "bg-[oklch(0.93_0.05_350)] text-[oklch(0.5_0.14_350)]",
};

function ReminderLink({ item, compact }: { item: ReminderItem; compact?: boolean }) {
  const Icon = kindIcon[item.kind];
  const body = (
    <>
      {!compact ? (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${kindChip[item.kind]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div
          className={
            compact
              ? "text-xs font-medium leading-snug line-clamp-2"
              : "text-sm font-medium leading-snug"
          }
        >
          {item.title}
        </div>
        {!compact && item.description ? (
          <div className="mt-0.5 text-xs text-muted-foreground truncate">
            {item.description}
          </div>
        ) : null}
      </div>
      <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </>
  );

  const className = compact
    ? "flex items-start gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent -mx-0.5"
    : "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent/60 -mx-1";

  if (item.href.to === "/groups/$groupId") {
    return (
      <Link
        to="/groups/$groupId"
        params={item.href.params}
        className={className}
      >
        {body}
      </Link>
    );
  }

  if (item.href.to === "/letter/$personId") {
    return (
      <Link
        to="/letter/$personId"
        params={item.href.params}
        className={className}
      >
        {body}
      </Link>
    );
  }

  return (
    <Link to="/groups" className={className}>
      {body}
    </Link>
  );
}

interface WhatsLeftProps {
  groups: DbGroup[];
  people: DbPerson[];
  /** Compact list for sidebar */
  compact?: boolean;
  maxItems?: number;
}

export function WhatsLeft({
  groups,
  people,
  compact = false,
  maxItems,
}: WhatsLeftProps) {
  const reminders = buildReminders(groups, people, {
    maxItems: maxItems ?? (compact ? 4 : 8),
  });

  if (compact) {
    if (reminders.length === 0) return null;
    return (
      <div className="space-y-1 px-1 group-data-[collapsible=icon]:hidden">
        <p className="px-2 text-[11px] font-medium text-muted-foreground">
          מה נשאר לך
        </p>
        <ul className="space-y-0.5">
          {reminders.map((item) => (
            <li key={item.id}>
              <ReminderLink item={item} compact />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[oklch(0.93_0.05_350)] text-[oklch(0.5_0.14_350)]">
          <Bell className="h-4 w-4" />
        </span>
        <div>
          <CardTitle className="text-base">מה נשאר לך</CardTitle>
          <p className="text-xs text-muted-foreground">תזכורות לפי המצב הנוכחי</p>
        </div>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            הכול מסודר — אין מכתבים ממתינים כרגע.
          </p>
        ) : (
          <ul className="divide-y">
            {reminders.map((item) => (
              <li key={item.id}>
                <ReminderLink item={item} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
