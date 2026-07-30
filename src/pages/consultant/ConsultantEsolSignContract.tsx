import * as React from "react";
import { motion } from "framer-motion";
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  MapPin,
  Sparkles,
  Sun,
  ArrowRight,
  FileText,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ConsultantEsolSignContract() {
  const [signatureName, setSignatureName] = React.useState("ROBERTO FONSECA DA SILVA");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isSigned, setIsSigned] = React.useState(false);

  const mockIp = "189.120.45.12";
  const mockLocation = "Campinas - SP, Brasil";
  const mockSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const handleSign = () => {
    setIsSigned(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <FileCheck2 className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL SIGN DIGITAL</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Contrato de Consultoria</h1>
          <p className="text-xs text-slate-400">Assinatura Eletrônica com Validade Jurídica</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {isSigned ? (
              /* Signed Success Certificate Screen */
              <div className="space-y-4 text-center py-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center glow-amber">
                  <ShieldCheck className="h-9 w-9" />
                </div>

                <div className="space-y-1">
                  <Badge variant="emerald" className="text-[9px]">
                    CONTRATO ASSINADO COM SUCESSO
                  </Badge>
                  <h2 className="text-lg font-black text-white">{signatureName}</h2>
                  <p className="text-xs text-slate-400">Consultor Credenciado Esol Energy</p>
                </div>

                {/* Audit Stamp Info Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 text-left space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-emerald-400 font-bold">CARIMBO DE AUDITABILIDADE</span>
                    <Badge variant="outline" className="text-[8px] border-slate-800 text-slate-400">
                      MP 2.200-2/2001
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>IP de Assinatura:</span>
                    <strong className="text-slate-200">{mockIp}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Geolocalização:</span>
                    <strong className="text-slate-200">{mockLocation}</strong>
                  </div>
                  <div className="space-y-0.5 pt-1 border-t border-slate-800">
                    <span className="block text-[8px] uppercase text-slate-500">Hash SHA-256</span>
                    <strong className="text-[8px] text-amber-400 font-mono block truncate">
                      {mockSha256}
                    </strong>
                  </div>
                </div>

                <Button variant="emerald" className="w-full h-11 text-xs font-bold rounded-xl shadow-lg gap-2 cursor-pointer">
                  <span>Avançar para Kanban de Projetos</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              /* Contract Accordion & Signature Form */
              <div className="space-y-4">
                {/* Contract Accordion Viewer */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                    Cláusulas do Contrato
                  </Label>

                  <Accordion type="single" collapsible className="w-full bg-slate-950/70 rounded-2xl border border-slate-800 px-3 py-1">
                    <AccordionItem value="c1" className="border-slate-800">
                      <AccordionTrigger className="text-xs font-bold text-white hover:no-underline py-2">
                        Cláusula 1ª - Objeto da Consultoria
                      </AccordionTrigger>
                      <AccordionContent className="text-[11px] text-slate-400">
                        O presente instrumento tem por objeto o credenciamento do Consultor para intermediação de propostas de sistemas fotovoltaicos EPC e Mercado Livre de Energia.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="c2" className="border-slate-800">
                      <AccordionTrigger className="text-xs font-bold text-white hover:no-underline py-2">
                        Cláusula 2ª - Comissionamento MMN 7 Níveis
                      </AccordionTrigger>
                      <AccordionContent className="text-[11px] text-slate-400">
                        As comissões serão pagas de acordo com a tabela oficial de bonificação Unilevel em até 2 dias úteis via PIX após a aprovação de cada contrato.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Digital Signature Name Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="h-3.5 w-3.5 text-amber-400" /> Firma Digital (Nome Completo)
                  </Label>
                  <Input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="h-11 text-xs font-bold text-amber-400 bg-slate-950/90 border-slate-800 font-mono uppercase focus-visible:ring-amber-400"
                  />
                </div>

                {/* Terms Acceptance Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="terms-check"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms-check" className="text-[11px] text-slate-300 cursor-pointer">
                    Li e concordo com todas as cláusulas do Contrato de Consultoria Esol Energy.
                  </Label>
                </div>

                {/* Action Button */}
                <Button
                  variant="sun"
                  disabled={!termsAccepted || !signatureName}
                  onClick={handleSign}
                  className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Assinar Digitalmente com Esol Sign</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
