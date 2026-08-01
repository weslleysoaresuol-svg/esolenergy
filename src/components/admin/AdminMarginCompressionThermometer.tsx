import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Percent,
  Gauge,
  Info,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface ProductMarginCategory {
  id: string;
  name: string;
  realizedMarginPct: number; // e.g. 24.5%
  targetFloorPct: number; // 20.0%
  safetyBufferPct: number; // 22.0%
  status: "safe" | "warning" | "critical";
  revenueMonthly: number;
}

const MOCK_MARGIN_DATA: ProductMarginCategory[] = [
  {
    id: "prod-1",
    name: "Usinas Turnkey EPC (Sistemas Solares)",
    realizedMarginPct: 23.8,
    targetFloorPct: 20.0,
    safetyBufferPct: 22.0,
    status: "safe",
    revenueMonthly: 1450000,
  },
  {
    id: "prod-2",
    name: "Geracao Distribuida (GD Recorrente)",
    realizedMarginPct: 21.4,
    targetFloorPct: 20.0,
    safetyBufferPct: 22.0,
    status: "warning",
    revenueMonthly: 620000,
  },
  {
    id: "prod-3",
    name: "Mercado Livre de Energia (MLE ANEEL)",
    realizedMarginPct: 25.1,
    targetFloorPct: 20.0,
    safetyBufferPct: 22.0,
    status: "safe",
    revenueMonthly: 890000,
  },
  {
    id: "prod-4",
    name: "Hardware Store (Kits & Microinversores)",
    realizedMarginPct: 19.5,
    targetFloorPct: 20.0,
    safetyBufferPct: 22.0,
    status: "critical",
    revenueMonthly: 310000,
  },
];

export function AdminMarginCompressionThermometer() {
  const [categories, setCategories] = React.useState<ProductMarginCategory[]>(MOCK_MARGIN_DATA);
  const [isAlertSent, setIsAlertSent] = React.useState(false);

  // Calculate Weighted Average Realized Margin
  const totalRevenue = React.useMemo(() => {
    return categories.reduce((acc, item) => acc + item.revenueMonthly, 0);
  }, [categories]);

  const weightedAverageMargin = React.useMemo(() => {
    if (totalRevenue === 0) return 0;
    const totalWeightedMargin = categories.reduce(
      (acc, item) => acc + item.realizedMarginPct * item.revenueMonthly,
      0
    );
    return Math.round((totalWeightedMargin / totalRevenue) * 10) / 10;
  }, [categories, totalRevenue]);

  const overallStatus = React.useMemo(() => {
    if (weightedAverageMargin < 20.0) return "critical";
    if (weightedAverageMargin < 22.0) return "warning";
    return "safe";
  }, [weightedAverageMargin]);

  const handleNotifySuperAdmin = () => {
    setIsAlertSent(true);
    setTimeout(() => setIsAlertSent(false), 4000);
  };

  return (
    <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden font-sans">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-mono font-bold">
              <Gauge className="h-3.5 w-3.5" />
              <span>TERMÔMETRO DE MARGEM MOTOR REVERSO V12.0</span>
            </div>
            <CardTitle className="text-lg font-black text-white tracking-tight">
              Compressão de Margem Realizada vs Piso 20%
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Monitoramento preventivo contra variação no silício, frete e custos do MMN
            </CardDescription>
          </div>

          {/* Status Badge Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3.5 rounded-2xl border text-center font-mono space-y-0.5 min-w-[120px]",
                overallStatus === "safe" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                overallStatus === "warning" && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                overallStatus === "critical" && "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
              )}
            >
              <span className="text-[10px] text-slate-400 font-sans block">MARGEM MÉDIA</span>
              <strong className="text-xl font-black block">{weightedAverageMargin}%</strong>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNotifySuperAdmin}
              className={cn(
                "rounded-2xl border text-xs font-bold gap-2 transition-all cursor-pointer h-12",
                isAlertSent
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              )}
            >
              <BellRing className="h-4 w-4" />
              <span>{isAlertSent ? "Alerta Enviado!" : "Notificar Admin"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Visual Thermometer Bar */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Piso Crítico: 20.0%
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Buffer Segurança: 22.0%
            </span>
            <span className="text-amber-400 font-bold">Realizado: {weightedAverageMargin}%</span>
          </div>

          {/* Progress Track */}
          <div className="h-4 rounded-full bg-slate-900 overflow-hidden relative border border-slate-800 p-0.5">
            <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-rose-500/80 z-10" title="Piso 20%" />
            <div className="absolute left-[65%] top-0 bottom-0 w-0.5 bg-amber-400/80 z-10" title="Buffer 22%" />

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (weightedAverageMargin / 30) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all",
                weightedAverageMargin >= 22.0 && "bg-gradient-to-r from-amber-500 to-emerald-400 shadow-lg glow-emerald",
                weightedAverageMargin >= 20.0 && weightedAverageMargin < 22.0 && "bg-gradient-to-r from-rose-500 to-amber-400 shadow-lg glow-amber",
                weightedAverageMargin < 20.0 && "bg-rose-500 shadow-lg glow-rose animate-pulse"
              )}
            />
          </div>
        </div>

        {/* Categories Breakdown List */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
            Detalhamento por Linha de Produto
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Receita Mês: R$ {(item.revenueMonthly / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="text-right space-y-1 font-mono">
                  <div className="flex items-center gap-1.5 justify-end">
                    <strong className="text-sm font-bold text-white">{item.realizedMarginPct}%</strong>
                    {item.status === "safe" && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                        Seguro
                      </Badge>
                    )}
                    {item.status === "warning" && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
                        Atenção
                      </Badge>
                    )}
                    {item.status === "critical" && (
                      <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] animate-pulse">
                        Comprimido
                      </Badge>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 block">Piso: {item.targetFloorPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
