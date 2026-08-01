import * as React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Zap,
  Wallet,
  Award,
  Users,
  Calculator,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  QrCode,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EsolBrandmarkGliph } from "@/components/brand/EsolBrandmarkGliph";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";

export function ConsultantDashboardHome() {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <EsolLogoPrimary width={150} height={38} showTagline={false} />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            PWA Vendas Diretas
          </span>
        </div>

        {/* User Profile & Rank Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-400 font-mono text-base shadow-lg glow-amber">
                RF
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <CheckCircle2 className="h-2.5 w-2.5 text-slate-950" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-white">Roberto Fonseca</h1>
                <Badge variant="sun" className="text-[9px] px-1.5 py-0">
                  CONSULTOR OURO
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">ID: ESOL-88490</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-800 text-slate-400 hover:text-white">
            <Sun className="h-4 w-4 animate-spin-slow text-amber-400" />
          </Button>
        </div>

        {/* Quick KPI Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sales Monthly Card */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl col-span-2">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Vendas do Mês
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +18.4%
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <strong className="text-2xl font-black text-white font-mono">{formatCurrency(148500.0)}</strong>
                  <span className="text-xs text-slate-400 block font-mono">VGV Total Acumulado</span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400 font-mono">42.8 kWp</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Potência Instalada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commissions Wallet Card */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Wallet className="h-3 w-3 text-emerald-400" /> Comissões
              </span>
              <strong className="text-base font-extrabold text-emerald-400 block font-mono">
                {formatCurrency(8920.5)}
              </strong>
              <span className="text-[9px] text-slate-500 block">Liberado para Saque PIX</span>
            </CardContent>
          </Card>

          {/* EcoPoints Card */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Award className="h-3 w-3 text-amber-400" /> EcoPoints
              </span>
              <strong className="text-base font-extrabold text-amber-400 block font-mono">
                1.450 PTS
              </strong>
              <span className="text-[9px] text-slate-500 block">Disponível p/ Prêmios</span>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Buttons Grid */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Ações Rápidas</h2>

          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: PlusCircle, label: "Orçamento", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: QrCode, label: "Convidar", color: "text-cyan-400", bg: "bg-cyan-400/10" },
              { icon: Wallet, label: "Carteira", color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { icon: GraduationCap, label: "Academy", color: "text-purple-400", bg: "bg-purple-400/10" },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
                >
                  <div className={cn("p-2 rounded-xl border border-slate-800 transition-transform group-hover:scale-110", action.bg, action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign Banner Card */}
        <Card className="rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 shadow-xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1 max-w-[220px]">
              <Badge variant="sun" className="text-[9px]">CAMPANHA DE ACELERAÇÃO</Badge>
              <h3 className="font-bold text-xs text-white leading-snug">Acelera Solar Q3: Bônus em Dobro para Graduação Diamante!</h3>
            </div>
            <Button size="icon" variant="sun" className="h-10 w-10 rounded-2xl shrink-0 glow-amber cursor-pointer">
              <ArrowUpRight className="h-5 w-5 text-slate-950" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
