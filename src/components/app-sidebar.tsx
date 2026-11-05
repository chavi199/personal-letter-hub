import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Library,
  BarChart3,
  Settings as SettingsIcon,
  PenLine,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { WhatsLeft } from "@/components/whats-left";
import { useGroups } from "@/hooks/use-groups";
import { useAllPeople } from "@/hooks/use-people";

const items = [
  { title: "לוח בקרה", url: "/", icon: LayoutDashboard },
  { title: "קבוצות", url: "/groups", icon: Users },
  { title: "ספריית תוכן", url: "/content-library", icon: Library },
  { title: "סטטיסטיקות", url: "/statistics", icon: BarChart3 },
  { title: "הגדרות", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });
  const { data: groups = [] } = useGroups();
  const { data: people = [] } = useAllPeople();

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-white/50">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="rainbow-fill flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft">
            <PenLine className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">מכתבים אישיים</span>
            <span className="text-xs text-muted-foreground">מערכת ניהול</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ניווט</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <WhatsLeft groups={groups} people={people} compact maxItems={3} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
