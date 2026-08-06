import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, DollarSign, Sparkles, Building, Zap, Sun } from 'lucide-react';

export interface EsolGuidedConfiguratorProps {
  className?: string;
}

export const EsolGuidedConfigurator: React.FC<EsolGuidedConfiguratorProps> = ({ className = '' }) => {
  const [step, setStep] = useState<number>(1);
  const [contaMensal, setContaMensal] = useState<number>(1500);
  const [tipoImovel, setTipoImovel] = useState<'residencial' | 'comercial' | 'agro'>('residencial');

  // Cálculos financeiros
  const economiaMensal = contaMensal * 0.92;
  const economiaAnual = economiaMensal * 12;
  const economia25Anos = economiaAnual * 25;
  const paybackAnos = 3.2;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Configurei minha usina solar no site da ESOL Energy:\n- Conta Mensal: R$ ${contaMensal.toLocaleString('pt-BR')}\n- Categoria: ${tipoImovel.toUpperCase()}\n- Economia Estimada em 25 anos: R$ ${economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}\nGostaria de solicitar meu estudo gratuito com um engenheiro.`
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
            <span>Configurador Solar Guiado em 3 Passos</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Calcule o Retorno do Seu Investimento
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Simule instantaneamente o tamanho da sua usina e quanto dinheiro você vai economizar nos próximos 25 anos.
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
            
            {/* PASSO 1: VALOR DA CONTA MENSAL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Qual é o valor médio da sua conta de luz mensal?
                </h3>

                <div className="py-4 max-w-md mx-auto">
                  <div className="text-4xl md:text-5xl font-black text-amber-400 font-mono py-4 px-6 rounded-2xl bg-slate-950 border border-amber-500/30 inline-block shadow-inner">
                    R$ {contaMensal.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <input
                    type="range"
                    min="300"
                    max="50000"
                    step="250"
                    value={contaMensal}
                    onChange={(e) => setContaMensal(Number(e.target.value))}
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
                    <span>Avançar para Categoria</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASSO 2: CATEGORIA DE IMÓVEL */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Selecione o perfil da sua propriedade:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
                  {[
                    { id: 'residencial', label: 'Residencial', desc: 'Casas & Condomínios', icon: Sun },
                    { id: 'comercial', label: 'Comercial', desc: 'Lojas & Galpões', icon: Building },
                    { id: 'agro', label: 'Agronegócio', desc: 'Fazendas & Irrigação', icon: Zap },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = tipoImovel === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTipoImovel(item.id as any)}
                        className={`p-6 rounded-2xl border text-center space-y-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-950 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`size-12 mx-auto rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                          <Icon className="size-6" />
                        </div>
                        <div className="font-bold text-white text-base">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </button>
                    );
                  })}
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
                    <span>Ver Resultado Completo</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASSO 3: RESULTADO FINAL & PROPOSTA */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                  <CheckCircle2 className="size-4" /> Simulação Concluída com Sucesso
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Economia por Mês</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      R$ {economiaMensal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Economia em 25 Anos</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      R$ {economia25Anos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase">Payback Estimado</div>
                    <div className="text-2xl font-black text-white font-mono">~{paybackAnos} Anos</div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Ajustar Dados</span>
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-sm shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] cursor-pointer inline-flex items-center gap-3 hover:scale-105 transition-all"
                  >
                    <MessageCircle className="size-5" />
                    <span>Solicitar Estudo Gratuito CREA no WhatsApp</span>
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
