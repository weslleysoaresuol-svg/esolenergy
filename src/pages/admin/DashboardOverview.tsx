import * as React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  FilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardKPICards } from "@/components/admin/DashboardKPICards";
import { AdminAuditLogFeed } from "@/components/admin/AdminAuditLogFeed";

export function DashboardOverview() {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "mes" | "ano">("30d");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Visão Geral Executiva</span>
              <Badge variant="sun" className="text-[10px]">
                LIVE CONTÁBIL
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitoramento consolidado de receita, potência instalada kWp e rede MMN.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1 p-1 bg-background/80 rounded-xl border border-border/60 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-2" />
              {(["7d", "30d", "mes", "ano"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg uppercase transition-all cursor-pointer",
                    period === p
                      ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Exportar DRE</span>
            </Button>

            <Button variant="sun" size="sm" className="gap-2 rounded-xl text-xs text-slate-950 font-bold">
              <FilePlus className="h-3.5 w-3.5" />
              <span>Novo Contrato</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Neomorphic 3D Tilt KPI Cards */}
        <DashboardKPICards />

        {/* Audit Log Feed Section */}
        <AdminAuditLogFeed />
      </div>
    </AdminLayout>
  );
}
