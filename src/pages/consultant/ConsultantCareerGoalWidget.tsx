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
  DollarSign,
  Info,
  Flame,
  Globe,
  Star,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SalesSealData {
  groupName: string; // 'TERRA', 'ÁGUA', 'AR', 'FOGO', 'ASTROS', 'FENÔMENOS', 'CONQUISTADORES'
  currentSeal: string; // 'L11 Chama'
  nextSeal: string; // 'L12 Fogueira'
  sealPoints: number;
  targetSealPoints: number;
}

export interface NetworkLeadershipData {
  currentGradeCode: string; // 'A2'
  currentTitle: string; // 'Arquiteto de Expansão'
  nextGradeCode: string; // 'A3'
  nextTitle: string; // 'Mentor de Alta Performance'
  teamPoints: number;
  targetTeamPoints: number;
  validVmePoints: number;
  maxLegPercentage: number; // 35% < 40% VME Cap
  isVmeCompliant: boolean;
}

const MOCK_SALES_SEAL_DATA: SalesSealData = {
  groupName: "FOGO",
  currentSeal: "L11 Chama",
  nextSeal: "L12 Fogueira",
  sealPoints: 6800,
  targetSealPoints: 8000,
};

const MOCK_LEADERSHIP_DATA: NetworkLeadershipData = {
  currentGradeCode: "A2",
  currentTitle: "Arquiteto de Expansão",
  nextGradeCode: "A3",
  nextTitle: "Mentor de Alta Performance",
  teamPoints: 12500,
  targetTeamPoints: 15000,
  validVmePoints: 11200,
  maxLegPercentage: 35,
  isVmeCompliant: true,
};

export function ConsultantCareerGoalWidget() {
  const [activeTab, setActiveTab] = React.useState<"sales" | "leadership">("sales");

  const salesData = MOCK_SALES_SEAL_DATA;
  const leadershipData = MOCK_LEADERSHIP_DATA;

  const salesProgress = Math.round((salesData.sealPoints / salesData.targetSealPoints) * 100);
  const leadershipProgress = Math.round((leadershipData.validVmePoints / leadershipData.targetTeamPoints) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Crown className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL CAREER GOAL V11.0</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Central de Qualificação & Carreira</h1>
          <p className="text-xs text-slate-400">Trilha Dual: Vendas Diretas Pessoais vs Liderança MMN</p>
        </div>

        {/* DUAL NAVIGATION TABS */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={cn(
              "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === "sales"
                ? "bg-amber-400 text-slate-950 shadow-md glow-amber font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Vendas Diretas (0% VME)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leadership")}
            className={cn(
              "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === "leadership"
                ? "bg-amber-400 text-slate-950 shadow-md glow-amber font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Crown className="h-4 w-4" />
            <span>Liderança MMN (40% VME)</span>
          </button>
        </div>

        {/* TAB 1: CLASSIFICAÇÃO DE VENDEDORES DIRETOS (0% TRAVA VME) */}
        {activeTab === "sales" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                  <DollarSign className="h-3 w-3" /> VENDAS DIRETAS 100% LIVRE
                </Badge>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 gap-1">
                  <ShieldCheck className="h-3 w-3" /> 0% TRAVA VME
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Sua qualificação nos <strong>21 Selos dos 7 Grupos (Terra, Água, Ar, Fogo, Astros, Fenômenos, Conquistadores)</strong> depende exclusivamente do seu mérito de vendas pessoais diretas. Não existe qualquer trava VME para a sua conquista de selo!
              </p>
            </div>

            {/* Main Card Vendedor */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/30 space-y-2 text-center">
                  <Badge variant="sun" className="text-[10px]">
                    GRUPO 4: FOGO 🔥
                  </Badge>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{salesData.currentSeal}</span>
                    <ArrowRight className="h-4 w-4 text-amber-400" />
                    <strong className="text-sm font-black text-amber-400 font-mono">{salesData.nextSeal}</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400" /> Pontos de Vendas Diretas
                    </span>
                    <span className="text-white font-bold">
                      {salesData.sealPoints.toLocaleString()} / {salesData.targetSealPoints.toLocaleString()} PTS ({salesProgress}%)
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salesProgress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: CARREIRA DE LIDERANÇA MMN (40% TRAVA VME) */}
        {activeTab === "leadership" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] gap-1">
                  <Crown className="h-3 w-3" /> FORMADOR DE REDE MMN
                </Badge>
                <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-400 gap-1">
                  <ShieldCheck className="h-3 w-3" /> TRAVA VME 40%
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Para avançar nos <strong>Graus de Liderança MMN (A1 a A9)</strong>, troféus de convenção e pool de equity, no máximo <strong>40% dos pontos de equipe</strong> podem advir de 1 única perna da rede.
              </p>
            </div>

            {/* Main Card Liderança */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/30 space-y-2 text-center">
                  <Badge variant="sun" className="text-[10px]">
                    GRAU DE LIDERANÇA {leadershipData.currentGradeCode} ➔ {leadershipData.nextGradeCode}
                  </Badge>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{leadershipData.currentTitle}</span>
                    <ArrowRight className="h-4 w-4 text-amber-400" />
                    <strong className="text-sm font-black text-amber-400 font-mono">{leadershipData.nextTitle}</strong>
                  </div>
                </div>

                {/* Progress Bar Liderança */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Pontos Válidos VME 40%
                    </span>
                    <span className="text-white font-bold">
                      {leadershipData.validVmePoints.toLocaleString()} / {leadershipData.targetTeamPoints.toLocaleString()} PTS ({leadershipProgress}%)
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${leadershipProgress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full glow-amber"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
