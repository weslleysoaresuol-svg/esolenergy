import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  DollarSign,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Sparkles,
  Sun,
  ArrowRight,
  User,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface PixKeyType {
  id: "cpf" | "email" | "phone" | "evp";
  label: string;
  placeholder: string;
}

const PIX_KEY_TYPES: PixKeyType[] = [
  { id: "cpf", label: "CPF / CNPJ", placeholder: "000.000.000-00" },
  { id: "email", label: "E-mail", placeholder: "consultor@esolenergy.com.br" },
  { id: "phone", label: "Celular", placeholder: "(11) 99999-8888" },
  { id: "evp", label: "Chave Aleatória", placeholder: "a1b2c3d4-e5f6-7890-abcd-1234567890ab" },
];

export function ConsultantPixWithdrawalModal() {
  const availableBalance = 8920.5;
  const [withdrawalAmount, setWithdrawalAmount] = React.useState<string>("8920.50");
  const [selectedKeyType, setSelectedKeyType] = React.useState<"cpf" | "email" | "phone" | "evp">("cpf");
  const [pixKeyValue, setPixKeyValue] = React.useState<string>("123.456.789-00");
  const [isValidated, setIsValidated] = React.useState<boolean>(true);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleSetPercentage = (pct: number) => {
    const calculated = (availableBalance * pct) / 100;
    setWithdrawalAmount(calculated.toFixed(2));
  };

  const currentKeyTypeObj = PIX_KEY_TYPES.find((k) => k.id === selectedKeyType) || PIX_KEY_TYPES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <ArrowDownLeft className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">SAQUE PIX</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Solicitar Saque PIX</h1>
          <p className="text-xs text-slate-400">Transferência Instantânea para sua Conta Bank</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Balance Header Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Saldo Disponível</span>
                <strong className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(availableBalance)}
                </strong>
              </div>
              <Badge variant="emerald" className="text-[9px]">PIX LIBERADO</Badge>
            </div>

            {/* Amount Input & Percentage Buttons */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                Valor do Saque (R$)
              </Label>
              <Input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="h-12 text-lg font-black text-amber-400 bg-slate-950/80 border-slate-800 font-mono focus-visible:ring-amber-400"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: "25%", pct: 25 },
                  { label: "50%", pct: 50 },
                  { label: "75%", pct: 75 },
                  { label: "100%", pct: 100 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSetPercentage(item.pct)}
                    className="py-1.5 rounded-xl text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-400 hover:text-amber-400 transition-all font-mono"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PIX Key Type Selector */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                Tipo de Chave PIX
              </Label>

              <div className="grid grid-cols-2 gap-1.5">
                {PIX_KEY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedKeyType(type.id)}
                    className={cn(
                      "py-2 px-2 rounded-xl text-[11px] font-bold transition-all border text-center cursor-pointer truncate",
                      selectedKeyType === type.id
                        ? "bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <Input
                  type="text"
                  value={pixKeyValue}
                  onChange={(e) => setPixKeyValue(e.target.value)}
                  placeholder={currentKeyTypeObj.placeholder}
                  className="h-10 text-xs rounded-xl bg-slate-950/80 border-slate-800 font-mono focus-visible:ring-amber-400"
                />
              </div>
            </div>

            {/* Account Validation Card */}
            {isValidated && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> TITULARIDADE CONFIRMADA
                </div>
                <div className="text-[11px] text-white">
                  Roberto Fonseca da Silva
                </div>
                <div className="text-[10px] text-slate-400">
                  Banco Inter S.A. • Ag 0001 • Conta 1234567-8
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Avançar para Autenticação 2FA / MFA</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
