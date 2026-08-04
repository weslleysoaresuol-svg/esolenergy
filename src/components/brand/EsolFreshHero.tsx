import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolFreshHeroProps {
  onSimulateClick?: () => void;
  onWhatsAppClick?: () => void;
  className?: string;
}

/**
 * `<EsolFreshHero />` — Hero Section Aspiracional Clean (V16.0 Maestro)
 * Estética Apple/Tesla/Stripe com iluminação solar real, tipografia imponente e foco na dor/desejo do cliente.
 */
export const EsolFreshHero: React.FC<EsolFreshHeroProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  return (
    <section className={`relative bg-slate-950 text-white pt-12 pb-24 border-b border-slate-800 overflow-hidden ${className}`}>
      {/* Imagem Arquitetônica de Luxo de Fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/esol-hero-house.png"
          alt="ESOL Energy Architectural Solar Home"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Glow Solar suave */}
      <div className="absolute top-0 right-1/4 size-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Top Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-emerald-400 uppercase tracking-wider">ISO 9001 & SELO VERDE ESOL</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-300 font-medium">Lei 14.300/2022 Homologada ANEEL</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400"><ShieldCheck className="size-4" /> 25 Anos de Garantia</span>
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="size-4" /> Engenheiros Próprios CREA</span>
          </div>
        </motion.div>

        {/* Grid Principal: Headline + Visual do Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Headline & Mensagem do Cliente */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="size-3.5 fill-amber-400" /> LIBERDADE & AUTONOMIA ENERGÉTICA
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              Sua própria usina de energia limpa.{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Economize até 95% na conta de luz.
              </span>
            </h1>

            <p className="font-body text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              Escolha a melhor solução para sua residência ou empresa: <strong>usina solar própria no seu telhado</strong> ou <strong>energia por assinatura sem obras e sem investir nada</strong>. Nós cuidamos de 100% da engenharia e homologação.
            </p>

            {/* CTAs Primários */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSimulateClick}
                className="w-full sm:w-auto px-9 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_35px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Simular Minha Economia Agora</span>
                <ArrowRight className="size-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onWhatsAppClick}
                className="w-full sm:w-auto px-7 py-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50"
              >
                <MessageCircle className="size-4 text-emerald-400" />
                <span>Atendimento no WhatsApp</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Lado Direito: Card de Impacto Visual com Selo Verde */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">GARANTIA & QUALIDADE</span>
                  <h3 className="text-lg font-black text-white font-display">Engenharia Solar ESOL</h3>
                </div>
                <SeloVerdeEsol size="sm" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Redução Média de Gastos:</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">Até 95%/mês</span>
                  </div>
                  <Zap className="size-8 text-amber-400" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Garantia Linear de Placas:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">25 Anos</span>
                  </div>
                  <ShieldCheck className="size-8 text-emerald-400" />
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-400 font-medium">
                  +1.500 usinas homologadas em todo o Brasil com o <strong>Selo Verde ESOL</strong>.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EsolFreshHero;
