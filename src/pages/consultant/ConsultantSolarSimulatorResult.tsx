import * as React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Layers,
  Cpu,
  Maximize2,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SolarKitRecommendation {
  systemKwp: number;
  monthlyGenerationKwh: number;
  panelCount: number;
  panelModel: string;
  inverterModel: string;
  roofAreaSqMeters: number;
  monthlySavingsBrl: number;
  totalSystemPriceBrl: number;
}

const MOCK_RECOMMENDATION: SolarKitRecommendation = {
  systemKwp: 6.8,
  monthlyGenerationKwh: 890,
  panelCount: 12,
  panelModel: "Módulo Fotovoltaico N-Type TOPCon 570W Bifacial High-Efficiency",
  inverterModel: "Inversor String On-Grid 6kW DNP Wi-Fi Integ.",
  roofAreaSqMeters: 34,
  monthlySavingsBrl: 785.0,
  totalSystemPriceBrl: 24800.0,
};

export function ConsultantSolarSimulatorResult() {
  const rec = MOCK_RECOMMENDATION;

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
            <Sun className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">DIMENSIONAMENTO SOLAR</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Resultado & Kit Ideal</h1>
          <p className="text-xs text-slate-400">Passo 2 de 2: Especificação Fotovoltaica Recomendada</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* System Power Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900 border border-amber-400/40 text-center space-y-1 relative">
              <Badge variant="sun" className="text-[10px]">
                SISTEMA RECOMENDADO
              </Badge>
              <strong className="text-3xl font-black text-amber-400 block font-mono tracking-tight glow-amber">
                {rec.systemKwp} kWp
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">
                Geração Média Estimada: <strong className="text-emerald-400">{rec.monthlyGenerationKwh} kWh/mês</strong>
              </span>
            </div>

            {/* Technical Kit Specs List */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-xs text-slate-300 font-mono uppercase tracking-wider">Composição do Kit Solar</h3>

              {/* Panels Spec */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-[11px] block">{rec.panelCount}x Painéis Solares</span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate max-w-[160px]">{rec.panelModel}</span>
                  </div>
                </div>
              </div>

              {/* Inverter Spec */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-[11px] block">Inversor Central On-Grid</span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate max-w-[160px]">{rec.inverterModel}</span>
                  </div>
                </div>
              </div>

              {/* Roof Area Spec */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Maximize2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-[11px] block">Área Mínima de Telhado</span>
                    <span className="text-[9px] text-slate-400 font-mono block">{rec.roofAreaSqMeters} m² de área útil</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Economia Mensal Estimada:</span>
                <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(rec.monthlySavingsBrl)}/mês</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>Investimento Total Turnkey:</span>
                <strong className="text-amber-400 font-mono text-sm">{formatCurrency(rec.totalSystemPriceBrl)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
                <span>Avançar para Análise de Payback</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="w-full h-11 text-xs border-slate-800 rounded-xl gap-2 cursor-pointer text-slate-400 hover:text-white">
                <RotateCcw className="h-4 w-4" />
                <span>Reajustar Consumo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
