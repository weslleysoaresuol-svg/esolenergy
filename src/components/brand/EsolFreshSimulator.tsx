import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, Building, ArrowRight, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolFreshSimulatorProps {
  className?: string;
}

/**
 * `<EsolFreshSimulator />` — Simulador Solar 3-em-1 Fintech Clean (V16.0 Maestro)
 * Estética de aplicativo bancário digital (Stripe/Nubank/Apple), extremamente intuitivo e rápido.
 */
export const EsolFreshSimulator: React.FC<EsolFreshSimulatorProps> = ({ className = '' }) => {
  const [contaMensal, setContaMensal] = useState<number>(1500);
  const [modalidade, setModalidade] = useState<'turnkey' | 'assinatura' | 'mle'>('turnkey');

  const presets = [500, 1500, 3500, 7500, 15000, 30000];

  // Cálculos financeiros
  const economiaMensalTurnkey = contaMensal * 0.92;
  const economiaAnualTurnkey = economiaMensalTurnkey * 12;
  const economia25Anos = economiaAnualTurnkey * 25;

  const economiaMensalAssinatura = contaMensal * 0.18;
  const economiaAnualAssinatura = economiaMensalAssinatura * 12;

  const economiaMensalMLE = contaMensal * 0.32;
  const economiaAnualMLE = economiaMensalMLE * 12;

  const economiaExibida =
    modalidade === 'turnkey'
      ? economiaAnualTurnkey
      : modalidade === 'assinatura'
      ? economiaAnualAssinatura
      : economiaAnualMLE;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Fiz uma simulação na ESOL Energy:\n- Fatura Mensal: R$ ${contaMensal.toLocaleString('pt-BR')}\n- Modalidade Escolhida: ${modalidade.toUpperCase()}\n- Economia Estimada: R$ ${economiaExibida.toLocaleString('pt-BR')}/ano\nGostaria de receber o orçamento oficial.`
    );
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <section className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl ${className}`} id="simulador">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="size-3.5 fill-amber-400" /> SIMULADOR FINTECH FAST
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Simule Sua Economia em 30 Segundos
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-400 font-normal">
          Escolha o valor da sua fatura mensal e veja na hora o retorno financeiro.
        </p>
      </div>

      {/* Box Principal do Simulador Clean */}
      <div className="max-w-3xl mx-auto p-6 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl space-y-8 shadow-2xl">
        {/* Passo 1: Valor da Fatura */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Qual o valor médio da sua conta de luz?</label>
            <span className="text-3xl font-black text-amber-400 font-mono">
              R$ {contaMensal.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Presets Rápidos */}
          <div className="flex flex-wrap gap-2 pt-1">
            {presets.map((pr) => (
              <button
                key={pr}
                onClick={() => setContaMensal(pr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  contaMensal === pr
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                R$ {pr.toLocaleString('pt-BR')}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="relative py-2">
            <input
              type="range"
              min="300"
              max="45000"
              step="250"
              value={contaMensal}
              onChange={(e) => setContaMensal(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-950 border border-slate-800 accent-amber-400"
            />
          </div>
        </div>

        {/* Passo 2: Modalidade */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">2. Escolha o modelo ideal para você:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setModalidade('turnkey')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                modalidade === 'turnkey'
                  ? 'bg-slate-950 border-amber-500 text-white shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400">Usina Própria</span>
                <SeloVerdeEsol size="sm" />
              </div>
              <span className="text-[11px] block text-slate-400">Até 95% de desconto e patrimônio real.</span>
            </button>

            <button
              onClick={() => setModalidade('assinatura')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                modalidade === 'assinatura'
                  ? 'bg-slate-950 border-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">Assinatura (GD)</span>
                <Zap className="size-4 text-emerald-400" />
              </div>
              <span className="text-[11px] block text-slate-400">Sem obras e sem investimento inicial.</span>
            </button>

            <button
              onClick={() => setModalidade('mle')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                modalidade === 'mle'
                  ? 'bg-slate-950 border-cyan-500 text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-400">Mercado Livre</span>
                <Building className="size-4 text-cyan-400" />
              </div>
              <span className="text-[11px] block text-slate-400">Para médias e grandes indústrias.</span>
            </button>
          </div>
        </div>

        {/* Passo 3: Resultado & CTA */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">ECONOMIA ESTIMADA POR ANO:</span>
            <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono block mt-1">
              R$ {economiaExibida.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all duration-300 shadow-[0_0_25px_-4px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="size-5" />
            <span>Receber Orçamento Oficial no WhatsApp</span>
            <ArrowRight className="size-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default EsolFreshSimulator;
