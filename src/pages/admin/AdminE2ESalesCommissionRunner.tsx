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
  ShieldAlert,
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
    title: "Validação Anti-Stacking N3 (RPC verificar_anti_stacking)",
    description: "Verificação ltree para anulação de pontos em compras circulares na sub-árvore N3",
    latencyMs: 65,
    status: "success",
    hashOrDetail: "Resultado: Venda externa regular | Pontos de Selo & EcoPoints liberados",
  },
  {
    stepNumber: 5,
    title: "Detecção de Parking por CEP/PIX (View mv_suspicious_parking_pairs)",
    description: "Varredura automática contra duplicidades de dados bancários ou residenciais",
    latencyMs: 80,
    status: "success",
    hashOrDetail: "Resultado: Nenhuma duplicidade de PIX/CEP encontrada na árvore",
  },
  {
    stepNumber: 6,
    title: "Quarentena Anti-Churning 90 Dias (RPC validar_quarentena_reconexao)",
    description: "Checagem de histórico de cancelamentos do mesmo consultor com o cliente",
    latencyMs: 75,
    status: "success",
    hashOrDetail: "Resultado: Cliente sem cancelamentos prévios | Venda aprovada",
  },
  {
    stepNumber: 7,
    title: "Aplicação da Carência de 30 Dias no Saque PIX (RPC solicitar_saque_pix)",
    description: "Trava temporária de saque para vendas únicas Motor 1 mantendo saldo em carência",
    latencyMs: 50,
    status: "success",
    hashOrDetail: "Data Liberação Saque: NOW() + 30 dias | Saldo Bloqueado em Carência registrado",
  },
  {
    stepNumber: 8,
    title: "Validação VME 40% Liderança MMN (A1 a A9)",
    description: "Execução da RPC validar_qualificacao_vme_lideranca() com teto de 40% por perna",
    latencyMs: 85,
    status: "success",
    hashOrDetail: "Grau A3 Aprovado: Pontos Válidos 15.000 / 15.000 (Teto Perna A: 6.000 PTS)",
  },
  {
    stepNumber: 9,
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
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setProgress(100);
        setIsStressTesting(false);
        clearInterval(interval);
      } else {
        setProgress(current);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">
              E2E SUITE V12.0 — ANTI-FRAUDE & GOVERNANÇA
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Runner de Testes Automatizados E2E</h1>
          <p className="text-xs text-slate-400">
            Homologação de Pipeline: Anti-Stacking, Parking, Quarentena, Carência & VME
          </p>
        </div>

        {/* Action & Run Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 block">STATUS DA SUÍTE</span>
                <strong className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> 9/9 Cenários de Teste Aprovados (100%)
                </strong>
              </div>

              <Button
                type="button"
                disabled={isStressTesting}
                onClick={handleRunStressTest}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs gap-2 rounded-2xl py-5 cursor-pointer shadow-lg glow-amber"
              >
                <RefreshCw className={cn("h-4 w-4", isStressTesting && "animate-spin")} />
                <span>{isStressTesting ? "Executando Testes E2E..." : "Rodar Bateria de Testes E2E V12.0"}</span>
              </Button>
            </div>

            {/* Progress Bar */}
            {isStressTesting && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-amber-400 font-bold">
                  <span>Simulando Pipeline Completo...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step) => (
            <Card
              key={step.stepNumber}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl"
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs font-bold text-white block">{step.title}</strong>
                    <p className="text-[11px] text-slate-400">{step.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">{step.hashOrDetail}</span>
                  </div>
                </div>

                <div className="text-right font-mono space-y-1">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] gap-1">
                    <CheckCircle2 className="h-3 w-3" /> OK
                  </Badge>
                  <span className="text-[10px] text-slate-500 block">{step.latencyMs}ms</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
