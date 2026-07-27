import * as React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Moon, Sun, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminSidebar, ADMIN_NAV_ITEMS } from "./AdminSidebar";
import { AdminNotificationCenter } from "./AdminNotificationCenter";
import { SVGFilters } from "@/components/ui/svg-filters";

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Active page title from route
  const currentNav = ADMIN_NAV_ITEMS.find((item) => item.href === location.pathname);
  const pageTitle = currentNav ? currentNav.title : "Painel Administrativo";

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-amber-400/30 selection:text-amber-500 font-sans antialiased">
      {/* SVG Filter Primitives */}
      <SVGFilters />

      {/* Admin Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Dynamic Glass Header */}
        <header className="h-16 px-6 border-b border-border/60 bg-card/70 backdrop-blur-xl flex items-center justify-between z-30 shrink-0 dark:bg-slate-950/80 dark:border-slate-800/80">
          {/* Left: Breadcrumbs & Page Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{pageTitle}</span>
              <Badge variant="emerald" className="hidden sm:inline-flex text-[10px] uppercase">
                Ambiente Seguro MFA
              </Badge>
            </h1>
          </div>

          {/* Right: Search, Notifications & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Global Quick Search */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar contratos, leads, NFe..."
                className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
              />
            </div>

            {/* Notification Bell */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setNotifOpen(true)}
              className="relative h-9 w-9 rounded-xl border-border/60 hover:bg-accent"
              aria-label="Central de Notificações"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 glow-amber animate-pulse" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border-border/60 hover:bg-accent"
              aria-label="Alternar Tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>RBAC 7 Níveis</span>
            </div>
          </div>
        </header>

        {/* Notification Center Drawer */}
        <AdminNotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}
