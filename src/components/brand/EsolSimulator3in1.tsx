import React, { useState } from 'react';
import { Calculator, Zap, ShieldCheck, ArrowRight, MessageCircle, DollarSign, Building, Sparkles } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolSimulator3in1Props {
  onSendLead?: (data: { contaMensal: number; modalidade: string; economiaAnual: number }) => void;
  className?: string;
}

/**
 * `<EsolSimulator3in1 />` — Calculadora 3-em-1 de Economia para o Cliente Final (V13.2)
 * Permite simulação em tempo real de Usina Própria, Energia por Assinatura (GD) e Mercado Livre (MLE).
 */
export const EsolSimulator3in1: React.FC<EsolSimulator3in1Props> = ({
  onSendLead,
  className = '',
}) => {
  const [contaMensal, setContaMensal] = useState<number>(1200);
  const [modalidade, setModalidade] = useState<'turnkey' | 'assinatura' | 'mle'>('turnkey');

  // Cálculos dinâmicos
  const economiaMensalTurnkey = contaMensal * 0.90; // 90% de redução
  const economiaAnualTurnkey = economiaMensalTurnkey * 12;
  const economia25Anos = economiaAnualTurnkey * 25;
  const paybackMeses = 38; // ~3.1 anos

  const economiaMensalAssinatura = contaMensal * 0.18; // 18% de desconto direto no boleto
  const economiaAnualAssinatura = economiaMensalAssinatura * 12;

  const economiaMensalMLE = contaMensal * 0.32; // 32% no Mercado Livre
  const economiaAnualMLE = economiaMensalMLE * 12;

  const handleWhatsApp = () => {
    const economia = modalidade === 'turnkey' ? economiaAnualTurnkey : modalidade === 'assinatura' ? economiaAnualAssinatura : economiaAnualMLE;
    const msg = encodeURIComponent(
      `Olá! Fiz uma simulação no site da ESOL Energy:\n- Conta Mensal Atual: R$ ${contaMensal}\n- Modalidade Escolhida: ${modalidade.toUpperCase()}\n- Economia Estimada: R$ ${economia.toLocaleString('pt-BR')}/ano\nGostaria de receber um orçamento oficial.`
    );
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="simulador">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Simulador Solar 3-em-1
        </span>
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
          Descubra Quanto Você Vai Economizar
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Ajuste o valor da sua conta de luz e compare as 3 alternativas de energia solar.
        </p>
      </div>

      {/* Slider de Consumo */}
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sua Conta de Luz Mensal:</label>
          <span className="text-2xl font-black text-amber-400 font-mono">
            R$ {contaMensal.toLocaleString('pt-BR')}
          </span>
        </div>
        <input
          type="range"
          min="250"
          max="35000"
          step="250"
          value={contaMensal}
          onChange={(e) => setContaMensal(Number(e.target.value))}
          className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-800"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>R$ 250/mês</span>
          <span>R$ 15.000/mês</span>
          <span>R$ 35.000+/mês</span>
        </div>
      </div>

      {/* Seleção de Modalidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Opção 1: Turnkey Usina Própria */}
        <div
          onClick={() => setModalidade('turnkey')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
            modalidade === 'turnkey'
              ? 'bg-slate-900 border-amber-500/60 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mais Escolhida
            </span>
            <SeloVerdeEsol size="sm" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">1. Usina Própria (Turnkey)</h3>
            <p className="text-xs text-slate-400 mt-1">Projeto físico de engenharia instalado no seu imóvel com Selo Verde ESOL.</p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia em 25 Anos:</span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              R$ {economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Payback médio: ~{paybackMeses} meses</span>
          </div>
        </div>

        {/* Opção 2: Energia por Assinatura (GD) */}
        <div
          onClick={() => setModalidade('assinatura')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
            modalidade === 'assinatura'
              ? 'bg-slate-900 border-emerald-500/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
            Sem Obras / Zero Investimento
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">2. Energia por Assinatura</h3>
            <p className="text-xs text-slate-400 mt-1">Desconto direto no boleto da concessionária sem instalar nenhum painel.</p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia Anual sem Investir:</span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              R$ {economiaAnualAssinatura.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
            </p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Desconto direto de 15% a 22%</span>
          </div>
        </div>

        {/* Opção 3: Mercado Livre de Energia */}
        <div
          onClick={() => setModalidade('mle')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
            modalidade === 'mle'
              ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
            Empresas & Indústrias (MLE)
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">3. Mercado Livre ANEEL</h3>
            <p className="text-xs text-slate-400 mt-1">Livre escolha do fornecedor de energia para média e alta tensão.</p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia Anual Estimada:</span>
            <p className="text-xl font-black text-cyan-400 font-mono">
              R$ {economiaAnualMLE.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
            </p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Economia de até 35% no ACL</span>
          </div>
        </div>
      </div>

      {/* Botão de Envio de Lead */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handleWhatsApp}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="size-5" />
          <span>Receber Orçamento no WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default EsolSimulator3in1;
