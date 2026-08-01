import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Lock,
  ArrowRight,
  Sun,
  Scale,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantTermsAcceptance() {
  const [expandedSection, setExpandedSection] = React.useState<string | null>("tax");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [isSigned, setIsSigned] = React.useState(false);

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? null : sec);
  };

  const handleSignContract = () => {
    if (acceptedTerms) {
      setIsSigned(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Light Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sun className="h-6 w-6 animate-spin-slow" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ENERGY PWA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Credenciamento de Vendas Diretas</h1>
          <p className="text-xs text-slate-400">Programa de Vendas Diretas com Bônus de Liderança V12.0</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <AnimatePresence mode="wait">
              {!isSigned ? (
                <motion.div
                  key="contract-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 text-center">
                    <Badge variant="sun" className="text-[10px]">CONTRATO DE ADESÃO COMERCIAL</Badge>
                    <h2 className="font-bold text-sm text-white">Cláusulas de Credenciamento & Compliance</h2>
                    <p className="text-[11px] text-slate-400">Clique para expandir e ler cada acórdão legal</p>
                  </div>

                  {/* Expandable Accordion Sections */}
                  <div className="space-y-2.5">
                    {/* Section 1: Tax */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleSection("tax")}
                        className="w-full p-3.5 text-left font-bold text-xs text-white flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/70"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-400" />
                          <span>1. Regras Tributárias (PJ / PF)</span>
                        </span>
                        <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "tax" && "rotate-180")} />
                      </button>
                      {expandedSection === "tax" && (
                        <div className="p-3.5 text-[11px] text-slate-300 space-y-2 border-t border-slate-800/80 leading-relaxed font-sans bg-slate-950/80">
                          <p>• <strong>Pessoa Jurídica (MEI / Simples)</strong>: Faturamento realizado por auto-emissão eNotas com alíquota zero de retenção na fonte.</p>
                          <p>• <strong>Pessoa Física (Autônomo)</strong>: Os repasses contam com dedução automática previdenciária (INSS 11%) e tributária (IRRF até 27.5%) via emissão de RPA.</p>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Vendas Diretas & Bônus de Liderança (Plano 36K) */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleSection("vme")}
                        className="w-full p-3.5 text-left font-bold text-xs text-white flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/70"
                      >
                        <span className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-amber-400" />
                          <span>2. Qualificação por Vendas Reais & Trava VME 40%</span>
                        </span>
                        <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "vme" && "rotate-180")} />
                      </button>
                      {expandedSection === "vme" && (
                        <div className="p-3.5 text-[11px] text-slate-300 space-y-2 border-t border-slate-800/80 leading-relaxed font-sans bg-slate-950/80">
                          <p>• <strong>Qualificação por Vendas Efetivas</strong>: A qualificação para Graus de Liderança (A1 a A9) e prêmios é baseada exclusivamente no volume de vendas realizadas a consumidores finais, e não no mero recrutamento.</p>
                          <p>• <strong>Comissão PIX 100% Livre</strong>: Suas comissões financeiras geradas em 7 níveis são repassadas sem qualquer retenção VME.</p>
                          <p>• <strong>Governança de Sócios</strong>: Sócios-administradores da Esol Energy são terminantemente proibidos de participar como consultores credenciados na rede comercial.</p>
                        </div>
                      )}
                    </div>

                    {/* Section 3: LGPD & KYC */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleSection("lgpd")}
                        className="w-full p-3.5 text-left font-bold text-xs text-white flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/70"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-amber-400" />
                          <span>3. Proteção LGPD & Biometria Facial</span>
                        </span>
                        <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "lgpd" && "rotate-180")} />
                      </button>
                      {expandedSection === "lgpd" && (
                        <div className="p-3.5 text-[11px] text-slate-300 space-y-2 border-t border-slate-800/80 leading-relaxed font-sans bg-slate-950/80">
                          <p>• Dados sensíveis e prova de vida por biometria facial e-KYC são encriptados com algoritmo SHA-256 e salvos no Security Audit Vault.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Digital Signature Stamp Preview */}
                  <div className="p-3 rounded-2xl bg-amber-400/5 border border-amber-400/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                      <span>ESOL SIGN VERIFIED</span>
                      <span>NTP TIMESTAMP</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      HASH: 8f3a9e1d2c4b5a6e7f8a9b0c1d2e3f4a5b6c7d8e9f
                    </p>
                  </div>

                  {/* Acceptance Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-[11px] text-slate-300 leading-snug">
                      Li e concordo com o <strong>Programa de Vendas Diretas com Bônus de Liderança V12.0</strong> e autorizo a assinatura digital Esol Sign.
                    </span>
                  </label>

                  <Button
                    type="button"
                    disabled={!acceptedTerms}
                    onClick={handleSignContract}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs gap-2 rounded-2xl py-5 shadow-lg glow-amber cursor-pointer"
                  >
                    <span>Assinar Contrato de Credenciamento</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="signed-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg glow-emerald">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">Contrato Assinado com Sucesso!</h3>
                    <p className="text-xs text-slate-400">Credenciamento de Vendas Diretas V12.0 ativo.</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    DOCUMENTO AUTENTICADO NO GOVERNANCE VAULT
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
