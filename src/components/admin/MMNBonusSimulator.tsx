import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Calculator, Award, Users, ShieldCheck, ArrowUpRight, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

export const MMNBonusSimulator: React.FC = () => {
  const [valVolumeEquipe, setValVolumeEquipe] = useState<number>(1000); // kWp
  const [valLinhas, setValLinhas] = useState<number>(3);
  const [ticketMedioSolen, setTicketMedioSolen] = useState<number>(35000); // R$ por usina
  const [isVmeEnabledRank, setIsVmeEnabledRank] = useState<boolean>(true);

  // MMN Unilevel Distribution (7 levels)
  const nivelPercentuais = [0.50, 0.20, 0.10, 0.07, 0.05, 0.04, 0.04];
  
  // Total Revenue & Pool Calculation
  const totalUsinasEst = Math.round(valVolumeEquipe / 10);
  const faturamentoTotalEst = totalUsinasEst * ticketMedioSolen;
  const piscinaMmnTotal = faturamentoTotalEst * 0.10; // 10% Pool

  // CASH PAYOUT IS 100% FREE OF VME (PLAN 34E)
  const comissaoPixLivre = piscinaMmnTotal * nivelPercentuais[0];

  // RANK QUALIFICATION POINTS APPLY 40% VME CAP
  const vmeMaxPorLinha = valVolumeEquipe * 0.4;
  const volumePernaPrincipalEst = valVolumeEquipe * 0.55; // 55% in dominant leg
  const pontosValidosRank = Math.min(volumePernaPrincipalEst, vmeMaxPorLinha) + (valVolumeEquipe * 0.45);
  const isVmeExceededRank = volumePernaPrincipalEst > vmeMaxPorLinha;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-400" />
            Simulador MMN & Carreira V10.0
          </h2>
          <p className="text-xs text-muted-foreground">
            Cálculo em tempo real de comissões PIX (100% livres) e validação da Regra VME (40%) para Selos
          </p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/40 text-xs px-3 py-1">
          REGRAS V10.0 ATIVAS
        </Badge>
      </div>

      {/* DUAL MODE SUMMARY CARDS (PLAN 34E) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-950/20 border-emerald-500/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> COMISSÃO PIX NO NÍVEL 1
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                100% LIVRE DE VME
              </Badge>
            </div>
            <strong className="text-2xl font-black text-white font-mono block">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoPixLivre)}
            </strong>
            <p className="text-[11px] text-muted-foreground">
              Comissão repassada sem qualquer trava ou restrição de perna.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-950/20 border-amber-500/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="h-4 w-4" /> PONTOS VÁLIDOS DE SELO (VME 40%)
              </span>
              <Badge variant="outline" className="border-amber-400/40 text-amber-400 text-[10px]">
                APENAS PARA GRADUAÇÃO
              </Badge>
            </div>
            <strong className="text-2xl font-black text-amber-400 font-mono block">
              {Math.round(pontosValidosRank).toLocaleString()} PTS VÁLIDOS
            </strong>
            <p className="text-[11px] text-muted-foreground">
              {isVmeExceededRank
                ? '⚠️ Perna dominante travada no cap de 40% exclusivamente para selos/troféus.'
                : '✅ Pontuação 100% aproveitada para o próximo selo de carreira.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SIMULATOR CONTROLS */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm text-white">Parâmetros de Simulação de Equipe</CardTitle>
          <CardDescription className="text-xs">Ajuste o volume instalado (kWp) e o número de linhas ativas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Volume Total da Rede (kWp):</span>
              <span className="text-amber-400 font-bold">{valVolumeEquipe} kWp</span>
            </div>
            <Slider
              value={[valVolumeEquipe]}
              min={100}
              max={5000}
              step={50}
              onValueChange={(val) => setValVolumeEquipe(val[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Linhas Diretas Ativas (Pernas):</span>
              <span className="text-cyan-400 font-bold">{valLinhas} Pernas</span>
            </div>
            <Slider
              value={[valLinhas]}
              min={1}
              max={10}
              step={1}
              onValueChange={(val) => setValLinhas(val[0])}
            />
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Projeção da Piscina MMN (10% das Vendas)</h4>
            <div className="space-y-1 text-xs font-mono">
              {nivelPercentuais.map((pct, idx) => (
                <div key={idx} className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                  <span className="text-slate-400">Nível {idx + 1} ({pct * 100}% da Piscina):</span>
                  <span className="text-emerald-400 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(piscinaMmnTotal * pct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
