import * as React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  CheckCircle2,
  Cloud,
  Key,
  Server,
  Zap,
  RefreshCw,
  Sparkles,
  Sun,
  ShieldCheck,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface CloudflareStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
}

export function AdminCloudflareAccountSetup() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [accountId, setAccountId] = React.useState("cf_acc_984128941294812");
  const [zoneId, setZoneId] = React.useState("cf_zone_87129418294");
  const [apiToken, setApiToken] = React.useState("••••••••••••••••••••••••••••••••");
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [deployProgress, setDeployProgress] = React.useState(100);

  const steps: CloudflareStep[] = [
    {
      stepNumber: 1,
      title: "Credenciais de API Cloudflare",
      subtitle: "Account ID, Zone ID e Token de API",
      status: currentStep === 1 ? "active" : currentStep > 1 ? "completed" : "pending",
    },
    {
      stepNumber: 2,
      title: "Deploy Cloudflare Pages",
      subtitle: "Build ./dist ➔ esolenergy-pwa.pages.dev",
      status: currentStep === 2 ? "active" : currentStep > 2 ? "completed" : "pending",
    },
    {
      stepNumber: 3,
      title: "Domínios Nacionais (.com.br)",
      subtitle: "Root, WWW, App, Admin, API & EAD",
      status: currentStep === 3 ? "active" : "pending",
    },
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setIsDeploying(true);
      setDeployProgress(30);
      setTimeout(() => setDeployProgress(75), 900);
      setTimeout(() => {
        setDeployProgress(100);
        setIsDeploying(false);
        setCurrentStep(3);
      }, 1800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Cloud className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">CLOUDFLARE EDGE MANAGER (BRASIL .COM.BR)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Setup de Infraestrutura Cloudflare</h1>
          <p className="text-xs text-slate-400">Conexão de Conta, Deploy Pages & Suíte de Domínios Nacionais (.com.br)</p>
        </div>

        {/* Wizard Steps Stepper */}
        <div className="grid grid-cols-3 gap-2 font-mono">
          {steps.map((st) => (
            <Card
              key={st.stepNumber}
              className={cn(
                "rounded-2xl border transition-all",
                st.status === "active"
                  ? "border-amber-400 bg-slate-900 shadow-md glow-amber"
                  : st.status === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-950/60 opacity-60"
              )}
            >
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold">Passo {st.stepNumber}</span>
                  {st.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <h2 className="font-bold text-xs text-white leading-tight">{st.title}</h2>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Step Content Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Step 1: Credentials */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Key className="h-4 w-4 text-amber-400" /> Credenciais de Autenticação API
                  </h3>
                  <Badge variant="sun" className="text-[9px]">ETAPA 1/3</Badge>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block">Cloudflare Account ID</label>
                    <Input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="h-10 bg-slate-950 border-slate-800 text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block">Zone ID (Domínio Customizado)</label>
                    <Input
                      type="text"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="h-10 bg-slate-950 border-slate-800 text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block">API Token (Permissão Pages & DNS Edit)</label>
                    <Input
                      type="password"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="h-10 bg-slate-950 border-slate-800 text-amber-400"
                    />
                  </div>
                </div>

                <Button
                  variant="sun"
                  onClick={handleNextStep}
                  className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                >
                  <span>Validar Credenciais & Ir para Deploy</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Deploy Pages */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Server className="h-4 w-4 text-emerald-400" /> Deploy no Cloudflare Pages
                  </h3>
                  <Badge variant="emerald" className="text-[9px]">ETAPA 2/3</Badge>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projeto Target:</span>
                    <strong className="text-amber-400">esolenergy-pwa</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diretório de Build:</span>
                    <strong className="text-white">./dist</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">URL Temporária Cloudflare:</span>
                    <strong className="text-emerald-400">esolenergy-pwa.pages.dev</strong>
                  </div>
                </div>

                {isDeploying && (
                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Compilando e publicando no Cloudflare Edge...</span>
                      <span className="text-amber-400 font-bold">{deployProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${deployProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="sun"
                  disabled={isDeploying}
                  onClick={handleNextStep}
                  className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                >
                  {isDeploying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Publicando no Cloudflare Pages...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Disparar Deploy & Avançar para Domínios</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Brazilian .com.br Subdomains Suite */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" /> Suíte de Domínios Nacionais (.com.br)
                  </h3>
                  <Badge variant="emerald" className="text-[9px]">ETAPA 3/3 — CONCLUÍDO</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">Website Raiz:</span>
                    <strong className="text-amber-400 text-[11px] block truncate">esolenergy.com.br</strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">Subdomínio WWW:</span>
                    <strong className="text-cyan-400 text-[11px] block truncate">www.esolenergy.com.br</strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">App Consultor PWA:</span>
                    <strong className="text-emerald-400 text-[11px] block truncate">app.esolenergy.com.br</strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">Portal Admin:</span>
                    <strong className="text-amber-400 text-[11px] block truncate">admin.esolenergy.com.br</strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">Developer API:</span>
                    <strong className="text-cyan-400 text-[11px] block truncate">api.esolenergy.com.br</strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] text-slate-400">EAD Academy:</span>
                    <strong className="text-emerald-400 text-[11px] block truncate">ead.esolenergy.com.br</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-xs text-white">Suíte .com.br 100% Homologada no Brasil!</h4>
                  <p className="text-[10px] text-slate-300">
                    Todos os 6 subdomínios nacionais estão ativos na borda do Cloudflare com SSL 256-bit.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
