import * as React from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Zap,
  DollarSign,
  TrendingUp,
  Award,
  ShieldAlert,
  Percent,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function MMNBonusSimulator() {
  const [vendasDiretasKwp, setVendasDiretasKwp] = React.useState([45]);
  const [volumeEquipeKwp, setVolumeEquipeKwp] = React.useState([650]);
  const [linhasAtivas, setLinhasAtivas] = React.useState([4]);

  // Dynamic calculations based on solar pricing rules
  const valVendasDiretas = vendasDiretasKwp[0];
  const valVolumeEquipe = volumeEquipeKwp[0];
  const valLinhas = linhasAtivas[0];

  // Average price R$ 4.000 / kWp
  const faturamentoDireto = valVendasDiretas * 4000;
  const comissaoDireta = faturamentoDireto * 0.08; // 8% comissão direta

  const faturamentoEquipe = valVolumeEquipe * 4000;
  const comissaoUnilevel = faturamentoEquipe * 0.05; // 5% médio nos 7 níveis

  // VME Rule: 40% cap per leg
  const vmeMaxPorLinha = valVolumeEquipe * 0.4;
  const vmeWarning = valVolumeEquipe > 500 && valLinhas < 3;

  // Career Bonus & Rank calculation
  let bonusCarreira = 0;
  let graduacao = "Consultor Bronze";
  if (valVolumeEquipe >= 1000 && valLinhas >= 5) {
    graduacao = "Presidente Black";
    bonusCarreira = 25000;
  } else if (valVolumeEquipe >= 500 && valLinhas >= 4) {
    graduacao = "Diretor Diamante";
    bonusCarreira = 10000;
  } else if (valVolumeEquipe >= 200 && valLinhas >= 3) {
    graduacao = "Gerente Ouro";
    bonusCarreira = 4000;
  } else if (valVolumeEquipe >= 50 && valLinhas >= 2) {
    graduacao = "Supervisor Prata";
    bonusCarreira = 1500;
  }

  const poolGlobal = graduacao === "Presidente Black" ? faturamentoEquipe * 0.02 : 0;
  const ganhosTotais = comissaoDireta + comissaoUnilevel + bonusCarreira + poolGlobal;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-500" />
            <span>Simulador de Bônus MMN & Regras de Trava Unilevel</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Cálculo em tempo real de comissões, bônus de carreira e validação da Regra VME (40%)
          </CardDescription>
        </div>

        <Badge variant="sun" className="gap-1 text-[10px]">
          <Award className="h-3 w-3" />
          {graduacao.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-accent/30 p-4 rounded-2xl border border-border/50">
          {/* Slider 1: Vendas Diretas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Vendas Diretas (kWp)</span>
              <span className="font-mono font-bold text-amber-500">{valVendasDiretas} kWp</span>
            </div>
            <Slider
              value={vendasDiretasKwp}
              onValueChange={setVendasDiretasKwp}
              min={0}
              max={300}
              step={5}
            />
            <p className="text-[10px] text-muted-foreground">Faturamento Direto: {formatCurrency(faturamentoDireto)}</p>
          </div>

          {/* Slider 2: Volume da Equipe */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Volume da Equipe (kWp)</span>
              <span className="font-mono font-bold text-emerald-500">{valVolumeEquipe} kWp</span>
            </div>
            <Slider
              value={volumeEquipeKwp}
              onValueChange={setVolumeEquipeKwp}
              min={0}
              max={2000}
              step={20}
            />
            <p className="text-[10px] text-muted-foreground">Teto VME (40%/Linha): {valVolumeEquipe * 0.4} kWp</p>
          </div>

          {/* Slider 3: Linhas Ativas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Linhas de Frente Ativas</span>
              <span className="font-mono font-bold text-cyan-500">{valLinhas} Linhas</span>
            </div>
            <Slider
              value={linhasAtivas}
              onValueChange={setLinhasAtivas}
              min={1}
              max={10}
              step={1}
            />
            <p className="text-[10px] text-muted-foreground">Requisito para graduação</p>
          </div>
        </div>

        {/* VME Warning Notice */}
        {vmeWarning && (
          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              <strong>Alerta de Trava VME:</strong> Volume concentrado em poucas linhas! Abra mais linhas ativas para qualificar a graduação.
            </span>
          </div>
        )}

        {/* Output Earnings Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Comissão Direta (8%)</span>
            <strong className="text-lg font-bold font-mono text-foreground">{formatCurrency(comissaoDireta)}</strong>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Unilevel 7 Níveis (5%)</span>
            <strong className="text-lg font-bold font-mono text-emerald-500">{formatCurrency(comissaoUnilevel)}</strong>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Bônus de Carreira</span>
            <strong className="text-lg font-bold font-mono text-cyan-500">{formatCurrency(bonusCarreira)}</strong>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-400/40 bg-amber-400/10 shadow-lg glow-amber/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">Ganhos Totais Estimados</span>
            <strong className="text-xl font-extrabold font-mono text-amber-400">{formatCurrency(ganhosTotais)}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
