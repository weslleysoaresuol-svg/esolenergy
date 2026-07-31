import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  ArrowRight,
  Phone,
  RotateCcw,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Calculator,
  FileSpreadsheet,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantOnboardingPage() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [contact, setContact] = React.useState("");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = React.useState(45);
  const [isOtpVerified, setIsOtpVerified] = React.useState(false);
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  // OTP Timer countdown
  React.useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
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
      setIsOtpVerified(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Light Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sun className="h-6 w-6 animate-spin-slow" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ENERGY PWA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Autenticação do Consultor</h1>
          <p className="text-xs text-slate-400">Acesso seguro via validação de PIN OTP</p>
        </div>

        {/* FAST-START VIDEO WIDGET (PLAN 33C) */}
        <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 glow-amber">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Guia Rápido de Ativação
              </span>
              <span className="text-[10px] text-slate-300">Como fazer sua 1ª venda em 3 passos (3 min)</span>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsVideoOpen(true)}
            className="h-8 text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl px-3 shrink-0 cursor-pointer"
          >
            Assistir
          </Button>
        </div>

        {/* Step Progress Bar */}
        {!isOtpVerified && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Etapa {step} de 2</span>
              <strong className="text-amber-400">{step === 1 ? "50%" : "100%"} Concluído</strong>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                initial={{ width: "50%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
              />
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!isOtpVerified ? (
                <>
                  {/* Step 1: Phone / Email Contact Input */}
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
                        <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-400">PASSO 1: IDENTIFICAÇÃO</Badge>
                        <h2 className="font-bold text-sm text-white">Informe seu WhatsApp ou E-mail</h2>
                        <p className="text-[11px] text-slate-400">Enviaremos um código PIN de 6 dígitos</p>
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
                        className="w-full h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                      >
                        <span>Enviar Código PIN</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}

                  {/* Step 2: 6 Individual OTP Boxes */}
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
                        <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-400">PASSO 2: CONFIRMAÇÃO</Badge>
                        <h2 className="font-bold text-sm text-white">Digite o PIN enviado</h2>
                        <p className="text-[11px] text-slate-400">Enviado para: <strong className="text-amber-400">{contact}</strong></p>
                      </div>

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

                      {/* Resend Timer */}
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
                          className="h-11 text-xs border-slate-800 rounded-xl cursor-pointer"
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={otpDigits.join("").length < 6}
                          className="flex-1 h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                        >
                          <span>Validar Autenticação</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </>
              ) : (
                /* OTP Verification Completed */
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-base text-white">Identidade Validada!</h2>
                    <p className="text-xs text-slate-400">PIN OTP de 6 dígitos confirmado com sucesso.</p>
                  </div>

                  {/* 3 STEPS CARDS SUMMARY */}
                  <div className="grid grid-cols-3 gap-2 text-left pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <Calculator className="h-4 w-4 text-amber-400" />
                      <span className="text-[10px] font-bold text-white block">1. Simular</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Conta em 30s</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                      <span className="text-[10px] font-bold text-white block">2. Proposta</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Com a sua Marca</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <Send className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-bold text-white block">3. Vender</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Fechar pelo Whats</span>
                    </div>
                  </div>

                  <Link to="/consultant/simulator">
                    <Button className="w-full h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber cursor-pointer mt-2">
                      Iniciar 1ª Simulação Solar Agora
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* FAST-START VIDEO MODAL (PLAN 33C) */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Como fazer sua 1ª venda em 3 passos</h3>
              </div>

              {/* Video Player Simulator Screen */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center gap-2 group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <PlayCircle className="h-12 w-12 text-amber-400 group-hover:scale-110 transition-transform relative z-10 glow-amber" />
                <span className="text-xs font-bold text-white relative z-10">Assistir Treinamento Rápido (3:00)</span>
                <span className="text-[10px] text-slate-400 relative z-10">Aprenda a simular, gerar proposta e fechar no WhatsApp</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span><strong>Simule em 30s:</strong> Digite o consumo do cliente e veja a economia em 25 anos.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-400/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span><strong>Personalize:</strong> Aplique seu Co-Branding e selecione o kit de painéis Tier 1.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-400/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span><strong>Feche o Negócio:</strong> Envie no WhatsApp e receba notificação de leitura.</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="w-full h-10 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber cursor-pointer"
              >
                Entendi, Quero Começar!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
