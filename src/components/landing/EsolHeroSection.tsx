import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Award, CheckCircle2, Star } from 'lucide-react';
import { EsolSimulator3in1 } from '@/components/brand/EsolSimulator3in1';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolHeroSectionProps {
  className?: string;
}

/**
 * `<EsolHeroSection />` — Ato 1: O Despertar (Hero Section Energitech 2026)
 * Inclui textura SVG Noise tátil, holofote radial dinâmico que segue o cursor,
 * e integração do Simulador Solar Fintech 3-em-1 no lado direito.
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({ className = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={`relative pt-8 pb-20 overflow-hidden bg-[#0F172A] text-white ${className}`}>
      {/* Camada 1: SVG Noise Texture (Efeito Lovable Tátil) */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Camada 2: Holofote Dinâmico que Segue o Cursor (Light-Tracing Spotlight) */}
      <div
        className="absolute size-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-300 z-5 opacity-40"
        style={{
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`,
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(245,158,11,0.08) 50%, transparent 70%)',
        }}
      />

      {/* Iluminação de fundo fixa */}
      <div className="absolute top-1/4 left-10 size-96 rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 size-96 rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Lado Esquerdo: Headline & Apresentação de Impacto */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Badge Fotônica */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]"
            >
              <Sparkles className="size-4 text-emerald-400" />
              <span>Plataforma Energitech de Alta Performance</span>
            </motion.div>

            {/* Título Principal com Kinetic Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                A Inteligência Energética que{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
                  Zera a sua Conta
                </span>{' '}
                e Valoriza o seu Patrimônio.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
                Esqueça o aluguel para a concessionária. Transforme a radiação solar da sua casa ou empresa em lucro líquido com garantia contratual de 25 anos.
              </p>
            </motion.div>

            {/* Badges de Autoridade Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2"
            >
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
                <div className="text-2xl font-black text-emerald-400 font-mono">95%</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Economia Real na Conta</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
                <div className="text-2xl font-black text-amber-400 font-mono">25 Anos</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Garantia de Eficiência</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1 col-span-2 sm:col-span-1">
                <div className="text-2xl font-black text-white font-mono">Tier-1</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Módulos Globais</div>
              </div>
            </motion.div>

            {/* Selo CREA / ANEEL & Chamada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2"
            >
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="size-4" />
                <span>Engenheiros Credenciados CREA</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Award className="size-4" />
                <span>Homologação Rápida ANEEL</span>
              </div>
            </motion.div>

          </div>

          {/* Lado Direito: Simulador Solar Fintech 3-em-1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <EsolSimulator3in1 className="shadow-[0_0_50px_-10px_rgba(16,185,129,0.25)] border-emerald-500/30" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
