import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, ChevronDown, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface EsolTeslaHeroProps {
  onSimulateClick?: () => void;
  className?: string;
}

const TYPEWRITER_PHRASES = [
  'Sua Residência.',
  'Sua Empresa.',
  'Sua Autonomia 24/7.',
  'Economizar até 95%.'
];

/**
 * `<EsolTeslaHero />` — Hero Section Padrão Enphase / Tesla Solar
 * Tipografia autêntica com efeito de digitação dinâmico (Typewriter),
 * fotografia arquitetônica de alta resolução e zero badges artificiais de IA.
 */
export const EsolTeslaHero: React.FC<EsolTeslaHeroProps> = ({
  onSimulateClick,
  className = '',
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[currentPhraseIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && displayedText === currentPhrase) {
      // Pausa quando completa a digitação
      const timeout = setTimeout(() => setIsDeleting(true), 2400);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === '') {
      // Passa para a próxima frase
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentPhrase.substring(0, prev.length - 1)
          : currentPhrase.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  const scrollToConfigurator = () => {
    const el = document.getElementById('simulador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onSimulateClick) {
      onSimulateClick();
    }
  };

  const scrollToFlow = () => {
    const el = document.getElementById('fluxo-energetico');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={`relative min-h-[92vh] flex flex-col justify-between bg-[#080E21] text-white overflow-hidden ${className}`}>
      
      {/* Imagem Arquitetônica Real de Fundo sob Luz Natural */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero-solar-premium-DbbfHtsS.png"
          alt="Usina Solar Residencial de Alto Padrão sob Luz Natural"
          className="w-full h-full object-cover object-right opacity-85 brightness-105 contrast-105 transform transition-transform duration-10000 hover:scale-105"
        />
        {/* Degradê Concentrado para legibilidade perfeita do texto */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#080E21] via-[#080E21]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#080E21] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080E21]/80 to-transparent" />
      </div>

      {/* Camada de Granulação Sutil */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-5" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Conteúdo Principal do Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10 w-full my-auto space-y-8">
        
        {/* Kicker Limpo e Profissional */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Engenharia Solar & Baterias BESS • Padrão Internacional</span>
        </motion.div>

        {/* Título Principal com Efeito de Digitação (Typewriter) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white min-h-[120px] sm:min-h-[160px] md:min-h-[180px]">
            Energia Solar Inteligente para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300">
              {displayedText}
            </span>
            <span className="inline-block w-1.5 md:w-2 h-9 sm:h-12 md:h-16 bg-emerald-400 ml-1 translate-y-2 animate-pulse" />
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            Elimine até 95% da sua fatura de luz com usinas fotovoltaicas de alta eficiência, armazenamento residencial BESS e garantia linear de 25 anos.
          </p>
        </motion.div>

        {/* Botões de Conversão Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
        >
          <button
            onClick={scrollToConfigurator}
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02]"
          >
            <span>Simular Meu Projeto Solar</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            onClick={scrollToFlow}
            className="px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm backdrop-blur-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/40"
          >
            <Zap className="size-4 text-emerald-400" />
            <span>Ver Ecossistema 3D</span>
          </button>
        </motion.div>

        {/* Barra de Métricas Limpa (Estilo Enphase / Tesla Spec Strip) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl"
        >
          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Economia Máxima</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">Até 95%</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Garantia Linear</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">25 Anos</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Retorno Médio</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">~3 Anos</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Regulamentação</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100% ANEEL</div>
          </div>
        </motion.div>

      </div>

      {/* Indicador de Scroll Suave */}
      <div className="relative z-10 pb-6 text-center">
        <button
          onClick={scrollToFlow}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span>Conheça a Tecnologia ESOL</span>
          <ChevronDown className="size-4 animate-bounce text-emerald-400" />
        </button>
      </div>

    </section>
  );
};

export default EsolTeslaHero;
