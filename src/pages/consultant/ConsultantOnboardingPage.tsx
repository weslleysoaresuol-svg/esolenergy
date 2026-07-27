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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantOnboardingPage() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [contact, setContact] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.trim().length > 5) {
      setStep(2);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      setStep(3);
    }
  };

  const handleFinishOnboarding = () => {
    if (acceptedTerms) {
      setIsCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
      {/* Background Solar Glow Effect */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sun className="h-6 w-6 animate-spin-slow" />
            <span className="font-extrabold text-sm tracking-wider uppercase">Esol Energy PWA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Portal do Consultor Solar</h1>
          <p className="text-xs text-slate-400">Cadastre-se e comece a rentabilizar com energia limpa</p>
        </div>

        {/* Step Indicator */}
        {!isCompleted && (
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === i ? "w-8 bg-amber-400 glow-amber" : step > i ? "w-4 bg-emerald-500" : "w-4 bg-slate-800"
                )}
              />
            ))}
          </div>
        )}

        {/* Main Card Step Forms */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!isCompleted ? (
                <>
                  {/* Step 1: Contact Input */}
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
                        <Badge variant="sun" className="text-[10px]">Passo 1 de 3</Badge>
                        <h2 className="font-bold text-sm text-white">Informe seu WhatsApp ou E-mail</h2>
                        <p className="text-[11px] text-slate-400">Enviaremos um PIN de segurança para validação</p>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                        <span>Receber Código de Acesso</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}

                  {/* Step 2: OTP Verification */}
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
                        <Badge variant="sun" className="text-[10px]">Passo 2 de 3</Badge>
                        <h2 className="font-bold text-sm text-white">Digite o Código de 6 Dígitos</h2>
                        <p className="text-[11px] text-slate-400">Enviado para: <strong className="text-amber-400">{contact}</strong></p>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            className="pl-10 h-11 text-center font-mono font-bold text-lg tracking-widest rounded-xl bg-slate-950/60 border-slate-800 focus-visible:ring-amber-400"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
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
                          disabled={otpCode.length < 6}
                          className="flex-1 h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2"
                        >
                          <span>Confirmar PIN</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* Step 3: Terms Acceptance */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1 text-center">
                        <Badge variant="sun" className="text-[10px]">Passo 3 de 3</Badge>
                        <h2 className="font-bold text-sm text-white">Termos de Parceria Comercial</h2>
                        <p className="text-[11px] text-slate-400">Aceite as regras de repasse Unilevel MMN</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-2 max-h-36 overflow-y-auto scrollbar-none font-sans leading-relaxed">
                        <p>1. O consultor concorda com a retenção de tributos de acordo com o seu regime (PJ ou PF).</p>
                        <p>2. Os repasses Unilevel em 7 níveis são condicionados ao cumprimento do Volume Mínimo e VME (40%).</p>
                        <p>3. Os dados pessoais são protegidos sob a LGPD com suporte a biometria facial e-KYC.</p>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-800 text-amber-400 focus:ring-amber-400 h-4 w-4"
                        />
                        <span>Li e concordo com os Termos e Contrato MMN</span>
                      </label>

                      <Button
                        type="button"
                        disabled={!acceptedTerms}
                        onClick={handleFinishOnboarding}
                        className="w-full h-11 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Concluir Onboarding PWA</span>
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Onboarding Completed Success Screen */
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
                    <h2 className="font-bold text-base text-white">Bem-vindo ao Esol Energy!</h2>
                    <p className="text-xs text-slate-400">Seu cadastro de consultor foi aprovado com sucesso.</p>
                  </div>

                  <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber">
                    Acessar Dashboard do Consultor PWA
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
