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
  isVmeExceeded: boolean; // > 40%
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
    percentageOfTotal: 45, // 45% > 40% VME Cap -> EXCEEDED (5% capped)
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
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">MONITOR VME 40%</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Performance por Perna</h1>
          <p className="text-xs text-slate-400">Análise de Equilíbrio das Linhas Diretas</p>
        </div>

        {/* Info VME Explanation Box */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Regra de Volume Máximo de Perna (VME)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Para avançar de graduação, no máximo <strong>40% dos pontos totais</strong> podem vir de uma única linha. O excesso de uma perna dominante é travado automaticamente.
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
            >
              <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Leg Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                        {leg.avatar}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs text-white">{leg.legName}</h3>
                        <span className="text-[10px] text-slate-400 font-mono block">{leg.leaderRank}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {leg.isVmeExceeded ? (
                        <Badge variant="destructive" className="gap-1 text-[9px]">
                          <AlertTriangle className="h-3 w-3" /> EXCESSO VME ({leg.percentageOfTotal}%)
                        </Badge>
                      ) : (
                        <Badge variant="emerald" className="gap-1 text-[9px]">
                          <CheckCircle2 className="h-3 w-3" /> VME OK ({leg.percentageOfTotal}%)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Leg Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Volume: {leg.totalKwp} kWp</span>
                      <span className="text-white font-bold">{leg.pointsGenerated.toLocaleString()} PTS</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        style={{ width: `${leg.percentageOfTotal}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          leg.isVmeExceeded ? "bg-rose-500" : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* Action Contact Leader */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {leg.isVmeExceeded ? "⚠️ Perna dominante travada em 40%" : "✅ Perna equilibrada"}
                    </span>

                    <Button variant="outline" size="sm" className="h-8 text-[11px] border-slate-800 rounded-xl gap-1.5 cursor-pointer">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Notificar Líder</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
