import * as React from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Copy,
  Check,
  Share2,
  Send,
  MessageSquare,
  Linkedin,
  Instagram,
  MousePointerClick,
  UserCheck,
  TrendingUp,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantReferralLinkModal() {
  const [copied, setCopied] = React.useState(false);
  const referralLink = "https://esolenergy.com.br/convite/ESOL-88490";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
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
            <QrCode className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">LINK & QR CODE MMN</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Recrutamento Direto</h1>
          <p className="text-xs text-slate-400">Convide novos consultores para a sua equipe</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden text-center">
          <CardContent className="p-6 space-y-5">
            {/* QR Code Frame */}
            <div className="p-4 rounded-2xl bg-white border-4 border-amber-400/60 shadow-xl inline-block mx-auto relative group">
              <div className="h-44 w-44 bg-slate-950 rounded-xl flex flex-col items-center justify-center space-y-2 p-3 text-amber-400 font-mono text-center">
                <QrCode className="h-28 w-28 text-white" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ID: ESOL-88490</span>
              </div>
            </div>

            {/* Custom Link Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Seu Link de Indicação Exclusivo</span>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-mono text-amber-400 font-bold">{referralLink}</span>
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

            {/* Link Performance Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                <MousePointerClick className="h-4 w-4 text-cyan-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">Cliques</span>
                <strong className="text-xs font-bold text-white font-mono">28</strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                <UserCheck className="h-4 w-4 text-emerald-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">Cadastros</span>
                <strong className="text-xs font-bold text-white font-mono">8</strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                <TrendingUp className="h-4 w-4 text-amber-400 mx-auto" />
                <span className="text-[9px] font-mono text-slate-400 block">Conversão</span>
                <strong className="text-xs font-bold text-white font-mono">28.5%</strong>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Compartilhar Direto</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: MessageSquare, label: "WhatsApp", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { icon: Send, label: "Telegram", color: "text-cyan-400", bg: "bg-cyan-400/10" },
                  { icon: Linkedin, label: "LinkedIn", color: "text-blue-400", bg: "bg-blue-400/10" },
                  { icon: Instagram, label: "Stories", color: "text-pink-400", bg: "bg-pink-400/10" },
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={handleCopy}
                      className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                    >
                      <div className={cn("p-2 rounded-xl border border-slate-800 transition-transform group-hover:scale-110", social.bg, social.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300">{social.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
