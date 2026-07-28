import * as React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Zap,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  DollarSign,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface EnergyOption {
  id: "gd" | "acl";
  title: string;
  subtitle: string;
  monthlySavings: string;
  initialInvestment: string;
  ownership: string;
  contractTerm: string;
  paybackYears: string;
  isRecommended?: boolean;
}

const MOCK_OPTIONS: EnergyOption[] = [
  {
    id: "gd",
    title: "Geração Distribuída (GD Solar)",
    subtitle: "Sistema Fotovoltaico Próprio no Telhado",
    monthlySavings: "Até 95% de Redução",
    initialInvestment: "R$ 24.800,00 (Ou Financiado)",
    ownership: "Sim (Imóvel/Equipamento)",
    contractTerm: "Sem Fidelidade de Assinatura",
    paybackYears: "3.2 Anos",
    isRecommended: true,
  },
  {
    id: "acl",
    title: "Mercado Livre de Energia (ACL)",
    subtitle: "Migração por Assinatura sem Obras",
    monthlySavings: "20% de Desconto Garantido",
    initialInvestment: "R$ 0,00 (Zero CAPEX)",
    ownership: "Não (Energia Contratada)",
    contractTerm: "36 a 60 Meses",
    paybackYears: "Imediato (Sem Investimento)",
    isRecommended: false,
  },
];

export function ConsultantSolarVsFreeMarket() {
  const [selectedOption, setSelectedOption] = React.useState<"gd" | "acl">("gd");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Zap className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">SIMULADOR COMPARATIVO</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Solar GD vs Mercado Livre</h1>
          <p className="text-xs text-slate-400">Escolha a melhor modalidade para seu cliente</p>
        </div>

        {/* AI Recommendation Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-400/30 text-center space-y-1">
          <Badge variant="sun" className="text-[9px]">
            RECOMENDAÇÃO INTELIGENTE ESOL
          </Badge>
          <p className="text-xs font-bold text-white leading-snug">
            Para esta fatura (850 kWh/mês), a <strong className="text-amber-400">Geração Distribuída (GD Solar)</strong> gera <strong className="text-emerald-400">R$ 215.000 a mais</strong> de economia em 25 anos!
          </p>
        </div>

        {/* Option Selection Cards */}
        <div className="space-y-3">
          {MOCK_OPTIONS.map((opt) => {
            const isSelected = selectedOption === opt.id;

            return (
              <Card
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={cn(
                  "rounded-2xl border transition-all cursor-pointer overflow-hidden relative",
                  isSelected
                    ? "border-amber-400/60 bg-slate-900/90 shadow-xl glow-amber"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-2xl border flex items-center justify-center font-bold text-xs shrink-0",
                          opt.id === "gd"
                            ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                            : "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                        )}
                      >
                        {opt.id === "gd" ? <Sun className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs text-white">{opt.title}</h3>
                          {opt.isRecommended && (
                            <Badge variant="sun" className="text-[8px] px-1 py-0">
                              RECOMENDADO
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">{opt.subtitle}</span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-amber-400 bg-amber-400" : "border-slate-700"
                      )}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />}
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Economia</span>
                      <strong className="text-emerald-400 font-bold">{opt.monthlySavings}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Investimento</span>
                      <strong className="text-white font-bold">{opt.initialInvestment}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Propriedade</span>
                      <strong className="text-slate-300 font-bold">{opt.ownership}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Payback</span>
                      <strong className="text-amber-400 font-bold">{opt.paybackYears}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Button */}
        <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
          <span>
            {selectedOption === "gd" ? "Selecionar Geração Distribuída GD" : "Selecionar Mercado Livre ACL"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
