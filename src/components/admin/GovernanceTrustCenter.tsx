import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck,
  Download,
  Activity,
  CheckCircle2,
  KeyRound,
  FileCode,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function GovernanceTrustCenter() {
  const securityPillars = [
    {
      title: "SOC 2 Type II Certified",
      status: "Auditado & Verificado",
      description: "Certificação anual de controles de segurança, disponibilidade e confidencialidade.",
      badge: "emerald",
      icon: ShieldCheck,
    },
    {
      title: "ISO/IEC 27001 Standard",
      status: "Conformidade Total",
      description: "Sistema de Gestão de Segurança da Informação (SGSI) com auditoria independente.",
      badge: "emerald",
      icon: Lock,
    },
    {
      title: "Criptografia AES-256 & TLS 1.3",
      status: "End-to-End Encrypted",
      description: "Proteção total de dados em trânsito e em repouso nos bancos de dados do Supabase Core.",
      badge: "cyan",
      icon: KeyRound,
    },
    {
      title: "Conformidade LGPD & GDPR",
      status: "DPO Dedicado",
      description: "Cofre de privacidade de dados com suporte a anonimização e direito ao esquecimento.",
      badge: "sun",
      icon: FileCheck,
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <span>Trust Center SOC 2 & Cofre de Segurança Cibernética</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Transparência de conformidade, métricas de SLA e certificações auditadas
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <Activity className="h-3 w-3" />
          SLA UPTIME 99.98%
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-2 dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-500" />
                    <h3 className="font-bold text-xs text-foreground">{item.title}</h3>
                  </div>
                  <Badge variant={item.badge as any} className="text-[9px]">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Live Infrastructure Metrics */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/50 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-500" />
            <span>Métricas de Saúde e Resiliência de Infraestrutura em Tempo Real</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground block">Uptime do Motor Ledger</span>
              <strong className="text-emerald-500 font-bold">99.98% (Pass)</strong>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground block">Último Pen-Test (Invasão)</span>
              <strong className="text-amber-500 font-bold">Aprovado s/ Vulnerabilidades</strong>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground block">Réplica Contínua WAL</span>
              <strong className="text-cyan-500 font-bold">Point-in-Time Recovery Ativo</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-foreground">
            Relatórios de auditoria assinados digitalmente com carimbo de tempo ICP-Brasil.
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl">
              Solicitar DPA
            </Button>

            <Button
              variant="sun"
              size="sm"
              className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar Pacote SOC 2</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
