import * as React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ShieldCheck,
  CheckCircle2,
  Smile,
  Eye,
  RefreshCw,
  Sparkles,
  Sun,
  ArrowRight,
  UserCheck,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface LivenessStep {
  stepIndex: number;
  instruction: string;
  subInstruction: string;
  icon: any;
}

const LIVENESS_STEPS: LivenessStep[] = [
  {
    stepIndex: 1,
    instruction: "Enquadre seu rosto e sorria",
    subInstruction: "Mantenha o rosto dentro do círculo e sorria suavemente",
    icon: Smile,
  },
  {
    stepIndex: 2,
    instruction: "Pisque os olhos lentamente",
    subInstruction: "Feche e abra os olhos devagar para validação de presença",
    icon: Eye,
  },
  {
    stepIndex: 3,
    instruction: "Gire o rosto para a direita",
    subInstruction: "Faça um movimento leve para confirmar a profundidade 3D",
    icon: RefreshCw,
  },
];

export function ConsultantFacialLivenessKYC() {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const currentStep = LIVENESS_STEPS[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < LIVENESS_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <UserCheck className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">VERIFICAÇÃO KYC</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Prova de Vida Facial</h1>
          <p className="text-xs text-slate-400">Validação Biométrica com Padrão Bancário</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5 text-center">
            {/* Viewfinder Camera Frame */}
            <div className="relative w-48 h-64 mx-auto rounded-[60px] border-4 border-amber-400/80 bg-slate-950/80 overflow-hidden flex flex-col items-center justify-center shadow-2xl glow-amber">
              {/* Scanline Animation Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 via-transparent to-amber-400/10 animate-pulse pointer-events-none" />

              {isCompleted ? (
                <div className="space-y-2 p-4 text-center">
                  <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <strong className="text-sm font-black text-emerald-400 block">
                    BIOMETRIA APROVADA
                  </strong>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Liveness 100% Validado
                  </span>
                </div>
              ) : (
                <div className="space-y-3 p-4 text-center relative z-10">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400 text-amber-400 flex items-center justify-center">
                    <StepIcon className="h-6 w-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase block">
                      PASSO {currentStep.stepIndex} DE 3
                    </span>
                    <strong className="text-xs font-bold text-white block leading-tight">
                      {currentStep.instruction}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Text Box */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-300 font-medium block">
                {isCompleted ? "Sua biometria foi validada e vinculada à sua conta Esol Wallet com segurança." : currentStep.subInstruction}
              </span>
            </div>

            {/* Security Stamp */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Criptografia Biométrica Padrão ICP-Brasil</span>
            </div>

            {/* Action Button */}
            {isCompleted ? (
              <Button variant="emerald" className="w-full h-11 text-xs font-bold rounded-xl shadow-lg gap-2 cursor-pointer">
                <span>Avançar para Upload de Documento CNH/RG</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="sun"
                onClick={handleNextStep}
                className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
              >
                <span>Confirmar Passo {currentStep.stepIndex} ➔</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
