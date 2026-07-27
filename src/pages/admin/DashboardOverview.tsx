import * as React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  FilePlus,
  ShieldCheck,
  TrendingUp,
  Zap,
  DollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

        {/* Placeholder KPI Container (Preenchido no Plano 20B) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-amber-400/30 bg-card/85 shadow-lg backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Faturamento Bruto
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500 font-bold glow-amber">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">R$ 14.850.200,00</div>
              <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +24,8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-500/30 bg-card/85 shadow-lg backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Potência Instalada
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 font-bold glow-emerald">
                <Zap className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">18,4 MWp</div>
              <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 1.240 Projetos EPC ativos
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-cyan-500/30 bg-card/85 shadow-lg backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Rede MMN Ativa
              </CardTitle>
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500 font-bold glow-cyan">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">3.490 Consultores</div>
              <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Unilevel em 7 Níveis
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-700/80 bg-card/85 shadow-lg backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Status RLS & Ledger
              </CardTitle>
              <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-400">100% OK</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                Partida Dobrada Imutável
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Feed Section */}
        <AdminAuditLogFeed />
      </div>
    </AdminLayout>
  );
}
