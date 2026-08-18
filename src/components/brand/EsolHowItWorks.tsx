import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileSpreadsheet, Wrench, Zap, CheckCircle2 } from 'lucide-react';

export interface EsolHowItWorksProps {
  className?: string;
}

/**
 * `<EsolHowItWorks />` — Passo a Passo Explicativo Ilustrado (V16.0 Maestro)
 * 4 passos claros de contratação e ativação sem complicação para o cliente.
 */
export const EsolHowItWorks: React.FC<EsolHowItWorksProps> = ({ className = '' }) => {
  const steps = [
    {
      num: '01',
      title: 'Simulação Gratuita',
      desc: 'Em 30 segundos você descobre a economia exata no seu imóvel com nosso simulador.',
      icon: Calculator,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      num: '02',
      title: 'Projeto de Engenharia',
      desc: 'Nossos engenheiros desenham a solução ideal para o seu perfil e telhado.',
      icon: FileSpreadsheet,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      num: '03',
      title: 'Instalação & Homologação',
      desc: 'Cuidamos de 100% da burocracia com a concessionária ANEEL e montagem física.',
      icon: Wrench,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      num: '04',
      title: 'Economia Ativada',
      desc: 'Sua usina entra em operação e você passa a economizar até 95% todos os meses.',
      icon: Zap,
      color: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
    },
  ];

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Processo de Engenharia & Homologação</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Como Funciona em 4 Passos Simples
          </h2>
          <p className="font-body text-sm sm:text-base text-slate-300 font-normal">
            Sem burocracia. Do estudo de viabilidade à ligação definitiva na concessionária.
          </p>
        </div>

        {/* Grid dos 4 Passos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const IconComponent = st.icon;
            return (
              <motion.div
                key={st.num}
                whileHover={{ y: -6 }}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-slate-500">{st.num}</span>
                    <div className={`p-3 rounded-2xl border ${st.color}`}>
                      <IconComponent className="size-6" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-black text-white">{st.title}</h3>
                  <p className="font-body text-xs text-slate-300 leading-relaxed font-normal">{st.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Suporte 100% Dedicado
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EsolHowItWorks;
