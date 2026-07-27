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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface EcoPointsTransaction {
  id: string;
  description: string;
  category: "venda" | "ead" | "desafio" | "resgate";
  points: number;
  type: "in" | "out";
  date: string;
}

const MOCK_ECOPOINTS_HISTORY: EcoPointsTransaction[] = [
  {
    id: "pts-101",
    description: "Venda EPC Sistema Solar 42kWp",
    category: "venda",
    points: 850,
    type: "in",
    date: "26/07/2026",
  },
  {
    id: "pts-102",
    description: "Conclusão Curso ANEEL Lei 14.300",
    category: "ead",
    points: 400,
    type: "in",
    date: "24/07/2026",
  },
  {
    id: "pts-103",
    description: "Desafio Semanal: 3 Propostas Enviadas",
    category: "desafio",
    points: 200,
    type: "in",
    date: "20/07/2026",
  },
];

export function ConsultantEcoPointsBalance() {
  const history = MOCK_ECOPOINTS_HISTORY;
  const totalBalance = 1450;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Award className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ECOPOINTS HUB</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Saldo de EcoPoints</h1>
          <p className="text-xs text-slate-400">Programa Oficial de Fidelidade & Gamificação</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Total Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/40 text-center space-y-1 relative">
              <Badge variant="sun" className="text-[10px]">
                SALDO TOTAL ACUMULADO
              </Badge>
              <strong className="text-3xl font-black text-amber-400 block font-mono tracking-tight glow-amber">
                {totalBalance.toLocaleString()} PTS
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">Equivalente a R$ 1.450 em Vouchers</span>
            </div>

            {/* Points Breakdown Categories Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <Zap className="h-4 w-4 text-amber-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">Vendas</span>
                <strong className="text-xs font-bold text-white font-mono">+850</strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <GraduationCap className="h-4 w-4 text-purple-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">EAD</span>
                <strong className="text-xs font-bold text-white font-mono">+400</strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <Sparkles className="h-4 w-4 text-emerald-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">Desafios</span>
                <strong className="text-xs font-bold text-white font-mono">+200</strong>
              </div>
            </div>

            {/* Transaction History List */}
            <div className="space-y-2 pt-1">
              <h3 className="font-bold text-xs text-slate-300 flex items-center justify-between">
                <span>Histórico de Pontos</span>
                <span className="text-[10px] font-mono text-slate-500">3 Movimentações</span>
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
                        <span className="text-[9px] font-mono text-slate-400">{tx.date}</span>
                      </div>
                    </div>

                    <strong className="text-xs font-extrabold text-emerald-400 font-mono">
                      +{tx.points} PTS
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <Gift className="h-4 w-4" />
              <span>Resgatar Prêmios no Rank (Plano 27A2b)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
