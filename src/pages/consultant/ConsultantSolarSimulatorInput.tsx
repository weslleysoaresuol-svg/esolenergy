import * as React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Zap,
  Calculator,
  Camera,
  UploadCloud,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ConsultantSolarSimulatorInput() {
  const [kwhValue, setKwhValue] = React.useState<number>(850);
  const [billValue, setBillValue] = React.useState<number>(850.0);
  const [utility, setUtility] = React.useState<string>("CPFL Paulista");
  const [phaseType, setPhaseType] = React.useState<"mono" | "bi" | "tri">("bi");
  const [hasScannedBill, setHasScannedBill] = React.useState<boolean>(false);

  const handleScanBill = () => {
    setHasScannedBill(true);
    setKwhValue(920);
    setBillValue(945.5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Calculator className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">SIMULADOR SOLAR EPC</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Dimensionamento Rápidos</h1>
          <p className="text-xs text-slate-400">Passo 1 de 2: Dados de Consumo Elétrico</p>
        </div>

        {/* Main Card Form */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Bill OCR Scanner Button */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-dashed border-amber-400/40 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                <Camera className="h-4 w-4" />
                <span>Leitor Inteligente de Fatura OCR</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Tire uma foto da conta de luz para preenchimento automático.
              </p>
              <Button
                type="button"
                variant={hasScannedBill ? "emerald" : "outline"}
                size="sm"
                onClick={handleScanBill}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer w-full"
              >
                {hasScannedBill ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Fatura Lido (920 kWh)</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Escanear Foto da Fatura</span>
                  </>
                )}
              </Button>
            </div>

            {/* kWh Slider & Number Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label className="text-xs font-bold text-slate-300">Consumo Mensal (kWh)</Label>
                <strong className="text-base font-extrabold text-amber-400 font-mono">{kwhValue} kWh/mês</strong>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="25"
                value={kwhValue}
                onChange={(e) => setKwhValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
              />
            </div>

            {/* Bill R$ Value Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Valor Médio da Fatura (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="number"
                  value={billValue}
                  onChange={(e) => setBillValue(Number(e.target.value))}
                  className="pl-10 h-11 text-xs rounded-2xl bg-slate-950/80 border-slate-800 font-mono focus-visible:ring-amber-400"
                />
              </div>
            </div>

            {/* Utility Distributor Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Concessionária de Energia</Label>
              <select
                value={utility}
                onChange={(e) => setUtility(e.target.value)}
                className="w-full h-11 px-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="CPFL Paulista">CPFL Paulista (SP)</option>
                <option value="Enel SP">Enel SP</option>
                <option value="CEMIG">CEMIG (MG)</option>
                <option value="Light">Light (RJ)</option>
                <option value="Copel">Copel (PR)</option>
                <option value="Neoenergia">Neoenergia (PE/BA)</option>
              </select>
            </div>

            {/* Phase Type Grid */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Tipo de Ligação Elétrica</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mono", label: "Monofásico" },
                  { id: "bi", label: "Bifásico" },
                  { id: "tri", label: "Trifásico" },
                ].map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setPhaseType(phase.id as any)}
                    className={cn(
                      "py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border",
                      phaseType === phase.id
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                    )}
                  >
                    {phase.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Calcular Dimensionamento Solar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
