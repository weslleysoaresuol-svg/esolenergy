import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  DollarSign,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Sun,
  CheckCircle2,
  BarChart3,
  Percent,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface PaybackAnalysis {
  paybackYears: number;
  paybackMonths: number;
  cumulative25YearSavings: number;
  irrPercentageAnnual: number;
  npvBrl: number;
  breakEvenYear: number;
}

const MOCK_PAYBACK: PaybackAnalysis = {
  paybackYears: 3.2,
  paybackMonths: 38,
  cumulative25YearSavings: 342500.0,
  irrPercentageAnnual: 33.6,
  npvBrl: 145200.0,
  breakEvenYear: 3,
};

export function ConsultantPaybackEngine() {
  const data = MOCK_PAYBACK;

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
            <TrendingUp className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ANÁLISE DE ROI & PAYBACK</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Retorno Financeiro</h1>
          <p className="text-xs text-slate-400">Estudo de Viabilidade Econômica em 25 Anos</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Payback Period Display */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-950 to-slate-900 border border-emerald-500/40 text-center space-y-1 relative">
              <Badge variant="emerald" className="text-[10px]">
                TEMPO DE RETORNO (PAYBACK)
              </Badge>
              <strong className="text-3xl font-black text-emerald-400 block font-mono tracking-tight glow-amber">
                {data.paybackYears} Anos ({data.paybackMonths} Meses)
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">
                Após este período, 100% da energia gerada é lucro líquido
              </span>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 25-Year Cumulative Economy */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 col-span-2">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-amber-400" /> Economia Acumulada em 25 Anos
                </span>
                <strong className="text-lg font-black text-white font-mono block">
                  {formatCurrency(data.cumulative25YearSavings)}
                </strong>
                <span className="text-[9px] text-emerald-400 block font-mono">Lucro líquido garantido por contrato</span>
              </div>

              {/* TIR (IRR) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Percent className="h-3 w-3 text-cyan-400" /> Rentabilidade TIR
                </span>
                <strong className="text-sm font-bold text-cyan-400 font-mono block">
                  {data.irrPercentageAnnual}% a.a.
                </strong>
                <span className="text-[9px] text-slate-500 block">3x superior à Renda Fixa</span>
              </div>

              {/* VPL (NPV) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-purple-400" /> VPL Presente
                </span>
                <strong className="text-sm font-bold text-purple-400 font-mono block">
                  {formatCurrency(data.npvBrl)}
                </strong>
                <span className="text-[9px] text-slate-500 block">Valor líquido atualizado</span>
              </div>
            </div>

            {/* Breakeven Timeline Visualization */}
            <div className="space-y-2 pt-1">
              <h3 className="font-bold text-xs text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Ponto de Virada (Breakeven)</span>
                <span className="text-[10px] text-amber-400">Ano {data.breakEvenYear}</span>
              </h3>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-mono">
                  {[1, 2, 3, 4, 5].map((yr) => (
                    <div
                      key={yr}
                      className={cn(
                        "p-2 rounded-xl border transition-all",
                        yr === data.breakEvenYear
                          ? "bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-md glow-amber"
                          : yr < data.breakEvenYear
                          ? "bg-slate-900 text-slate-400 border-slate-800"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      <span>Ano {yr}</span>
                      <span className="block text-[8px] mt-0.5">
                        {yr < data.breakEvenYear ? "Payback" : yr === data.breakEvenYear ? "Virada" : "Lucro 100%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Gerar Proposta Comercial Visual</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
