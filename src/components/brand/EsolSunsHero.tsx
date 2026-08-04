import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Sparkles, Sun, CheckCircle } from 'lucide-react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolSunsHeroProps {
  onSimulateClick?: () => void;
  onWhatsAppClick?: () => void;
  className?: string;
}

/**
 * `<EsolSunsHero />` — Hero Section Inspirada na SUNS Energy (V15.0 Maestro)
 * Fotografia cinemática 8K, tipografia industrial all-caps, animação de pilares e visual ultra-sofisticado.
 */
export const EsolSunsHero: React.FC<EsolSunsHeroProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  const pillars = [
    { label: 'Zero Emissão', text: 'Energia 100% Limpa & Renovável' },
    { label: 'Homologado ANEEL', text: 'Lei 14.300/2022 Garantida' },
    { label: 'Clean Power', text: 'Sem Obras ou Usina Própria' },
    { label: 'Garantia 25 Anos', text: 'Módulos Tier-1 Certificados' },
  ];

  return (
    <header className={`relative min-h-[90vh] bg-slate-950 text-white flex flex-col justify-between overflow-hidden border-b border-slate-800 ${className}`}>
      {/* Background Cinemático Fotográfico com Overlay Obsidian */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/esol-hero-house.png"
          alt="ESOL Energy Architectural Solar System"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Spotlights Ambientais Fotônicos */}
      <div className="absolute top-1/4 left-1/3 size-[600px] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-1/2 right-10 size-[450px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none z-0" />

      {/* Top Banner de Pilares Estilo SUNS Energy */}
      <div className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              ISO 9001 & SELO VERDE ESOL
            </span>
          </div>

          {/* Pilares Animados */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-wider text-slate-400">
            {pillars.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span className="text-slate-200 font-bold uppercase">{p.label}:</span>
                <span className="text-slate-400">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest font-mono">
            <Sparkles className="size-3.5 fill-amber-400" /> ENGENHARIA & INTELIGÊNCIA SOLAR FOTOVOLTAICA
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
            Aqui começa a <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              revolução fotovoltaica.
            </span>
          </h1>

          <p className="font-body text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            Energia limpa instantaneamente gerada para sua residência ou empresa: usina solar própria com o exclusivo <strong>Selo Verde ESOL</strong> ou <strong>Energia por Assinatura sem obras e sem investimento</strong>.
          </p>

          {/* Botões Estilo SUNS Energy (Order Now / Simular) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSimulateClick}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_35px_-5px_rgba(245,158,11,0.6)] flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Simular Economia Agora</span>
              <ArrowRight className="size-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onWhatsAppClick}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50"
            >
              <MessageCircle className="size-4 text-emerald-400" />
              <span>Falar com Especialista</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Rodapé Interno do Hero com Métricas SUNS Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold block">REDUÇÃO DE CUSTO</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-0.5 block">Até 95%</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold block">GARANTIA DE GERAÇÃO</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5 block">25 Anos</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold block">ASSINATURA GD</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-0.5 block">Zero Obras</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold block">REGULAMENTAÇÃO</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono mt-0.5 block">ANEEL 14.300</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EsolSunsHero;
