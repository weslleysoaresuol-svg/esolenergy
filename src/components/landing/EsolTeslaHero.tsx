import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Sparkles, ChevronDown } from 'lucide-react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolTeslaHeroProps {
  onSimulateClick?: () => void;
  className?: string;
}

/**
 * `<EsolTeslaHero />` — Hero Section Padrão Tesla Solar / Enphase
 * Design cinematográfico full-bleed com fotografia arquitetônica de alta resolução,
 * tipografia minimalista de grande escala e zero poluição visual.
 */
export const EsolTeslaHero: React.FC<EsolTeslaHeroProps> = ({
  onSimulateClick,
  className = '',
}) => {
  const scrollToConfigurator = () => {
    const el = document.getElementById('configurador');
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
    <section className={`relative min-h-[90vh] flex flex-col justify-between bg-[#0F172A] text-white overflow-hidden ${className}`}>
      
      {/* Imagem Arquitetônica Full-Bleed de Fundo com Fade Concentrado no Lado Esquerdo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero-solar-premium-DbbfHtsS.png"
          alt="Usina Solar Residencial de Alto Padrão"
          className="w-full h-full object-cover object-right opacity-90 brightness-105 contrast-105 transform transition-transform duration-10000 hover:scale-105"
        />
        {/* Degradê Concentrado no Lado Esquerdo para legibilidade do texto */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0F172A] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0F172A]/80 to-transparent" />
      </div>

      {/* Camada de Granulação Noise Tátil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-5" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Conteúdo Principal Centrado */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10 w-full my-auto space-y-10">
        
        {/* Badge Minimalista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-xl"
        >
          <Sparkles className="size-4 text-emerald-400" />
          <span>Engenharia Fotovoltaica de Alta Performance</span>
        </motion.div>

        {/* Título Estilo Tesla (Grande & Respirável) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
            Energia Infinita para a Sua Casa e Empresa.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            Elimine até 95% da sua conta de luz com usinas solares inteligentes, garantia de 25 anos e telemetria por inteligência artificial.
          </p>
        </motion.div>

        {/* Botões Minimalistas Tesla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
        >
          <button
            onClick={scrollToConfigurator}
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Simular Usina Solar em 3 Passos</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            onClick={scrollToFlow}
            className="px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/40"
          >
            <Zap className="size-4 text-emerald-400" />
            <span>Ver Fluxo Energético 3D</span>
          </button>
        </motion.div>

        {/* Barra de Métricas Limpa (Tesla Spec Strip) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl"
        >
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Economia Real</div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">Até 95%</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Garantia Painéis</div>
            <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">25 Anos</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Payback Médio</div>
            <div className="text-2xl md:text-3xl font-black text-white font-mono">~3 Anos</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Homologação</div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">100% ANEEL</div>
          </div>
        </motion.div>

      </div>

      {/* Indicador de Scroll Minimalista */}
      <div className="relative z-10 pb-6 text-center">
        <button
          onClick={scrollToFlow}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span>Conheça a Tecnologia Esol</span>
          <ChevronDown className="size-4 animate-bounce text-emerald-400" />
        </button>
      </div>

    </section>
  );
};

export default EsolTeslaHero;
