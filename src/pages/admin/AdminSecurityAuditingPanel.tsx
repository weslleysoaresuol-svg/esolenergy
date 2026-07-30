import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Server,
  Activity,
  Zap,
  Globe,
  RefreshCw,
  Sparkles,
  Sun,
  ArrowRight,
  Eye,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface AntifraudRuleItem {
  id: string;
  ruleName: string;
  category: string;
  status: "ativo" | "alerta" | "inativo";
  latencyMs: number;
}

const MOCK_ANTIFRAUD_RULES: AntifraudRuleItem[] = [
  {
    id: "rule-101",
    ruleName: "Prevenção de Duplicidade de Chave PIX",
    category: "Financeiro / Saques",
    status: "ativo",
    latencyMs: 14,
  },
  {
    id: "rule-102",
    ruleName: "Validador do Teto VME 40% Unilevel",
    category: "MMN / Bonificação",
    status: "ativo",
    latencyMs: 22,
  },
  {
    id: "rule-103",
    ruleName: "Detecção de Proxy/VPN Anônimo",
    category: "Rede / IP",
    status: "ativo",
    latencyMs: 8,
  },
  {
    id: "rule-104",
    ruleName: "Verificação Biométrica Liveness KYC",
    category: "Segurança / ID",
    status: "ativo",
    latencyMs: 45,
  },
];

export function AdminSecurityAuditingPanel() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(100);
  const rules = MOCK_ANTIFRAUD_RULES;

  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(20);
    setTimeout(() => setScanProgress(60), 800);
    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">PAINEL DE AUDITORIA DE SEGURANÇA</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Hardening Antifraude & PenTesting</h1>
          <p className="text-xs text-slate-400">Monitoramento Cibernético e Proteção de Dados em Tempo Real</p>
        </div>

        {/* Security Health Score Banner */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Score de Segurança</span>
              <strong className="text-2xl font-black text-emerald-400 block font-mono">98 / 100</strong>
              <Badge variant="emerald" className="text-[8px]">EXCELENTE</Badge>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Proteção WAF</span>
              <strong className="text-base font-bold text-white block font-mono">Cloudflare Enterprise</strong>
              <span className="text-[9px] text-emerald-400 font-mono block">100% Protegido</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">OWASP Top 10</span>
              <strong className="text-base font-bold text-cyan-400 block font-mono">0 Vulnerabilidades</strong>
              <span className="text-[9px] text-slate-500 font-mono block">100% Aprovado</span>
            </CardContent>
          </Card>
        </div>

        {/* Antifraud Rules Engine Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-400" /> Motor de Regras Antifraude Ativas
              </h2>
              <Badge variant="sun" className="text-[9px]">4 REGRAS ATIVAS</Badge>
            </div>

            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-xs">{rule.ruleName}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{rule.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500">{rule.latencyMs}ms</span>
                    <Badge variant="emerald" className="text-[8px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> ATIVO
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Run OWASP Scan Button */}
            <Button
              variant="sun"
              disabled={isScanning}
              onClick={handleRunScan}
              className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executando Varredura OWASP ({scanProgress}%)...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Executar Varredura de Segurança OWASP ZAP</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
