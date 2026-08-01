import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Calculator, Award, Users, ShieldCheck, ArrowUpRight, DollarSign, CheckCircle2, AlertTriangle, Crown, Zap } from 'lucide-react';

export const MMNBonusSimulator: React.FC = () => {
  // Direct Sales Pool (4% Revenue Share)
  const [receitaIntermediacaoMes, setReceitaIntermediacaoMes] = useState<number>(1200000); // R$ 1.2M
  const [somaPontosAtivosVendas, setSomaPontosAtivosVendas] = useState<number>(24000); // PTS
  const [pontosConsultorSimulado, setPontosConsultorSimulado] = useState<number>(850); // PTS

  // Network Leadership (A1-A9) & VME 40%
  const [pernaAVolume, setPernaAVolume] = useState<number>(18000); // PTS
  const [pernaBVolume, setPernaBVolume] = useState<number>(8000);  // PTS
  const [pernaCVolume, setPernaCVolume] = useState<number>(6000);  // PTS

  // Calculations: 4% Direct Sales Pool
  const fundoProdutividadeQuatroPct = receitaIntermediacaoMes * 0.04;
  const valorUnitarioPonto = somaPontosAtivosVendas > 0 ? fundoProdutividadeQuatroPct / somaPontosAtivosVendas : 0;
  const repasseBonesProdutividadeConsultor = pontosConsultorSimulado * valorUnitarioPonto;

  // Calculations: Leadership VME 40%
  const volumeTotalEquipe = pernaAVolume + pernaBVolume + pernaCVolume;
  const pontosNecessariosA3 = 15000;
  const tetoVmePorPerna = pontosNecessariosA3 * 0.40; // 40% of 15.000 = 6.000 pts max per leg

  const pernaAAproveitada = Math.min(pernaAVolume, tetoVmePorPerna);
  const pernaBAproveitada = Math.min(pernaBVolume, tetoVmePorPerna);
  const pernaCAproveitada = Math.min(pernaCVolume, tetoVmePorPerna);

  const pontosValidosVmeLideranca = pernaAAproveitada + pernaBAproveitada + pernaCAproveitada;
  const isQualificadoA3 = pontosValidosVmeLideranca >= pontosNecessariosA3;
  const isPernaADominanteExcedida = pernaAVolume > tetoVmePorPerna;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-400" />
            Simulador Corporativo MMN & Validador VME V11.0
          </h2>
          <p className="text-xs text-muted-foreground">
            Rateio do Fundo de 4% de Produtividade Direta (0% VME) e Validador VME 40% para Liderança A1-A9
          </p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/40 text-xs px-3 py-1">
          ARQUITETURA V11.0 ATIVA
        </Badge>
      </div>

      {/* TRACK 1: POOL 4% DE PRODUTIVIDADE DIRETA */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm text-white">Rateio dos 4% da Receita de Produtividade Direta (0% VME)</CardTitle>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              0% TRAVA VME
            </Badge>
          </div>
          <CardDescription className="text-xs">
            A Esol reserva 4% da receita mensal e distribui via PIX aos melhores vendedores diretos de forma proporcional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Receita Intermediação Mês (R$):</span>
              <Input
                type="number"
                value={receitaIntermediacaoMes}
                onChange={(e) => setReceitaIntermediacaoMes(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Soma de Pontos Ativos no Mês:</span>
              <Input
                type="number"
                value={somaPontosAtivosVendas}
                onChange={(e) => setSomaPontosAtivosVendas(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Pontos do Consultor Simulado:</span>
              <Input
                type="number"
                value={pontosConsultorSimulado}
                onChange={(e) => setPontosConsultorSimulado(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-amber-400 font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">Fundo 4% Separado:</span>
              <strong className="text-white text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fundoProdutividadeQuatroPct)}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block">Valor Unitário do Ponto:</span>
              <strong className="text-amber-400 text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorUnitarioPonto)} / PTS
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block">Bônus PIX p/ Consultor:</span>
              <strong className="text-emerald-400 text-sm font-extrabold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(repasseBonesProdutividadeConsultor)}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TRACK 2: LIDERANÇA MMN A1-A9 E VALIDAÇÃO VME 40% */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-sm text-white">Validador de Liderança MMN A1-A9 (Trava VME 40%)</CardTitle>
            </div>
            <Badge variant="outline" className="border-amber-400/40 text-amber-400 text-[10px]">
              VME 40% APLICADO
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Testa a qualificação do Grau A3 (Mentor de Alta Performance - 15.000 PTS) com teto VME por perna (6.000 PTS)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Perna A (Volume Dominante):</span>
              <Input
                type="number"
                value={pernaAVolume}
                onChange={(e) => setPernaAVolume(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-amber-400 font-mono text-xs font-bold"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Aproveitados: {pernaAAproveitada.toLocaleString()} PTS {isPernaADominanteExcedida && '(Cap 40% Excedido)'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Perna B (Volume Paralelo 1):</span>
              <Input
                type="number"
                value={pernaBVolume}
                onChange={(e) => setPernaBVolume(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Aproveitados: {pernaBAproveitada.toLocaleString()} PTS
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400">Perna C (Volume Paralelo 2):</span>
              <Input
                type="number"
                value={pernaCVolume}
                onChange={(e) => setPernaCVolume(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Aproveitados: {pernaCAproveitada.toLocaleString()} PTS
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <ShieldCheck className={cn("h-4 w-4", isQualificadoA3 ? "text-emerald-400" : "text-amber-400")} />
                <span className="text-slate-300">Status de Qualificação no Grau A3:</span>
              </div>
              <Badge className={cn(isQualificadoA3 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border-amber-500/40")}>
                {isQualificadoA3 ? "QUALIFICADO A3" : "PENDENTE EQUILÍBRIO"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 block">Volume Bruto Equipe:</span>
                <strong className="text-white text-sm">{volumeTotalEquipe.toLocaleString()} PTS</strong>
              </div>

              <div>
                <span className="text-slate-500 block">Pontos Válidos VME (40% Cap):</span>
                <strong className={cn("text-sm font-bold", isQualificadoA3 ? "text-emerald-400" : "text-amber-400")}>
                  {pontosValidosVmeLideranca.toLocaleString()} / 15.000 PTS
                </strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
