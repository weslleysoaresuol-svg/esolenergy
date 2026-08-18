import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, ChevronDown, Play, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
 * `<EsolTeslaHero />` — Hero Section Padrão Enphase Energy & Sunrun
 * Tipografia autêntica com efeito Typewriter dinâmico, fotografia arquitetônica real,
 * modal de vídeo 4K de instalações reais e zero badges artificiais.
 */
export const EsolTeslaHero: React.FC<EsolTeslaHeroProps> = ({
  onSimulateClick,
  className = '',
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[currentPhraseIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && displayedText === currentPhrase) {
      const timeout = setTimeout(() => setIsDeleting(true), 2400);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === '') {
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
          src="/images/esol_real_drone_rooftop_installation.jpg"
          alt="Usina Solar Residencial Real em Telhado sob Luz Natural"
          className="w-full h-full object-cover object-center opacity-80 brightness-100 contrast-105 transform transition-transform duration-10000 hover:scale-105"
        />
        {/* Degradê Concentrado para legibilidade perfeita do texto */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#080E21] via-[#080E21]/95 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080E21] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080E21]/90 to-transparent" />
      </div>

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
          <span>Engenharia Solar & Baterias BESS • Padrão Enphase</span>
        </motion.div>

        {/* Título Principal com Efeito Typewriter */}
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
            Elimine até 95% da sua fatura de luz com usinas fotovoltaicas de alta eficiência, baterias de lítio e garantia de 25 anos.
          </p>
        </motion.div>

        {/* Botões de Ação Rápidos com Botão de Vídeo 4K */}
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
            onClick={() => setIsVideoModalOpen(true)}
            className="px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm backdrop-blur-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-emerald-500/50"
          >
            <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Play className="size-3.5 fill-emerald-400 translate-x-0.5" />
            </div>
            <span>Assistir Vídeo Real 4K</span>
          </button>
        </motion.div>

        {/* Barra de Métricas Limpa (Estilo Enphase / Sunrun Spec Strip) */}
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

      {/* Modal de Vídeo Real 4K */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4"
            >
              <div className="flex items-center justify-between px-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Instalação Solar Real • Tour em 4K</span>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-solar-panels-on-a-roof-42456-large.mp4"
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default EsolTeslaHero;
