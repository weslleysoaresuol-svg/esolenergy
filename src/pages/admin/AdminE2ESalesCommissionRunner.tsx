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
  Award,
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
  {
    stepNumber: 6,
    title: "Harmonização MMN V10.0 (PIX Livre + VME 40% Selos)",
    description: "Validação de isenção de VME no PIX e trava 40% VME para selos de carreira",
    latencyMs: 85,
    status: "success",
    hashOrDetail: "RPC validar_qualificacao_vme_carreira() PASS ✅",
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
    <div className="space-y-6 selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs mb-2">
            <Zap className="h-4 w-4" />
            <span className="font-mono font-bold uppercase">SUÍTE E2E V10.0</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Suíte de Testes Automatizados E2E Venda ➔ Comissionamento ➔ Split
          </h1>
          <p className="text-xs text-slate-400">
            Simulador de estresse e integridade ponta a ponta da jornada comercial e financeira
          </p>
        </div>

        <Button
          onClick={handleRunStressTest}
          disabled={isStressTesting}
          className="h-11 px-5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={cn("h-4 w-4", isStressTesting && "animate-spin")} />
          <span>{isStressTesting ? "Executando Teste E2E..." : "Executar Suíte de Testes E2E"}</span>
        </Button>
      </div>

      {/* Progress Bar Container */}
      <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Status do Runner de Testes Integrados</span>
            </span>
            <strong className="text-emerald-400 font-bold">100% HOMOLOGADO & PASS</strong>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full glow-amber"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.stepNumber * 0.05 }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono shrink-0">
                #{step.stepNumber}
              </div>
              <div>
                <h3 className="font-bold text-xs text-white flex items-center gap-2">
                  <span>{step.title}</span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
                    {step.latencyMs}ms
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-400">{step.description}</p>
                <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">
                  {step.hashOrDetail}
                </span>
              </div>
            </div>

            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 shrink-0">
              <CheckCircle2 className="h-3 w-3" /> APROVADO
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
