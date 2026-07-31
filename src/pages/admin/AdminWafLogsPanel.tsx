import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Server,
  Activity,
  Globe,
  Ban,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Sun,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface WafThreatLog {
  id: string;
  ipAddress: string;
  country: string;
  targetRoute: string;
  threatType: "Brute Force" | "SQL Injection" | "Rate Limit Violation" | "XSS Attack";
  timestamp: string;
  action: "bloqueado" | "desafiado_captcha";
}

const MOCK_WAF_LOGS: WafThreatLog[] = [
  {
    id: "log-501",
    ipAddress: "185.220.101.4",
    country: "Rússia (RU)",
    targetRoute: "/api/v1/auth/login",
    threatType: "Brute Force",
    timestamp: "Há 2 minutos",
    action: "bloqueado",
  },
  {
    id: "log-502",
    ipAddress: "45.142.120.9",
    country: "China (CN)",
    targetRoute: "/api/v1/pix/withdrawal",
    threatType: "Rate Limit Violation",
    timestamp: "Há 14 minutos",
    action: "bloqueado",
  },
  {
    id: "log-503",
    ipAddress: "194.26.29.11",
    country: "Holanda (NL)",
    targetRoute: "/api/v1/proposal/builder",
    threatType: "SQL Injection",
    timestamp: "Há 45 minutos",
    action: "bloqueado",
  },
  {
    id: "log-504",
    ipAddress: "103.152.18.2",
    country: "Índia (IN)",
    targetRoute: "/api/v1/consultant/onboarding",
    threatType: "XSS Attack",
    timestamp: "Há 1 hora",
    action: "desafiado_captcha",
  },
];

export function AdminWafLogsPanel() {
  const [logs, setLogs] = React.useState<WafThreatLog[]>(MOCK_WAF_LOGS);
  const [ipInput, setIpInput] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);

  const handleManualBan = () => {
    if (!ipInput) return;
    const newLog: WafThreatLog = {
      id: `log-${Date.now()}`,
      ipAddress: ipInput,
      country: "Manual Admin Ban",
      targetRoute: "Global Firewall Blacklist",
      threatType: "Rate Limit Violation",
      timestamp: "Agora",
      action: "bloqueado",
    };
    setLogs([newLog, ...logs]);
    setIpInput("");
  };

  const handleExportSiem = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">WAF & RATE LIMIT MONITOR</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Logs de Auditoria de Rede</h1>
          <p className="text-xs text-slate-400">Mitigação de Ataques Cibernéticos & Blacklist de IPs</p>
        </div>

        {/* Network Metrics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Requisições (24h)</span>
              <strong className="text-xl font-black text-white block font-mono">1.45M</strong>
              <span className="text-[9px] text-slate-500 font-mono block">Média 1.200 req/min</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Ataques Bloqueados</span>
              <strong className="text-xl font-black text-rose-400 block font-mono">342</strong>
              <Badge variant="rose" className="text-[8px]">100% MITIGADOS</Badge>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl">
            <CardContent className="p-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">IPs em Blacklist</span>
              <strong className="text-xl font-black text-amber-400 block font-mono">18 IPs</strong>
              <span className="text-[9px] text-slate-400 font-mono block">Bloqueio Permanente</span>
            </CardContent>
          </Card>
        </div>

        {/* Live Threat Stream Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-rose-400 animate-pulse" /> Live Threat Stream (WAF Logs)
              </h2>
              <Badge variant="sun" className="text-[9px]">EM TEMPO REAL</Badge>
            </div>

            {/* Manual IP Ban Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digitar IP para banimento manual (ex: 192.168.1.1)..."
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                className="h-10 text-xs rounded-xl bg-slate-950 border-slate-800 font-mono focus-visible:ring-rose-500"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleManualBan}
                className="h-10 text-xs font-bold rounded-xl gap-1 shrink-0 cursor-pointer"
              >
                <Ban className="h-4 w-4" />
                <span>Banir IP</span>
              </Button>
            </div>

            {/* Logs List */}
            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-rose-400 font-bold">{log.ipAddress}</strong>
                      <span className="text-[10px] text-slate-500">({log.country})</span>
                    </div>
                    <Badge variant={log.action === "bloqueado" ? "destructive" : "outline"} className="text-[8px]">
                      {log.action.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Ameaça: <strong className="text-white">{log.threatType}</strong></span>
                    <span>Rota: <strong className="text-amber-400">{log.targetRoute}</strong></span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Export SIEM Logs */}
            <Button
              variant="outline"
              disabled={isExporting}
              onClick={handleExportSiem}
              className="w-full h-11 text-xs font-bold border-slate-800 text-slate-300 hover:text-white rounded-xl gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>{isExporting ? "Exportando Syslog SIEM..." : "Exportar Logs de Auditoria SIEM / Syslog"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
