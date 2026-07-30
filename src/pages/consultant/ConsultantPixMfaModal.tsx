import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  ArrowRight,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantPixMfaModal() {
  const [mfaChannel, setMfaChannel] = React.useState<"sms" | "totp">("sms");
  const [pinValues, setPinValues] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(54);

  const handlePinChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newPin = [...pinValues];
    newPin[index] = val;
    setPinValues(newPin);

    // Auto verify when filled 6 digits
    if (index === 5 && val !== "") {
      setTimeout(() => {
        setIsSuccess(true);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Lock className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">AUTENTICAÇÃO MFA</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Segurança do Saque</h1>
          <p className="text-xs text-slate-400">Confirmação de 2º Fator de Autenticação</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {isSuccess ? (
              /* Success Receipt View */
              <div className="space-y-4 text-center py-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center glow-amber">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div className="space-y-1">
                  <Badge variant="emerald" className="text-[9px]">
                    PIX TRANSFERIDO COM SUCESSO
                  </Badge>
                  <h2 className="text-2xl font-black text-white font-mono">R$ 8.920,50</h2>
                  <p className="text-xs text-slate-400">Enviado para Banco Inter S.A.</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 text-left space-y-1">
                  <div className="flex justify-between">
                    <span>ID Transação:</span>
                    <strong className="text-slate-200">PIX-98214-E8291</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Data/Hora:</span>
                    <strong className="text-slate-200">30/07/2026 19:14:02</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Autenticação:</span>
                    <strong className="text-emerald-400">MFA Criptografado OK</strong>
                  </div>
                </div>

                <Button variant="emerald" className="w-full h-11 text-xs font-bold rounded-xl shadow-lg gap-2 cursor-pointer">
                  <Receipt className="h-4 w-4" />
                  <span>Concluir & Retornar à Carteira</span>
                </Button>
              </div>
            ) : (
              /* 2FA Code Input View */
              <div className="space-y-5">
                {/* 2FA Channel Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMfaChannel("sms")}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      mfaChannel === "sms"
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>SMS / WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMfaChannel("totp")}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      mfaChannel === "totp"
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Authenticator</span>
                  </button>
                </div>

                {/* Info Text */}
                <div className="text-center space-y-1">
                  <span className="text-xs text-slate-300 font-medium block">
                    {mfaChannel === "sms"
                      ? "Digite o código de 6 dígitos enviado para (19) 98765-****"
                      : "Insira o código gerado no seu aplicativo autenticador"}
                  </span>
                </div>

                {/* 6-Digit OTP Pin Grid */}
                <div className="grid grid-cols-6 gap-1.5">
                  {pinValues.map((val, idx) => (
                    <Input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      className="h-12 text-center text-lg font-black text-amber-400 bg-slate-950 border-slate-800 rounded-xl font-mono focus-visible:ring-amber-400"
                    />
                  ))}
                </div>

                {/* Resend Code Timer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-400" /> Reenviar código em {timerSeconds}s
                  </span>
                  <button type="button" className="text-amber-400 font-bold hover:underline cursor-pointer">
                    Reenviar SMS
                  </button>
                </div>

                {/* Action Button */}
                <Button
                  variant="sun"
                  onClick={() => setIsSuccess(true)}
                  className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                >
                  <span>Confirmar & Efetivar Saque PIX</span>
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
