import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Crown,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Gift,
  AlertCircle,
  Sun,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface CareerProgressData {
  currentRank: string;
  nextRank: string;
  currentPoints: number;
  targetPoints: number;
  activeLinesCount: number;
  targetActiveLines: number;
  maxLegPercentage: number; // VME %
  isVmeCompliant: boolean;
  rewardCashBonus: number;
}

const MOCK_CAREER_DATA: CareerProgressData = {
  currentRank: "Consultor Ouro",
  nextRank: "Consultor Safira",
  currentPoints: 8500,
  targetPoints: 12000,
  activeLinesCount: 3,
  targetActiveLines: 4,
  maxLegPercentage: 35, // 35% is within 40% VME cap
  isVmeCompliant: true,
  rewardCashBonus: 5000.0,
};

export function ConsultantCareerGoalWidget() {
  const data = MOCK_CAREER_DATA;
  const pointsPercentage = Math.round((data.currentPoints / data.targetPoints) * 100);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Crown className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL CAREER GOAL</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Progresso de Graduação</h1>
          <p className="text-xs text-slate-400">Plano de Carreira Unilevel 7 Níveis</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Header Rank Transition Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/30 space-y-2 text-center">
              <Badge variant="sun" className="text-[10px]">
                METAS DO MÊS
              </Badge>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400">{data.currentRank}</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
                <strong className="text-sm font-black text-amber-400 font-mono">{data.nextRank}</strong>
              </div>
            </div>

            {/* Points Progress Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Pontos da Equipe
                </span>
                <span className="text-white font-bold">
                  {data.currentPoints.toLocaleString()} / {data.targetPoints.toLocaleString()} PTS ({pointsPercentage}%)
                </span>
              </div>

              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pointsPercentage}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
                />
              </div>
            </div>

            {/* Sub-Goals Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Active Lines */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3 text-cyan-400" /> Linhas Ativas
                </span>
                <strong className="text-sm font-bold text-white font-mono block">
                  {data.activeLinesCount} / {data.targetActiveLines} Pernas
                </strong>
                <span className="text-[9px] text-emerald-400 block font-mono">Falta 1 para qualificar</span>
              </div>

              {/* VME Cap Status */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Regra VME (40%)
                </span>
                <strong className="text-sm font-bold text-emerald-400 font-mono block">
                  {data.maxLegPercentage}% Perna Máx
                </strong>
                <span className="text-[9px] text-emerald-400 block font-mono">DENTRO DO LIMITE</span>
              </div>
            </div>

            {/* Next Rank Reward Card */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-center">
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Gift className="h-4 w-4" /> Recompensa de Conquista Safira
              </span>
              <strong className="text-xl font-extrabold text-white block font-mono">
                {formatCurrency(data.rewardCashBonus)} no PIX
              </strong>
              <p className="text-[10px] text-slate-400">
                + Troféu de Liderança MMN + Viagem de Incentivo
              </p>
            </div>

            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Ver Estrutura de Linhas na Árvore MMN</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
