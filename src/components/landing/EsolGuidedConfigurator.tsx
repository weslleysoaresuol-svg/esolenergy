import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, DollarSign, Sparkles, Building, Zap, Sun, Award } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolGuidedConfiguratorProps {
  className?: string;
}

export const EsolGuidedConfigurator: React.FC<EsolGuidedConfiguratorProps> = ({ className = '' }) => {
  const [step, setStep] = useState<number>(1);
  const [contaMensal, setContaMensal] = useState<number>(1500);
  const [modalidade, setModalidade] = useState<'turnkey' | 'assinatura' | 'mle'>('turnkey');

  const handleValueChange = (val: number) => {
    if (isNaN(val)) {
      setContaMensal(0);
    } else {
      setContaMensal(Math.min(Math.max(0, val), 1000000));
    }
  };

  // Cálculos financeiros de alta precisão baseados na modalidade escolhida
  const percEconomia = modalidade === 'turnkey' ? 0.92 : modalidade === 'assinatura' ? 0.18 : 0.32;
  const economiaMensal = contaMensal * percEconomia;
  const economiaAnual = economiaMensal * 12;
  const economia25Anos = modalidade === 'turnkey' ? economiaAnual * 25 : economiaAnual * 5;
  const paybackMeses = modalidade === 'turnkey' ? 36 : 0;

  const handleWhatsApp = () => {
    const nomeModalidade =
      modalidade === 'turnkey' ? 'Usina Própria (Turnkey)' : modalidade === 'assinatura' ? 'Energia por Assinatura (GD)' : 'Mercado Livre ANEEL (ACL)';

    const msg = encodeURIComponent(
      `Olá! Fiz uma simulação no site da ESOL Energy:\n- Conta Mensal Atual: R$ ${contaMensal.toLocaleString('pt-BR')}\n- Modalidade Escolhida: ${nomeModalidade}\n- Economia Estimada: R$ ${economiaAnual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano\nGostaria de receber meu estudo gratuito com um engenheiro.`
    );
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <section className={`py-24 bg-[#0B132B] text-white relative overflow-hidden ${className}`} id="configurador">
      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header da Seção */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Calculator className="size-4 text-emerald-400" />
            <span>Simulador Solar Guiado em 3 Passos</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Calcule o Retorno do Seu Investimento
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Digite o valor da sua conta de luz ou arraste a barra para comparar instantaneamente as 3 modalidades ESOL.
          </p>
        </div>

        {/* Indicador de Passos 1 - 2 - 3 */}
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`size-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10 transition-all ${
                step >= s
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-500'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Card do Formulário Guiado */}
        <div className="p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8">
          <AnimatePresence mode="wait">
            
            {/* PASSO 1: DIGITAÇÃO DIRETA OU SLIDER DO VALOR MENSAL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Digite ou selecione o valor médio da sua conta de luz mensal:
                </h3>

                {/* Campo de Digitação Direta R$ */}
                <div className="py-2 max-w-md mx-auto">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute left-6 text-2xl md:text-3xl font-black text-amber-400 font-mono pointer-events-none">R$</span>
                    <input
                      type="number"
                      min="100"
                      max="1000000"
                      step="100"
                      value={contaMensal || ''}
                      onChange={(e) => handleValueChange(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full text-center text-4xl md:text-5xl font-black text-amber-400 font-mono py-4 pl-16 pr-6 rounded-2xl bg-slate-950 border border-amber-500/40 focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-2">Você pode digitar o valor no teclado ou usar a barra abaixo.</span>
                </div>

                {/* Range Slider de Apoio */}
                <div className="max-w-md mx-auto space-y-2">
                  <input
                    type="range"
                    min="300"
                    max="50000"
                    step="250"
                    value={contaMensal}
                    onChange={(e) => handleValueChange(Number(e.target.value))}
                    className="w-full h-3 rounded-xl appearance-none cursor-pointer bg-slate-950 accent-emerald-400 focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>R$ 300/mês</span>
                    <span>R$ 25.000/mês</span>
                    <span>R$ 50.000+/mês</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Avançar para Escolha da Modalidade</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASSO 2: ESCOLHA ENTRE AS 3 MODALIDADES ESOL */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Escolha a modalidade de energia solar desejada:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
                  {/* Modalidade 1: Turnkey Usina Própria */}
                  <div
                    onClick={() => setModalidade('turnkey')}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      modalidade === 'turnkey'
                        ? 'bg-slate-950 border-amber-500/80 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Usina Própria (92%)
                      </span>
                      <Sun className="size-5 text-amber-400" />
                    </div>
                    <div className="font-bold text-white text-base">1. Usina Fotovoltaica</div>
                    <p className="text-xs text-slate-400">Instalação física no seu telhado/terreno com módulos Tier-1.</p>
                  </div>

                  {/* Modalidade 2: Energia por Assinatura */}
                  <div
                    onClick={() => setModalidade('assinatura')}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      modalidade === 'assinatura'
                        ? 'bg-slate-950 border-emerald-500/80 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Sem Obras (18%)
                      </span>
                      <Zap className="size-5 text-emerald-400" />
                    </div>
                    <div className="font-bold text-white text-base">2. Energia por Assinatura</div>
                    <p className="text-xs text-slate-400">Desconto direto na fatura sem precisar instalar equipamentos.</p>
                  </div>

                  {/* Modalidade 3: Mercado Livre ANEEL */}
                  <div
                    onClick={() => setModalidade('mle')}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      modalidade === 'mle'
                        ? 'bg-slate-950 border-cyan-500/80 shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Empresas (32%)
                      </span>
                      <Building className="size-5 text-cyan-400" />
                    </div>
                    <div className="font-bold text-white text-base">3. Mercado Livre ANEEL</div>
                    <p className="text-xs text-slate-400">Migração para o mercado livre para médias e grandes indústrias.</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Voltar</span>
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Calcular Economia Estimada</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASSO 3: RESULTADO DA ECONOMIA ESTIMADA */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <SeloVerdeEsol size="sm" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Simulação Concluída • {modalidade.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Economia por Mês</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      R$ {economiaMensal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Economia Acumulada</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      R$ {economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Payback Médio</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {paybackMeses > 0 ? `~${(paybackMeses / 12).toFixed(1)} Anos` : 'Imediato'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Mudar Modalidade</span>
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-sm shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] cursor-pointer inline-flex items-center gap-3 hover:scale-105 transition-all"
                  >
                    <MessageCircle className="size-5" />
                    <span>Solicitar Estudo Gratuito no WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default EsolGuidedConfigurator;
