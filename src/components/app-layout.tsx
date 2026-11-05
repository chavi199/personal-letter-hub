import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GentleMotifs } from "@/components/gentle-motifs";
import { AmbientSky } from "@/components/sky-decoration";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div dir="rtl" className="relative z-10 min-h-screen flex w-full bg-transparent">
        <AmbientSky />
        <div className="app-sidebar-shell">
          <AppSidebar />
        </div>
        <div className="relative flex-1 flex flex-col min-w-0">
          <GentleMotifs />
          <header className="app-header-chrome relative z-10 h-14 flex items-center border-b border-white/60 bg-card/75 px-4 gap-3 backdrop-blur-md dark:border-white/10">
            <span className="rainbow-line absolute inset-x-0 top-0" />
            <SidebarTrigger />
            <h1 className="text-sm font-medium text-muted-foreground flex-1 truncate">
              מערכת לניהול מכתבים אישיים
            </h1>
            <GlobalSearch />
            <ThemeToggle />
          </header>
          <main className="relative z-10 flex-1 p-6">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
}
