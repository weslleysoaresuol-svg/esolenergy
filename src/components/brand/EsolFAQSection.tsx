import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

export interface EsolFAQSectionProps {
  className?: string;
}

/**
 * `<EsolFAQSection />` — Dúvidas Frequentes (V16.0 Maestro)
 * Respostas diretas e esclarecedoras para quebrar todas as objeções do cliente.
 */
export const EsolFAQSection: React.FC<EsolFAQSectionProps> = ({ className = '' }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: 'O que acontece em dias chuvosos ou durante a noite?',
      answer: 'Durante a noite ou em dias muito nublados, seu imóvel consome a energia acumulada da rede da concessionária. Durante o dia, sua usina gera créditos excedentes que abatem 100% esse consumo noturno no seu boleto.',
    },
    {
      question: 'Preciso fazer obras pesadas ou reformar o telhado?',
      answer: 'Não! Para Usina Própria (Turnkey), nossos instaladores montam os módulos sobre a estrutura existente em poucas horas sem danificar telhas. Para Energia por Assinatura (GD), zero obras são realizadas no seu imóvel.',
    },
    {
      question: 'Como funciona a Energia por Assinatura (GD)?',
      answer: 'Nossa fazenda solar gera energia limpa e injeta na rede da concessionária. Você assina o plano e recebe um desconto direto de ~18% na sua conta de luz mensal, sem investir nada e sem alterar sua instalação elétrica.',
    },
    {
      question: 'Qual a garantia dos equipamentos instalados?',
      answer: 'Trabalhamos exclusivamente com hardware Tier-1. Os módulos fotovoltaicos possuem garantia de geração de 25 anos e os inversores possuem garantia de fábrica de 10 a 15 anos.',
    },
    {
      question: 'Posso financiar 100% do projeto da minha usina solar?',
      answer: 'Sim! Possuímos parcerias com os principais bancos do Brasil (BV, Santander, Solfácil, Bradesco) que permitem financiar a usina em até 84 parcelas, onde o próprio valor economizado na conta de luz paga a parcela do financiamento.',
    },
    {
      question: 'O que é o Selo Verde ESOL?',
      answer: 'É a certificação oficial concedida aos imóveis que utilizam a engenharia ESOL Energy, garantindo conformidade total com a Lei 14.300/2022 da ANEEL e valorizando o imóvel no mercado imobiliário.',
    },
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Esclarecimentos & Segurança Jurídica</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Perguntas Frequentes
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-300 font-normal">
          Respostas claras e técnicas sobre homologação, garantia e economia real.
        </p>
      </div>

      {/* Accordion FAQ */}
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <div className={`p-2 rounded-xl border transition-colors ${isOpen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-slate-800 text-slate-400'}`}>
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
                  >
                    <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-300 font-light leading-relaxed border-t border-slate-800/60 mt-2 pt-4">
                      {faq.answer}
                    </div>
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

export default EsolFAQSection;
