import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Clock,
  ChevronRight,
  Sun,
  ShieldCheck,
  Users,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface EcoPointsTransaction {
  id: string;
  description: string;
  category: "venda_direta" | "ead" | "nps" | "equipe";
  points: number;
  type: "in" | "out";
  date: string;
  isVmeExempt: boolean;
}

const MOCK_ECOPOINTS_HISTORY: EcoPointsTransaction[] = [
  {
    id: "pts-101",
    description: "Venda Direta EPC Sistema 42kWp",
    category: "venda_direta",
    points: 850,
    type: "in",
    date: "26/07/2026",
    isVmeExempt: true,
  },
  {
    id: "pts-102",
    description: "Conclusão Curso ANEEL Lei 14.300",
    category: "ead",
    points: 500,
    type: "in",
    date: "24/07/2026",
    isVmeExempt: true,
  },
  {
    id: "pts-103",
    description: "Avaliação NPS 5 Estrelas Cliente Solar",
    category: "nps",
    points: 200,
    type: "in",
    date: "20/07/2026",
    isVmeExempt: true,
  },
  {
    id: "pts-104",
    description: "Volume de Vendas da Equipe MMN (Cap VME 40%)",
    category: "equipe",
    points: 1200,
    type: "in",
    date: "18/07/2026",
    isVmeExempt: false,
  },
];

export function ConsultantEcoPointsBalance() {
  const history = MOCK_ECOPOINTS_HISTORY;
  const personalBalance = 1550; // 100% Livre VME
  const teamBalance = 1200; // VME 40% Aplicado
  const totalBalance = personalBalance + teamBalance;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Award className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ECOPOINTS HUB V11.0</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Saldo de EcoPoints</h1>
          <p className="text-xs text-slate-400">Moeda Digital de Gamificação & Prêmios</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Total Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/40 text-center space-y-1 relative">
              <Badge variant="sun" className="text-[10px]">
                SALDO TOTAL PARA RESGATE
              </Badge>
              <strong className="text-3xl font-black text-amber-400 block font-mono tracking-tight glow-amber">
                {totalBalance.toLocaleString()} PTS
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">Pronto para troca por iPads, Drones e Viagens</span>
            </div>

            {/* Points Origin Breakdown Grid (PLAN 35D) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Personal Points (0% VME) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-400" /> Pessoais
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[8px]">
                    0% VME
                  </Badge>
                </div>
                <strong className="text-sm font-bold text-emerald-400 font-mono block">
                  +{personalBalance.toLocaleString()} PTS
                </strong>
                <span className="text-[9px] text-slate-500 block font-mono">Vendas + EAD + NPS</span>
              </div>

              {/* Team Points (40% VME) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3 text-amber-400" /> Equipe MMN
                  </span>
                  <Badge variant="outline" className="text-[8px] border-amber-400/40 text-amber-400">
                    VME 40%
                  </Badge>
                </div>
                <strong className="text-sm font-bold text-amber-400 font-mono block">
                  +{teamBalance.toLocaleString()} PTS
                </strong>
                <span className="text-[9px] text-slate-500 block font-mono">Volume 7 Níveis</span>
              </div>
            </div>

            {/* Transaction History List */}
            <div className="space-y-2 pt-1">
              <h3 className="font-bold text-xs text-slate-300 flex items-center justify-between">
                <span>Histórico de Extrato</span>
                <span className="text-[10px] font-mono text-slate-500">{history.length} Lançamentos</span>
              </h3>

              <div className="space-y-2">
                {history.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-[11px] block truncate max-w-[160px]">
                          {tx.description}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-400">{tx.date}</span>
                          <span
                            className={cn(
                              "text-[8px] font-mono px-1 rounded",
                              tx.isVmeExempt
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            )}
                          >
                            {tx.isVmeExempt ? "LIVRE VME" : "CAP VME 40%"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <strong className="text-xs font-extrabold text-emerald-400 font-mono">
                      +{tx.points} PTS
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
