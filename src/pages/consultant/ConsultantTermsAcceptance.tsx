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
          <h1 className="text-xl font-black tracking-tight text-white">Credenciamento MMN</h1>
          <p className="text-xs text-slate-400">Contrato de Prestação de Serviços Comerciais</p>
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
                    <Badge variant="sun" className="text-[10px]">CONTRATO DE ADESÃO</Badge>
                    <h2 className="font-bold text-sm text-white">Cláusulas de Credenciamento</h2>
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

                    {/* Section 2: MMN & VME Cap */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleSection("vme")}
                        className="w-full p-3.5 text-left font-bold text-xs text-white flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/70"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-amber-400" />
                          <span>2. Qualificação MMN & Trava VME (40%)</span>
                        </span>
                        <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "vme" && "rotate-180")} />
                      </button>
                      {expandedSection === "vme" && (
                        <div className="p-3.5 text-[11px] text-slate-300 space-y-2 border-t border-slate-800/80 leading-relaxed font-sans bg-slate-950/80">
                          <p>• <strong>Regra de Linha Máxima (VME)</strong>: Para evitar concentração e premiar a liderança real, no máximo 40% dos pontos de graduação podem advir de uma única perna direta da rede 7 níveis.</p>
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

                  {/* Checkbox Agreement */}
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-amber-400 focus:ring-amber-400 h-4 w-4 shrink-0"
                    />
                    <span>Li e aceito os termos do Contrato de Consultoria Esol Energy</span>
                  </label>

                  <Button
                    type="button"
                    disabled={!acceptedTerms}
                    onClick={handleSignContract}
                    className="w-full h-11 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Assinar Digitalmente & Finalizar</span>
                  </Button>
                </motion.div>
              ) : (
                /* Contract Signed Success State */
                <motion.div
                  key="signed-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-base text-white">Credenciamento Concluído!</h2>
                    <p className="text-xs text-slate-400">Contrato assinado via Esol Sign ICP-Brasil com Hash SHA-256.</p>
                  </div>

                  <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
                    <span>Prosseguir para EAD Esol Academy (Plano 26B1)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
