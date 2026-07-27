import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  KeyRound,
  FileCheck,
  Sparkles,
  Zap,
  ChevronDown,
  RotateCcw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantOnboardingPage() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [contact, setContact] = React.useState("");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = React.useState(45);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("tax");
  const [isCompleted, setIsCompleted] = React.useState(false);

  // OTP Timer countdown
  React.useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.trim().length > 5) {
      setStep(2);
      setResendTimer(45);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length === 6) {
      setStep(3);
    }
  };

  const handleFinishOnboarding = () => {
    if (acceptedTerms) {
      setIsCompleted(true);
    }
  };

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? null : sec);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Background Solar Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sun className="h-6 w-6 animate-spin-slow" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ENERGY PWA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Onboarding do Consultor Solar</h1>
          <p className="text-xs text-slate-400">Plataforma Oficial de Credenciamento MMN</p>
        </div>

        {/* Progress Bar & Percentage */}
        {!isCompleted && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Etapa {step} de 3</span>
              <strong className="text-amber-400">{step === 1 ? "33%" : step === 2 ? "66%" : "100%"} Concluído</strong>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                initial={{ width: "33%" }}
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
              />
            </div>
          </div>
        )}

        {/* Main Step Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!isCompleted ? (
                <>
                  {/* Step 1: Identification */}
                  {step === 1 && (
                    <motion.form
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSendOTP}
                      className="space-y-4"
                    >
                      <div className="space-y-1 text-center">
                        <Badge variant="sun" className="text-[10px]">PASSO 1: IDENTIFICAÇÃO</Badge>
                        <h2 className="font-bold text-sm text-white">WhatsApp ou E-mail Principal</h2>
                        <p className="text-[11px] text-slate-400">Insira seus dados para receber o PIN de segurança</p>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="(11) 99999-9999 ou e-mail"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="pl-10 h-11 text-xs rounded-xl bg-slate-950/60 border-slate-800 focus-visible:ring-amber-400"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={contact.trim().length < 6}
                        className="w-full h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2"
                      >
                        <span>Solicitar Código SMS/WhatsApp</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}

                  {/* Step 2: Separate 6-Digit OTP */}
                  {step === 2 && (
                    <motion.form
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleVerifyOTP}
                      className="space-y-4"
                    >
                      <div className="space-y-1 text-center">
                        <Badge variant="sun" className="text-[10px]">PASSO 2: AUTENTICAÇÃO PIN</Badge>
                        <h2 className="font-bold text-sm text-white">Digite o Código de 6 Dígitos</h2>
                        <p className="text-[11px] text-slate-400">Enviado para: <strong className="text-amber-400 font-mono">{contact}</strong></p>
                      </div>

                      {/* 6 Boxes Grid */}
                      <div className="flex justify-between gap-1.5 py-2">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-10 h-12 text-center text-lg font-bold font-mono bg-slate-950 border border-slate-800 rounded-xl text-amber-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                          />
                        ))}
                      </div>

                      {/* Timer & Resend */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <span>
                          {resendTimer > 0 ? (
                            <>Reenviar PIN em <strong className="text-amber-400">{resendTimer}s</strong></>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setResendTimer(45)}
                              className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" /> Reenviar PIN Agora
                            </button>
                          )}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-11 text-xs border-slate-800 rounded-xl"
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={otpDigits.join("").length < 6}
                          className="flex-1 h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2"
                        >
                          <span>Validar Autenticação</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* Step 3: Accordion Terms Acceptance */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1 text-center">
                        <Badge variant="sun" className="text-[10px]">PASSO 3: TERMOS & CONTRATO</Badge>
                        <h2 className="font-bold text-sm text-white">Contrato de Credenciamento MMN</h2>
                        <p className="text-[11px] text-slate-400">Revise as cláusulas operacionais e regulatórias</p>
                      </div>

                      {/* Expandable Accordion */}
                      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none text-xs">
                        {/* Section 1: Tax */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleSection("tax")}
                            className="w-full p-3 text-left font-bold text-white flex items-center justify-between bg-slate-900/50"
                          >
                            <span>1. Regime Tributário & Retenções (PJ/PF)</span>
                            <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "tax" && "rotate-180")} />
                          </button>
                          {expandedSection === "tax" && (
                            <div className="p-3 text-[11px] text-slate-300 space-y-1 border-t border-slate-800 leading-relaxed font-sans">
                              <p>Os repasses a consultores PJ (MEI/Simples) ocorrem via auto-faturamento eNotas sem retenção na fonte. Consultores PF têm retenção automática de IRRF e INSS via emissão de RPA.</p>
                            </div>
                          )}
                        </div>

                        {/* Section 2: VME Rule */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleSection("vme")}
                            className="w-full p-3 text-left font-bold text-white flex items-center justify-between bg-slate-900/50"
                          >
                            <span>2. Regra VME & Teto de 40% por Linha</span>
                            <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", expandedSection === "vme" && "rotate-180")} />
                          </button>
                          {expandedSection === "vme" && (
                            <div className="p-3 text-[11px] text-slate-300 space-y-1 border-t border-slate-800 leading-relaxed font-sans">
                              <p>Para qualificação aos bônus de graduação Unilevel em 7 níveis, o volume máximo aceito de uma única perna é travado em 40% do volume total da equipe.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-800 text-amber-400 focus:ring-amber-400 h-4 w-4"
                        />
                        <span>Declaro que li e aceito o Contrato Esol Energy</span>
                      </label>

                      <Button
                        type="button"
                        disabled={!acceptedTerms}
                        onClick={handleFinishOnboarding}
                        className="w-full h-11 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Assinar Digitalmente & Finalizar</span>
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Completed State */
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-base text-white">Cadastro Aprovado!</h2>
                    <p className="text-xs text-slate-400">Contrato assinado via Esol Sign com Hash NTP.</p>
                  </div>

                  <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber">
                    Entrar no App do Consultor PWA
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
