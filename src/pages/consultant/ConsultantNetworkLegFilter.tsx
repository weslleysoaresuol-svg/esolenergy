import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Zap,
  MessageSquare,
  ArrowRight,
  Sun,
  PieChart,
  CheckCircle2,
  DollarSign,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface DirectLeg {
  id: string;
  legName: string;
  leaderName: string;
  leaderRank: string;
  totalKwp: number;
  pointsGenerated: number;
  percentageOfTotal: number; // e.g. 35%
  isVmeExceeded: boolean; // > 40% for rank qualification
  avatar: string;
}

const MOCK_LEGS: DirectLeg[] = [
  {
    id: "leg-1",
    legName: "Perna A (Gabriel M.)",
    leaderName: "Gabriel Medeiros",
    leaderRank: "Consultor Prata",
    totalKwp: 64.5,
    pointsGenerated: 2975,
    percentageOfTotal: 35, // 35% < 40% VME Cap -> OK
    isVmeExceeded: false,
    avatar: "GM",
  },
  {
    id: "leg-2",
    legName: "Perna B (Juliana P.)",
    leaderName: "Juliana Paes",
    leaderRank: "Consultor Ouro",
    totalKwp: 82.0,
    pointsGenerated: 3825,
    percentageOfTotal: 45, // 45% > 40% VME Cap -> EXCEEDED for rank points cap
    isVmeExceeded: true,
    avatar: "JP",
  },
  {
    id: "leg-3",
    legName: "Perna C (Thiago L.)",
    leaderName: "Thiago Lacerda",
    leaderRank: "Consultor Bronze",
    totalKwp: 38.0,
    pointsGenerated: 1700,
    percentageOfTotal: 20, // 20% < 40% VME Cap -> OK
    isVmeExceeded: false,
    avatar: "TL",
  },
];

export function ConsultantNetworkLegFilter() {
  const legs = MOCK_LEGS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <PieChart className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">MONITOR VME SELOS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Performance por Perna</h1>
          <p className="text-xs text-slate-400">Equilíbrio de Linhas para Selos & Graduação</p>
        </div>

        {/* Info VME Explanation Box (PLAN 34D) */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Teto VME (40%) para Selos</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                PIX 100% Livre
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              As comissões em R$ de todas as pernas entram <strong>100% livres no seu PIX</strong>. A regra de 40% VME abaixo serve exclusivamente para determinar a contribuição máxima desta perna para seu <strong>Próximo Selo de Graduação</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Legs List Cards */}
        <div className="space-y-3.5">
          {legs.map((leg) => (
            <motion.div
              key={leg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 font-extrabold flex items-center justify-center font-mono">
                    {leg.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">{leg.legName}</h3>
                    <span className="text-[10px] text-slate-400">{leg.leaderRank}</span>
                  </div>
                </div>

                <Badge
                  variant={leg.isVmeExceeded ? "outline" : "sun"}
                  className={cn(
                    "text-[10px] font-mono gap-1",
                    leg.isVmeExceeded && "border-amber-400/40 text-amber-400"
                  )}
                >
                  {leg.isVmeExceeded ? (
                    <>
                      <AlertTriangle className="h-3 w-3" /> CAP SELO 40% ({leg.percentageOfTotal}%)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> SELO OK ({leg.percentageOfTotal}%)
                    </>
                  )}
                </Badge>
              </div>

              {/* Progress Bar for Leg % */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Contribuição de Selo</span>
                  <span>{leg.pointsGenerated} PTS ({leg.totalKwp} kWp)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${Math.min(leg.percentageOfTotal, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      leg.isVmeExceeded ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono pt-0.5">
                  <span className="text-slate-500">
                    {leg.isVmeExceeded ? "⚠️ Perna dominante travada em 40% para Selo" : "✅ Perna equilibrada para Selo"}
                  </span>
                  <span className="text-emerald-400 font-bold">Comissão PIX 100% Paga</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
