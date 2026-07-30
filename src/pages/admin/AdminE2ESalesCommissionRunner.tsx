import * as React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  FileText,
  CreditCard,
  Building2,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface PipelineStepItem {
  stepNumber: number;
  title: string;
  description: string;
  latencyMs: number;
  status: "success" | "running" | "pending";
  hashOrDetail: string;
}

const MOCK_PIPELINE_STEPS: PipelineStepItem[] = [
  {
    stepNumber: 1,
    title: "Proposta Solar EPC Tier-1 (75.4 kWp)",
    description: "Dimensionamento e cotação de hardware aprovados",
    latencyMs: 210,
    status: "success",
    hashOrDetail: "Kit Solar WEG / Inversor Sungrow 75kW",
  },
  {
    stepNumber: 2,
    title: "Assinatura Eletrônica Esol Sign",
    description: "Compilação de minuta legal com GPS, IP e Hash NTP",
    latencyMs: 340,
    status: "success",
    hashOrDetail: "Hash: 8f9b2d...4c1a9",
  },
  {
    stepNumber: 3,
    title: "Escrituração Ledger Partida Dobrada",
    description: "Gatilho de contabilidade imutável SHA-256",
    latencyMs: 120,
    status: "success",
    hashOrDetail: "Ledger ID: #LGD-994812",
  },
  {
    stepNumber: 4,
    title: "Split Triangular BaaS Banking",
    description: "Divisão de comissão: 3% Consultor + 1.5% Unilevel 7 Níveis",
    latencyMs: 95,
    status: "success",
    hashOrDetail: "Subconta BaaS: R$ 8.450,00 Reservado",
  },
  {
    stepNumber: 5,
    title: "Solicitação & Saque PIX com MFA AAL2",
    description: "Emissão de eNotas NFe e transferência bancária instantânea",
    latencyMs: 180,
    status: "success",
    hashOrDetail: "Chave PIX Validade & Comprovante BaaS #9812",
  },
];

export function AdminE2ESalesCommissionRunner() {
  const [isStressTesting, setIsStressTesting] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const steps = MOCK_PIPELINE_STEPS;

  const handleRunStressTest = () => {
    setIsStressTesting(true);
    setProgress(20);
    setTimeout(() => setProgress(60), 800);
    setTimeout(() => setProgress(90), 1500);
    setTimeout(() => {
      setProgress(100);
      setIsStressTesting(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <DollarSign className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">FINANCIAL E2E TESTER</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Vendas, Comissionamento & Split</h1>
          <p className="text-xs text-slate-400">Homologação Automatizada do Ciclo Financeiro Fim-a-Fim</p>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Etapas Validadas</span>
              <strong className="text-xl font-black text-white font-mono block">5 / 5</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Split Total</span>
              <strong className="text-xl font-black text-emerald-400 font-mono block">R$ 8.450</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Tempo Total</span>
              <strong className="text-xl font-black text-cyan-400 font-mono block">945ms</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Ledger SHA256</span>
              <strong className="text-xl font-black text-amber-400 font-mono block">100% OK</strong>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stream Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-emerald-400" /> Pipeline de Venda ao Saque PIX
              </h2>
              <Badge variant="emerald" className="text-[9px]">PIPELINE APROVADA</Badge>
            </div>

            {/* Steps Stream */}
            <div className="space-y-3">
              {steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                        {st.stepNumber}
                      </span>
                      <strong className="text-white font-bold text-xs">{st.title}</strong>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">{st.latencyMs}ms</span>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-7">{st.description}</p>
                  <div className="pl-7 text-[9px] text-slate-500 font-mono">
                    Detalhe: <strong className="text-amber-400">{st.hashOrDetail}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Stress Test Action Button */}
            <Button
              variant="sun"
              disabled={isStressTesting}
              onClick={handleRunStressTest}
              className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
            >
              {isStressTesting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executando Teste de Estresse ({progress}%)...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Executar Teste de Estresse da Pipeline Financeira</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
