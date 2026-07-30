import * as React from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Copy,
  Check,
  Download,
  MessageSquare,
  Eye,
  Clock,
  Sparkles,
  Sun,
  ShieldCheck,
  Bell,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface ProposalTrackingData {
  proposalId: string;
  clientName: string;
  proposalUrl: string;
  viewsCount: number;
  lastViewedAt: string;
  isViewed: boolean;
}

const MOCK_PROPOSAL_TRACKING: ProposalTrackingData = {
  proposalId: "PROPOS-99214",
  clientName: "Supermercado Nova Era",
  proposalUrl: "https://esolenergy.com.br/p/PROPOS-99214",
  viewsCount: 3,
  lastViewedAt: "Há 5 minutos",
  isViewed: true,
};

export function ConsultantProposalShareModal() {
  const [copied, setCopied] = React.useState(false);
  const data = MOCK_PROPOSAL_TRACKING;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.proposalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Share2 className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">COMPARTILHAR PROPOSTA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Envio & Rastreamento</h1>
          <p className="text-xs text-slate-400">Proposta para {data.clientName}</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Live Tracking Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 text-center">
              <Badge variant="emerald" className="gap-1 text-[10px]">
                <Eye className="h-3 w-3" /> PROPOSTA VISUALIZADA
              </Badge>
              <strong className="text-sm font-bold text-white block">
                O cliente já acessou a proposta {data.viewsCount} vezes
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">Último acesso: {data.lastViewedAt}</span>
            </div>

            {/* Custom Link Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Link Web da Proposta Comercial</span>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-mono text-amber-400 font-bold">{data.proposalUrl}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-8 w-8 text-amber-400 hover:text-amber-300 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-2 pt-1">
              {/* WhatsApp Share Direct */}
              <Button variant="emerald" className="w-full h-11 text-xs font-bold rounded-xl shadow-lg gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4" />
                <span>Enviar no WhatsApp do Cliente</span>
              </Button>

              {/* PDF Download */}
              <Button variant="outline" className="w-full h-11 text-xs border-slate-800 rounded-xl gap-2 cursor-pointer text-slate-300 hover:text-white">
                <Download className="h-4 w-4 text-amber-400" />
                <span>Baixar Proposta em PDF HD</span>
              </Button>
            </div>

            {/* Push Notification Box */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
              <Bell className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-[10px] leading-tight">
                Notificação Push ativada. Você receberá um alerta quando o cliente reabrir a proposta.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
