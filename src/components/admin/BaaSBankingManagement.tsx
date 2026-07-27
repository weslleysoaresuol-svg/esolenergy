import * as React from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  ShieldCheck,
  Split,
  Percent,
  Wallet,
  Activity,
  ArrowUpRight,
  Download,
  Building,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface BaaSVirtualSubAccount {
  id: string;
  titular: string;
  tipoAccount: "escrow_mmn" | "escrow_fiscal" | "corporativo_matriz";
  saldoDisponivel: number;
  saldoBloqueado: number;
  chavePix: string;
  status: "ativa" | "auditoria";
}

const MOCK_SUB_ACCOUNTS: BaaSVirtualSubAccount[] = [
  {
    id: "sub-101",
    titular: "Esol Matriz Operacional",
    tipoAccount: "corporativo_matriz",
    saldoDisponivel: 4850000.0,
    saldoBloqueado: 120000.0,
    chavePix: "48.912.304/0001-88",
    status: "ativa",
  },
  {
    id: "sub-102",
    titular: "Fundo de Custódia Comissões MMN",
    tipoAccount: "escrow_mmn",
    saldoDisponivel: 620000.0,
    saldoBloqueado: 45000.0,
    chavePix: "mmn-pool@esolenergy.com.br",
    status: "ativa",
  },
  {
    id: "sub-103",
    titular: "Cofre de Retenções Tributárias eNotas",
    tipoAccount: "escrow_fiscal",
    saldoDisponivel: 310000.0,
    saldoBloqueado: 0.0,
    chavePix: "tax-escrow@esolenergy.com.br",
    status: "ativa",
  },
];

export function BaaSBankingManagement() {
  const [subAccounts, setSubAccounts] = React.useState<BaaSVirtualSubAccount[]>(MOCK_SUB_ACCOUNTS);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Landmark className="h-5 w-5 text-amber-500" />
            <span>Gestão de BaaS Banking & Split Triangular de Pagamentos</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Liquidação automática de recebíveis em 3 partes e controle de subcontas virtuais
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <Activity className="h-3 w-3" />
          BAAS GATEWAY LATÊNCIA 68ms
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Triangular Split Architecture Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Split className="h-4 w-4 text-amber-500" />
            <span>Arquitetura de Split Triangular Automático (100% dos Recebíveis)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Part A */}
            <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-400/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500">Parte A: Esol Matriz</span>
                <Badge variant="sun" className="text-[10px] font-mono font-bold">75.0%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Custeio de Hardware Tier-1 (Inversores e Painéis) e Margem de Lucro Operacional.
              </p>
            </div>

            {/* Part B */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500">Parte B: MMN Unilevel</span>
                <Badge variant="emerald" className="text-[10px] font-mono font-bold">15.0%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fundo de repasse imediato para comissões diretas e pool de 7 níveis da rede MMN.
              </p>
            </div>

            {/* Part C */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-500">Parte C: Cofre Fiscal</span>
                <Badge variant="cyan" className="text-[10px] font-mono font-bold">10.0%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Retenção automática de tributos estaduais/federais (IRRF, INSS, ISS, PIS/COFINS).
              </p>
            </div>
          </div>
        </div>

        {/* Sub-accounts List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span>Subcontas Virtuais de Custódia (Escrow BaaS)</span>
          </h3>

          <div className="space-y-3">
            {subAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-2 dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-500">{account.id}</span>
                    <span className="font-bold text-xs text-foreground">{account.titular}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {account.tipoAccount.toUpperCase()}
                    </Badge>
                  </div>

                  <Badge variant="emerald" className="text-[10px]">
                    🟢 SUBCONTA ATIVA
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono pt-1">
                  <span className="text-muted-foreground">Chave PIX: <strong className="text-foreground">{account.chavePix}</strong></span>

                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Saldo Bloqueado</span>
                      <span className="text-muted-foreground">{formatCurrency(account.saldoBloqueado)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Saldo Disponível</span>
                      <strong className="text-emerald-500 text-sm font-bold">{formatCurrency(account.saldoDisponivel)}</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="sun" size="sm" className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar Extrato Consolidado BaaS</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
