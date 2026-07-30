import * as React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sun,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface WalletStatementItem {
  id: string;
  description: string;
  category: "venda_direta" | "mmn_unilevel" | "saque_pix";
  amount: number;
  type: "in" | "out";
  date: string;
  status: "liberado" | "pendente" | "pago";
}

const MOCK_STATEMENT: WalletStatementItem[] = [
  {
    id: "tx-201",
    description: "Comissão Venda EPC Solar (42 kWp)",
    category: "venda_direta",
    amount: 6200.0,
    type: "in",
    date: "28/07/2026",
    status: "liberado",
  },
  {
    id: "tx-202",
    description: "Bônus Unilevel Nível 2 (Gabriel M.)",
    category: "mmn_unilevel",
    amount: 2720.5,
    type: "in",
    date: "25/07/2026",
    status: "liberado",
  },
  {
    id: "tx-203",
    description: "Saque PIX Chave CPF/PJ",
    category: "saque_pix",
    amount: 3500.0,
    type: "out",
    date: "20/07/2026",
    status: "pago",
  },
];

export function ConsultantWalletBalance() {
  const statement = MOCK_STATEMENT;
  const availableBalance = 8920.5;
  const futureBalance = 4250.0;

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
            <Wallet className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL WALLET</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Carteira Digital</h1>
          <p className="text-xs text-slate-400">Gestão de Comissões & Saques PIX</p>
        </div>

        {/* Main Balance Cards */}
        <div className="space-y-2.5">
          {/* Available PIX Balance Card */}
          <Card className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-xl overflow-hidden relative">
            <CardContent className="p-5 space-y-2 text-center">
              <Badge variant="emerald" className="text-[10px]">
                DISPONÍVEL PARA SAQUE PIX
              </Badge>
              <strong className="text-3xl font-black text-emerald-400 block font-mono tracking-tight glow-amber">
                {formatCurrency(availableBalance)}
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">
                Liberação instantânea em até 2 minutos via PIX
              </span>
            </CardContent>
          </Card>

          {/* Future Pending Balance Card */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-400" /> Saldo Futuro em Escrituração
                </span>
                <strong className="text-base font-bold text-amber-400 font-mono">
                  {formatCurrency(futureBalance)}
                </strong>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400 font-mono">
                2 Lançamentos
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Sources Summary Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Vendas Diretas EPC
            </span>
            <strong className="text-sm font-bold text-white font-mono block">
              {formatCurrency(6200.0)}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Users className="h-3 w-3 text-cyan-400" /> Bônus Unilevel 7N
            </span>
            <strong className="text-sm font-bold text-cyan-400 font-mono block">
              {formatCurrency(2720.5)}
            </strong>
          </div>
        </div>

        {/* Recent Transactions Statement Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Extrato de Movimentações</span>
              <span className="text-[10px] text-slate-500 font-mono">Últimos 30 dias</span>
            </h2>

            <div className="space-y-2.5">
              {statement.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-xl border flex items-center justify-center shrink-0",
                        tx.type === "in"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}
                    >
                      {tx.type === "in" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-[11px] block truncate max-w-[150px]">
                        {tx.description}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{tx.date}</span>
                    </div>
                  </div>

                  <strong
                    className={cn(
                      "text-xs font-black font-mono shrink-0",
                      tx.type === "in" ? "text-emerald-400" : "text-slate-300"
                    )}
                  >
                    {tx.type === "in" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </strong>
                </div>
              ))}
            </div>

            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Solicitar Saque PIX</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
