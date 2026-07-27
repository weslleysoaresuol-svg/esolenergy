import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Send,
  X,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface WithdrawalDetails {
  id: string;
  consultor: string;
  chavePix: string;
  tipoChave: string;
  valorBruto: number;
  impostos: number;
  valorLiquido: number;
}

interface WithdrawalApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalDetails | null;
  onSuccess?: (id: string) => void;
}

export function WithdrawalApprovalModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}: WithdrawalApprovalModalProps) {
  const [mfaCode, setMfaCode] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [txHash, setTxHash] = React.useState("");

  if (!isOpen || !withdrawal) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleConfirmApproval = () => {
    if (mfaCode.length < 6) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTxHash("0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      if (onSuccess) onSuccess(withdrawal.id);
    }, 1500);
  };

  const handleResetModal = () => {
    setMfaCode("");
    setIsProcessing(false);
    setIsSuccess(false);
    setTxHash("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl dark:bg-slate-950 dark:border-slate-800 space-y-4 p-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">Autorização de Saque PIX (MFA AAL2)</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleResetModal} className="h-7 w-7 rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!isSuccess ? (
            <div className="space-y-4 text-xs">
              {/* Withdrawal Summary */}
              <div className="p-3.5 rounded-xl bg-accent/40 border border-border/50 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solicitante:</span>
                  <strong className="text-foreground">{withdrawal.consultor}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <strong className="text-foreground">{withdrawal.chavePix}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Valor Líquido PIX:</span>
                  <strong className="text-emerald-500 text-sm">{formatCurrency(withdrawal.valorLiquido)}</strong>
                </div>
              </div>

              {/* MFA Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  <span>Código de Autenticação TOTP (6 dígitos)</span>
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center font-mono font-bold text-lg tracking-widest h-11 bg-background/50 border-border/50 focus-visible:ring-amber-400"
                />
                <p className="text-[10px] text-muted-foreground">Digite o código do aplicativo autenticador (Google Authenticator)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleResetModal} className="h-9 text-xs rounded-xl">
                  Cancelar
                </Button>

                <Button
                  variant="sun"
                  size="sm"
                  disabled={mfaCode.length < 6 || isProcessing}
                  onClick={handleConfirmApproval}
                  className="h-9 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Enviando Ordem BaaS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Autorizar PIX MFA</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Success Screen */
            <div className="text-center space-y-4 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </motion.div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground">PIX Enviado com Sucesso!</h4>
                <p className="text-xs text-muted-foreground">Ordem BaaS liquidada em 1.2s</p>
              </div>

              <div className="p-3 rounded-xl bg-accent/40 border border-border/40 font-mono text-[10px] space-y-1 text-left">
                <span className="text-muted-foreground block">Hash SHA-256 da Operação:</span>
                <strong className="text-amber-400 block truncate">{txHash}</strong>
              </div>

              <Button variant="sun" size="sm" onClick={handleResetModal} className="w-full text-xs font-bold text-slate-950 rounded-xl">
                Concluir
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
