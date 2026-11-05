import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div dir="rtl" className="min-h-screen flex w-full bg-transparent">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="relative h-14 flex items-center border-b border-white/60 bg-card/75 px-4 gap-3 backdrop-blur-md">
            <span className="rainbow-line absolute inset-x-0 top-0" />
            <SidebarTrigger />
            <h1 className="text-sm font-medium text-muted-foreground">
              מערכת לניהול מכתבים אישיים
            </h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
}
