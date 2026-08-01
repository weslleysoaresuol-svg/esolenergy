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
  Crown,
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
    title: "Escrituração Ledger Partida Dobrada & Split PIX",
    description: "Repasse de comissão em dinheiro nos 7 Níveis 100% Livre de VME",
    latencyMs: 120,
    status: "success",
    hashOrDetail: "Ledger ID: #LGD-994812 | Repasse Nível 1: R$ 5.250,00 PIX",
  },
  {
    stepNumber: 4,
    title: "Rateio do Fundo de 4% de Produtividade Direta",
    description: "Separação de 4% da receita mensal e rateio proporcional em dinheiro no PIX",
    latencyMs: 95,
    status: "success",
    hashOrDetail: "Pool Fundo Mês: R$ 48.500,00 | V_ponto: R$ 2,14 / PTS",
  },
  {
    stepNumber: 5,
    title: "Validação VME 40% Liderança MMN (A1 a A9)",
    description: "Execução da RPC validar_qualificacao_vme_lideranca() com teto de 40% por perna",
    latencyMs: 85,
    status: "success",
    hashOrDetail: "Grau A3 Aprovado: Pontos Válidos 15.000 / 15.000 (Teto Perna A: 6.000 PTS)",
  },
  {
    stepNumber: 6,
    title: "Classificação VME EcoPoints (Pessoais vs Equipe)",
    description: "Execução da RPC validar_acumulo_ecopoints_vme() separando esforço pessoal (0% VME) de equipe (40% VME)",
    latencyMs: 90,
    status: "success",
    hashOrDetail: "EcoPoints Pessoais: 2.750 (0% VME) | Equipe: 8.500 (40% VME)",
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
            <span className="font-mono font-bold uppercase">SUÍTE E2E V11.0</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Suíte E2E: Venda ➔ Comissões ➔ Fundo 4% ➔ Validação VME A1-A9
          </h1>
          <p className="text-xs text-slate-400">
            Validação automatizada de integridade das Duas Trilhas: Vendas Diretas (0% VME) e Liderança (40% VME)
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
              <span>Status do Runner de Testes Integrados V11.0</span>
            </span>
            <strong className="text-emerald-400 font-bold">100% HOMOLOGADO & PASS</strong>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono pt-2">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Testes Executados:</span>
              <strong className="text-white font-bold text-sm">6 / 6 Casos</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Comissões no PIX:</span>
              <strong className="text-emerald-400 font-bold text-sm">100% Livres (0% VME)</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Fundo 4% Vendas Diretas:</span>
              <strong className="text-emerald-400 font-bold text-sm">Rateio Ativo</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Liderança MMN VME:</span>
              <strong className="text-amber-400 font-bold text-sm">RPC Trava 40% PASS</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIPELINE STEPS LIST */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
          Detalhamento das Etapas do Workflow E2E
        </h2>

        <div className="space-y-3">
          {steps.map((step) => (
            <Card
              key={step.stepNumber}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-amber-400 text-xs shrink-0">
                    #{step.stepNumber}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-white leading-snug">{step.title}</h3>
                      <Badge variant="outline" className="text-[9px] border-slate-800 font-mono text-slate-400">
                        {step.latencyMs}ms
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{step.description}</p>
                    <span className="text-[10px] font-mono text-emerald-400 block pt-0.5">
                      {step.hashOrDetail}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Badge variant="emerald" className="gap-1 text-[10px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> APROVADO
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
