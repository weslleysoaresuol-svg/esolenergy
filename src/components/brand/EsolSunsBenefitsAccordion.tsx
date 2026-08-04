import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';

export interface EsolSunsBenefitsAccordionProps {
  className?: string;
}

/**
 * `<EsolSunsBenefitsAccordion />` — Seção de Benefícios Inspirada na SUNS Energy (V15.0 Maestro)
 * Accordion expansível em estática industrial com caixas altas, bordas hairlines e tipografia técnica.
 */
export const EsolSunsBenefitsAccordion: React.FC<EsolSunsBenefitsAccordionProps> = ({ className = '' }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const benefits = [
    {
      title: 'CAPACIDADE ÉPICA (kWp)',
      desc: 'Projetos fotovoltaicos comerciais e industriais de alta escala com suporte de até 150 kWp por inversor e arranjos modulares ilimitados.',
    },
    {
      title: 'ECONOMIA IMEDIATA DE ATÉ 95%',
      desc: 'Redução drástica na conta de luz da concessionária desde o primeiro mês de homologação da usina.',
    },
    {
      title: 'ASSINATURA GD SEM OBRAS',
      desc: 'Injeção direta de créditos de energia solar na sua fatura sem necessidade de instalar equipamentos ou realizar intervenções no seu imóvel.',
    },
    {
      title: 'ZERO EMISSÃO & SUSTENTABILIDADE ESG',
      desc: 'Energia 100% limpa, renovável e certificada, substituindo geradores a diesel poluentes e gerando créditos ambientais.',
    },
    {
      title: 'OPERAÇÃO SILENCIOSA & ZERO MANUTENÇÃO',
      desc: 'Sem partes móveis, trocas de óleo ou ruídos. Geração continua e totalmente automatizada com telemetria 24/7.',
    },
    {
      title: 'SISTEMA PLUG-AND-PLAY',
      desc: 'Operação intuitiva sem necessidade de treinamentos complexos ou contratação de equipe especializada dedicada.',
    },
    {
      title: 'INDEPENDÊNCIA & AUTONOMIA ENERGÉTICA',
      desc: 'Proteção contra aumentos de tarifas das concessionárias e inflação energética pelos próximos 25 anos.',
    },
    {
      title: 'RASTREABILIDADE ESG & SELO VERDE ESOL',
      desc: 'Certificação oficial com QR Code e auditoria ANEEL/Lei 14.300 que comprova a origem verde da sua energia.',
    },
  ];

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl ${className}`}>
      {/* Header Estilo SUNS Benefits */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-8">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
            VANTAGENS COMPETITIVAS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-white tracking-tight">
            Benefícios
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono max-w-sm">
          A energia solar oferece autonomia e economia real. Você apenas colhe os resultados.
        </p>
      </div>

      {/* Grid de Accordions Minimalistas SUNS Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
        {benefits.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border-b border-slate-800/80 pb-4 transition-colors"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex items-center justify-between py-3 text-left group cursor-pointer"
              >
                <h3 className={`font-mono text-sm sm:text-base font-extrabold uppercase tracking-wider transition-colors ${
                  isOpen ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {item.title}
                </h3>
                <div className={`p-1.5 rounded-lg border transition-colors ${
                  isOpen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-slate-800 text-slate-400 group-hover:text-white'
                }`}>
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-xs sm:text-sm text-slate-400 font-light leading-relaxed pt-2 pb-2">
                      {item.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EsolSunsBenefitsAccordion;
