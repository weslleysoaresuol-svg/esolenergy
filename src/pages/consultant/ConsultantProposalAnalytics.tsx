import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle2,
  Bell,
  FileText,
  PlusCircle,
  Sun,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export interface ReadActivity {
  id: string;
  clientName: string;
  proposalId: string;
  readAt: string;
  duration: string;
  actionTaken: string;
}

const MOCK_READ_ACTIVITIES: ReadActivity[] = [
  {
    id: "act-101",
    clientName: "Supermercado Nova Era",
    proposalId: "PROPOS-99214",
    readAt: "Há 5 minutos",
    duration: "3m 40s",
    actionTaken: "Visualizou Análise de Payback",
  },
  {
    id: "act-102",
    clientName: "Padaria Pão D'Oro",
    proposalId: "PROPOS-88310",
    readAt: "Há 2 horas",
    duration: "5m 12s",
    actionTaken: "Simulou Financiamento Solar",
  },
  {
    id: "act-103",
    clientName: "Indústria Metalúrgica Alfa",
    proposalId: "PROPOS-77192",
    readAt: "Ontem às 16:45",
    duration: "8m 05s",
    actionTaken: "Baixou o PDF HD da Proposta",
  },
];

export function ConsultantProposalAnalytics() {
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const activities = MOCK_READ_ACTIVITIES;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <BarChart3 className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">PROPOSAL ANALYTICS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Desempenho de Propostas</h1>
          <p className="text-xs text-slate-400">Métricas de Abertura & Engajamento dos Clientes</p>
        </div>

        {/* Analytics KPIs Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Sent Count */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <FileText className="h-3 w-3 text-amber-400" /> Enviadas
              </span>
              <strong className="text-xl font-extrabold text-white block font-mono">
                18 Propostas
              </strong>
              <span className="text-[9px] text-slate-500 block">Neste Mês</span>
            </CardContent>
          </Card>

          {/* Open Rate */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Eye className="h-3 w-3 text-emerald-400" /> Taxa Abertura
              </span>
              <strong className="text-xl font-extrabold text-emerald-400 block font-mono">
                83.3%
              </strong>
              <span className="text-[9px] text-slate-500 block">15 Lidas pelo Cliente</span>
            </CardContent>
          </Card>

          {/* Avg Reading Time */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" /> Tempo Médio
              </span>
              <strong className="text-base font-extrabold text-cyan-400 block font-mono">
                4m 12s
              </strong>
              <span className="text-[9px] text-slate-500 block">Permanência na Proposta</span>
            </CardContent>
          </Card>

          {/* Closed / Signed */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-amber-400" /> Fechados
              </span>
              <strong className="text-base font-extrabold text-amber-400 block font-mono">
                6 Contratos
              </strong>
              <span className="text-[9px] text-slate-500 block">33.3% de Conversão</span>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400 animate-pulse" /> Feed de Acessos Recentes
              </h2>
              <Badge variant="sun" className="text-[9px]">AO VIVO</Badge>
            </div>

            <div className="space-y-2.5">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-[11px]">{act.clientName}</h3>
                    <span className="text-[9px] font-mono text-slate-500">{act.readAt}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span className="text-emerald-400 font-bold">{act.actionTaken}</span>
                    <span>Duração: {act.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Push Notifications Toggle */}
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs pt-2">
              <span className="text-slate-300 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <span className="text-[11px]">Notificação Push ao abrir proposta</span>
              </span>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              <span>Criar Nova Proposta Comercial</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
