import React, { useState } from 'react';
import { Calculator, Zap, ShieldCheck, ArrowRight, MessageCircle, DollarSign, Building, Sparkles, CheckCircle2 } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolSimulator3in1Props {
  onSendLead?: (data: { contaMensal: number; modalidade: string; economiaAnual: number }) => void;
  className?: string;
}

/**
 * `<EsolSimulator3in1 />` — Calculadora 3-em-1 Fintech Otimizada (V13.2)
 * Design moderno com slider customizado em gradiente de luz solar e comparativo claro de ROI.
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
  const paybackMeses = 36; // ~3.0 anos

  const economiaMensalAssinatura = contaMensal * 0.18; // 18% de desconto direto no boleto
  const economiaAnualAssinatura = economiaMensalAssinatura * 12;
  const economia5AnosAssinatura = economiaAnualAssinatura * 5;

  const economiaMensalMLE = contaMensal * 0.32; // 32% no Mercado Livre
  const economiaAnualMLE = economiaMensalMLE * 12;
  const economia5AnosMLE = economiaAnualMLE * 5;

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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="size-3.5" /> SIMULADOR SOLAR 3-EM-1
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Descubra Quanto Você Vai Economizar
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Ajuste o valor da sua conta de luz e compare as 3 alternativas de energia solar.
        </p>
      </div>

      {/* Slider Customizado Fintech */}
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sua Conta de Luz Mensal:</label>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            R$ {contaMensal.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Input Range Customizado */}
        <div className="relative py-2">
          <input
            type="range"
            min="250"
            max="35000"
            step="250"
            value={contaMensal}
            onChange={(e) => setContaMensal(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-950 accent-amber-400 border border-slate-800 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((contaMensal - 250) / (35000 - 250)) * 100}%, #020617 ${((contaMensal - 250) / (35000 - 250)) * 100}%, #020617 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
          <span>R$ 250/mês</span>
          <span>R$ 15.000/mês</span>
          <span>R$ 35.000+/mês</span>
        </div>
      </div>

      {/* Seleção das 3 Modalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Opção 1: Turnkey Usina Própria */}
        <div
          onClick={() => setModalidade('turnkey')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
            modalidade === 'turnkey'
              ? 'bg-slate-900/90 border-amber-500/70 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mais Escolhida (95% Economia)
            </span>
            <SeloVerdeEsol size="sm" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">1. Usina Própria (Turnkey)</h3>
            <p className="text-xs text-slate-400 mt-1">Usina física instalada no seu telhado/terreno com Selo Verde ESOL.</p>
          </div>
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia em 25 Anos:</span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              R$ {economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Payback médio: ~{paybackMeses} meses</span>
          </div>
        </div>

        {/* Opção 2: Energia por Assinatura (GD) */}
        <div
          onClick={() => setModalidade('assinatura')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
            modalidade === 'assinatura'
              ? 'bg-slate-900/90 border-emerald-500/70 shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sem Obras / Zero Investimento
            </span>
            <Zap className="size-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">2. Energia por Assinatura</h3>
            <p className="text-xs text-slate-400 mt-1">Desconto direto na conta de luz da concessionária sem instalar nada.</p>
          </div>
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia em 5 Anos:</span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              R$ {economia5AnosAssinatura.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Desconto direto: ~18%/mês</span>
          </div>
        </div>

        {/* Opção 3: Mercado Livre ANEEL (MLE) */}
        <div
          onClick={() => setModalidade('mle')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
            modalidade === 'mle'
              ? 'bg-slate-900/90 border-cyan-500/70 shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)]'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Empresas & Indústrias (ACL)
            </span>
            <Building className="size-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">3. Mercado Livre ANEEL</h3>
            <p className="text-xs text-slate-400 mt-1">Livre escolha do fornecedor de energia para empresas de média e alta tensão.</p>
          </div>
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Economia em 5 Anos:</span>
            <p className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              R$ {economia5AnosMLE.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">Redução tarifária: ~32%/mês</span>
          </div>
        </div>
      </div>

      {/* Botão de Solicitação de Proposta */}
      <div className="text-center pt-4">
        <button
          onClick={handleWhatsApp}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] transition-all duration-300 inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
        >
          <MessageCircle className="size-4" />
          <span>Receber Proposta Oficial no WhatsApp</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default EsolSimulator3in1;
