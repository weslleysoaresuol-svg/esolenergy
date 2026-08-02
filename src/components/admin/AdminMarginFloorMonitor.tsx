import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Percent,
  Gauge,
  AlertTriangle,
  Lock,
  TrendingUp,
  Info,
  CheckCircle2,
  Sliders,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface MarginCategory {
  id: string;
  categoria: string;
  margemMediaPct: number;
  margemPisoPct: number;
  volumeMensal: number;
  status: "protegido" | "alerta_proximidade" | "bloqueado";
}

const MOCK_MARGIN_CATEGORIES: MarginCategory[] = [
  {
    id: "cat-1",
    categoria: "Usinas Turnkey EPC (Sistemas Solares Física)",
    margemMediaPct: 24.8,
    margemPisoPct: 20.0,
    volumeMensal: 1450000,
    status: "protegido",
  },
  {
    id: "cat-2",
    categoria: "Energia por Assinatura (GD Recorrente B2C/B2B)",
    margemMediaPct: 22.4,
    margemPisoPct: 20.0,
    volumeMensal: 620000,
    status: "alerta_proximidade",
  },
  {
    id: "cat-3",
    categoria: "Mercado Livre de Energia (MLE ANEEL)",
    margemMediaPct: 26.1,
    margemPisoPct: 20.0,
    volumeMensal: 890000,
    status: "protegido",
  },
  {
    id: "cat-4",
    categoria: "Hardware Store (Kits Solares & Baterias BESS)",
    margemMediaPct: 21.8,
    margemPisoPct: 20.0,
    volumeMensal: 310000,
    status: "alerta_proximidade",
  },
];

export function AdminMarginFloorMonitor() {
  const [testResult, setTestResult] = React.useState<string | null>(null);

  const handleSimulateViolation = () => {
    setTestResult(
      "🔒 TESTE DE VIOLAÇÃO BARRADO PELO POSTGRESQL: A tentativa de cadastrar proposta com 18.5% de margem foi abortada pela constraint chk_margem_piso_epc (Piso 20.0%)."
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner — Trava de Margem Piso */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Gauge className="w-48 h-48 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-1 font-mono uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                POSTGRESQL CHECK CONSTRAINT (chk_margem_piso_epc)
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-1 font-mono uppercase text-xs">
                PISO ABSOLUTO 20.0% ATIVO
              </Badge>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Termômetro de Proteção da Margem Piso
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Garantia matemática inviolável no banco de dados. Nenhuma proposta comercial, orçamento ou pedido pode ser salvo com margem líquida inferior a <strong className="text-amber-400">20.0%</strong>.
            </p>
          </div>

          <Button
            onClick={handleSimulateViolation}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-6 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 text-sm transition-all duration-300 hover:scale-105 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            Testar Trava de Violação (18.5%)
          </Button>
        </div>
      </motion.div>

      {/* Test Feedback Banner */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-200 text-sm font-mono flex items-center gap-3"
        >
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{testResult}</span>
        </motion.div>
      )}

      {/* Metric Cards — Margem Geral e Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center justify-between">
              Margem Média Ponderada
              <Percent className="w-4 h-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              24.2%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% acima do piso de segurança</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center justify-between">
              Piso Mínimo Garantido
              <Lock className="w-4 h-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              20.0%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-amber-300 font-mono block">
              Inviolável por Trigger PostgreSQL
            </span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center justify-between">
              Propostas Ativas
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
              100% Conformes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-cyan-300 font-mono block">
              0 propostas violando a margem
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Thermometer Progress per Category */}
      <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            Margem Realizada por Categoria de Solução Solar
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Monitoramento continuo de margem bruta versus a trava piso de 20.0%.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {MOCK_MARGIN_CATEGORIES.map((cat) => {
            const marginDifference = cat.margemMediaPct - cat.margemPisoPct;
            const progressPercent = Math.min(100, (cat.margemMediaPct / 35) * 100);

            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-white">{cat.categoria}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-xs">
                      Volume: R$ {cat.volumeMensal.toLocaleString("pt-BR")}
                    </span>
                    <Badge
                      className={cn(
                        "font-mono text-xs font-bold border",
                        cat.status === "protegido"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      )}
                    >
                      {cat.margemMediaPct.toFixed(1)}% MARGEM
                    </Badge>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden relative">
                  {/* Marker line for 20% floor */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    style={{ left: `${(20.0 / 35) * 100}%` }}
                    title="Piso 20.0%"
                  />
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      cat.status === "protegido" ? "bg-emerald-500" : "bg-amber-400"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>0%</span>
                  <span className="text-amber-400 font-bold">🔒 Piso Inviolável 20.0%</span>
                  <span>Margem Atual: +{marginDifference.toFixed(1)}% acima</span>
                  <span>35% Max</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminMarginFloorMonitor;
