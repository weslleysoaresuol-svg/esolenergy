import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, Zap, Building, ArrowRight, MessageCircle } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolSimuladorCockpitProps {
  className?: string;
}

/**
 * `<EsolSimuladorCockpit />` — Cockpit de Viabilidade Energética 3-em-1 (V15.0 Maestro)
 * Design industrial minimalista estilo SUNS Energy, gráfico de ROI Recharts e controle tátil.
 */
export const EsolSimuladorCockpit: React.FC<EsolSimuladorCockpitProps> = ({ className = '' }) => {
  const [contaMensal, setContaMensal] = useState<number>(1800);
  const [modalidade, setModalidade] = useState<'turnkey' | 'assinatura' | 'mle'>('turnkey');

  // Cálculos financeiros
  const economiaMensalTurnkey = contaMensal * 0.92;
  const economiaAnualTurnkey = economiaMensalTurnkey * 12;
  const economia25Anos = economiaAnualTurnkey * 25;
  const paybackMeses = 36;

  const economiaMensalAssinatura = contaMensal * 0.18;
  const economiaAnualAssinatura = economiaMensalAssinatura * 12;
  const economia5AnosAssinatura = economiaAnualAssinatura * 5;

  const economiaMensalMLE = contaMensal * 0.32;
  const economiaAnualMLE = economiaMensalMLE * 12;
  const economia5AnosMLE = economiaAnualMLE * 5;

  // Dados do gráfico de ROI acumulado em 25 anos
  const chartData = [
    { ano: 'Ano 0', semSolar: contaMensal * 12 * 1, comESOL: contaMensal * 12 * 0.08 },
    { ano: 'Ano 5', semSolar: contaMensal * 12 * 5 * 1.3, comESOL: contaMensal * 12 * 5 * 0.08 },
    { ano: 'Ano 10', semSolar: contaMensal * 12 * 10 * 1.6, comESOL: contaMensal * 12 * 10 * 0.08 },
    { ano: 'Ano 15', semSolar: contaMensal * 12 * 15 * 2.0, comESOL: contaMensal * 12 * 15 * 0.08 },
    { ano: 'Ano 20', semSolar: contaMensal * 12 * 20 * 2.5, comESOL: contaMensal * 12 * 20 * 0.08 },
    { ano: 'Ano 25', semSolar: contaMensal * 12 * 25 * 3.2, comESOL: contaMensal * 12 * 25 * 0.08 },
  ];

  const handleWhatsApp = () => {
    const economia =
      modalidade === 'turnkey'
        ? economiaAnualTurnkey
        : modalidade === 'assinatura'
        ? economiaAnualAssinatura
        : economiaAnualMLE;
    const msg = encodeURIComponent(
      `Olá! Realizei uma simulação no Cockpit da ESOL Energy:\n- Fatura Mensal: R$ ${contaMensal.toLocaleString('pt-BR')}\n- Modalidade Escolhida: ${modalidade.toUpperCase()}\n- Economia Estimada: R$ ${economia.toLocaleString('pt-BR')}/ano\nGostaria de receber a análise de engenharia completa.`
    );
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <section
      className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl relative overflow-hidden ${className}`}
      id="simulador"
    >
      {/* Top Header do Cockpit */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-extrabold uppercase tracking-widest">
          <Sparkles className="size-3.5 fill-amber-400" /> COCKPIT DE VIABILIDADE ENERGÉTICA
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          Simule a Economia do Seu Imóvel
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-400 font-light">
          Ajuste o valor médio da sua conta de luz e compare a economia projetada entre as 3 modalidades ESOL.
        </p>
      </div>

      {/* Box do Slider Customizado SUNS Style */}
      <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">
            Sua Fatura Mensal de Energia:
          </label>
          <div className="px-6 py-2.5 rounded-2xl bg-slate-950 border border-amber-500/50 text-amber-400 font-mono font-black text-2xl sm:text-3xl shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]">
            R$ {contaMensal.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Input Range com Gradiente Dourado */}
        <div className="relative py-2">
          <input
            type="range"
            min="250"
            max="45000"
            step="250"
            value={contaMensal}
            onChange={(e) => setContaMensal(Number(e.target.value))}
            className="w-full h-4 rounded-xl appearance-none cursor-pointer bg-slate-950 border border-slate-800 accent-amber-400 focus:outline-none transition-all"
            style={{
              background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((contaMensal - 250) / (45000 - 250)) * 100}%, #020617 ${((contaMensal - 250) / (45000 - 250)) * 100}%, #020617 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-500 font-semibold">
          <span>R$ 250/mês</span>
          <span>R$ 20.000/mês</span>
          <span>R$ 45.000+/mês</span>
        </div>
      </div>

      {/* Gráfico Recharts de ROI */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-400" /> Curva de Gastos Acumulados em 25 Anos (Inflação Energética 8% a.a.)
          </h4>
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Projeção Homologada</span>
        </div>

        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSemSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComESOL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="ano" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Gasto']}
              />
              <Area type="monotone" dataKey="semSolar" name="Sem Energia Solar (Concessionária)" stroke="#EF4444" fillOpacity={1} fill="url(#colorSemSolar)" />
              <Area type="monotone" dataKey="comESOL" name="Com ESOL Energy" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorComESOL)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 Modalidades Estilo Industrial SUNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Opção 1: Turnkey */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setModalidade('turnkey')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative overflow-hidden ${
            modalidade === 'turnkey'
              ? 'bg-slate-900/90 border-amber-500/70 shadow-[0_0_35px_-5px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              92% Economia Real
            </span>
            <SeloVerdeEsol size="sm" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase font-display">1. Usina Própria (Turnkey)</h3>
            <p className="text-xs text-slate-400 mt-1">Usina física instalada no seu telhado/terreno com Selo Verde ESOL.</p>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Economia em 25 Anos:</span>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
              R$ {economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Payback médio: ~{paybackMeses} meses</span>
          </div>
        </motion.div>

        {/* Opção 2: Assinatura */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setModalidade('assinatura')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative overflow-hidden ${
            modalidade === 'assinatura'
              ? 'bg-slate-900/90 border-emerald-500/70 shadow-[0_0_35px_-5px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Zero Investimento
            </span>
            <Zap className="size-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase font-display">2. Energia por Assinatura</h3>
            <p className="text-xs text-slate-400 mt-1">Desconto direto na conta de luz da concessionária sem instalar nada.</p>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Economia em 5 Anos:</span>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
              R$ {economia5AnosAssinatura.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Desconto direto: ~18%/mês</span>
          </div>
        </motion.div>

        {/* Opção 3: Mercado Livre */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setModalidade('mle')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative overflow-hidden ${
            modalidade === 'mle'
              ? 'bg-slate-900/90 border-cyan-500/70 shadow-[0_0_35px_-5px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Grandes Cargas (ACL)
            </span>
            <Building className="size-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase font-display">3. Mercado Livre ANEEL</h3>
            <p className="text-xs text-slate-400 mt-1">Livre escolha do fornecedor de energia para médias e grandes indústrias.</p>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Economia em 5 Anos:</span>
            <p className="text-3xl font-black text-cyan-400 font-mono mt-0.5">
              R$ {economia5AnosMLE.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Redução tarifária: ~32%/mês</span>
          </div>
        </motion.div>
      </div>

      {/* CTA de Receber Proposta */}
      <div className="text-center pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleWhatsApp}
          className="px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_40px_-5px_rgba(245,158,11,0.6)] inline-flex items-center gap-3 cursor-pointer"
        >
          <MessageCircle className="size-5" />
          <span>Receber Estudo de Engenharia no WhatsApp</span>
          <ArrowRight className="size-4" />
        </motion.button>
      </div>
    </section>
  );
};

export default EsolSimuladorCockpit;
