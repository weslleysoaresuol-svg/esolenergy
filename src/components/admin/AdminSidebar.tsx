import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Globe2,
  BookOpenCheck,
  Landmark,
  FileCheck2,
  Receipt,
  Truck,
  Wrench,
  Users2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  SunMedium,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EsolBrandmarkGliph } from "@/components/brand/EsolBrandmarkGliph";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { title: "DRE Financeiro", href: "/admin/dre", icon: TrendingUp },
  { title: "Overhead & OPEX", href: "/admin/overhead", icon: PieChart },
  { title: "Data Room Governança", href: "/admin/dataroom", icon: ShieldCheck },
  { title: "Expansão Global", href: "/admin/expansion", icon: Globe2 },
  { title: "Ledger Contábil", href: "/admin/ledger", icon: BookOpenCheck },
  { title: "BaaS Banking & PIX", href: "/admin/banking", icon: Landmark },
  { title: "Auditoria Fiscal eNotas", href: "/admin/fiscal", icon: FileCheck2 },
  { title: "Auto-Faturamento & RPA", href: "/admin/partner-tax", icon: Receipt },
  { title: "Engenharia EPC & Logística", href: "/admin/epc", icon: Truck },
  { title: "Pós-Vendas & O&M", href: "/admin/om", icon: Wrench },
  { title: "CRM & Leads Routing", href: "/admin/crm", icon: Users2 },
  { title: "Control Center Flags", href: "/admin/feature-flags", icon: SlidersHorizontal },
  { title: "Brand Kit & Design System", href: "/admin/brand-kit", icon: SunMedium },
];

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "h-screen bg-card/80 backdrop-blur-xl border-r border-border/60 flex flex-col transition-all duration-300 z-40 dark:bg-slate-950/90 dark:border-slate-800/80",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/60">
        <Link to="/admin" className="flex items-center gap-3 group overflow-hidden">
          {collapsed ? (
            <EsolBrandmarkGliph size={36} badgeColor="amber" />
          ) : (
            <EsolLogoPrimary width={160} height={40} showTagline={false} />
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 rounded-lg hover:bg-accent"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
                isActive
                  ? "bg-amber-400/15 text-amber-500 font-bold glow-amber dark:bg-amber-400/20 dark:text-amber-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-amber-500")} />

              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l-full bg-amber-400 glow-amber"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-border/50">
        <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/40", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/40 glow-emerald">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">Diretoria Executiva</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@esolenergy.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
