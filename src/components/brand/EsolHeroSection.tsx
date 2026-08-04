import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Sparkles, TrendingUp, Sun, CheckCircle, Activity, Award, BarChart3 } from 'lucide-react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';
import { EsolEnergyLiveBadge } from '@/components/brand/EsolEnergyLiveBadge';

export interface EsolHeroSectionProps {
  onSimulateClick?: () => void;
  onWhatsAppClick?: () => void;
  className?: string;
}

/**
 * `<EsolHeroSection />` — Hero Section de Luxo Internacional (V14.0 Maestro)
 * Framer Motion, Efeito 3D Hover Tilt no Cockpit Solar, Animações Estelar-Fotônicas e Cockpit Interativo.
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'eficiencia' | 'telemetria' | 'retorno'>('eficiencia');

  // Framer Motion 3D Mouse Tilt Card Effect
  const cardRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className={`relative overflow-hidden bg-slate-950 text-white pt-12 pb-24 border-b border-slate-800/80 ${className}`}>
      {/* Fotografia Arquitetônica 8K com Vinheta Obsidian Deep */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/esol-hero-house.png"
          alt="ESOL Energy Architectural Solar Home"
          className="w-full h-full object-cover object-center opacity-25 scale-105 transition-transform duration-1000"
        />
        {/* Overlay de Gradientes Fotônicos */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/90" />
      </div>

      {/* Spotlights de Luz Solar Neon */}
      <div className="absolute -top-24 left-1/4 size-[650px] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none z-0 animate-sun-pulse" />
      <div className="absolute top-1/3 -right-20 size-[500px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none z-0 animate-pulse" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-10">
        {/* Top Badges Corporativas com Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/90 backdrop-blur-2xl text-xs text-slate-200 shadow-2xl hover:border-amber-500/50 transition-colors">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-emerald-400 font-mono uppercase tracking-wider">ISO 9001 & SELO VERDE ESOL</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-300 font-medium">Lei 14.300/2022 Homologada ANEEL</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <EsolEnergyLiveBadge variant="savings" />
            <EsolEnergyLiveBadge variant="co2" />
          </div>
        </motion.div>

        {/* Grid Principal: Conteúdo Executivo + Cockpit Solar 3D */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Headline Principal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-inner">
              <Sparkles className="size-3.5 fill-amber-400" /> ENGENHARIA & INTELIGÊNCIA SOLAR FOTOVOLTAICA
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              Reduza sua conta de luz em até{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                95% com Energia Limpa
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              Escolha a melhor solução para sua residência ou empresa: usina solar própria com o exclusivo <strong>Selo Verde ESOL</strong> ou <strong>Energia por Assinatura sem obras e zero investimento inicial</strong>.
            </p>

            {/* CTAs Primários com Brilho Fotônico */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSimulateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_35px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>Simular Minha Economia Agora</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onWhatsAppClick}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/90 text-slate-200 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]"
              >
                <MessageCircle className="size-4 text-emerald-400" />
                <span>Atendimento no WhatsApp</span>
              </motion.button>
            </div>

            {/* Benefícios Rápidos */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <span className="block text-xl font-black text-amber-400 font-mono">25 Anos</span>
                <span className="text-xs text-slate-400 font-medium">Garantia Módulos Tier-1</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <span className="block text-xl font-black text-emerald-400 font-mono">Zero</span>
                <span className="text-xs text-slate-400 font-medium">Investimento na Assinatura</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <span className="block text-xl font-black text-cyan-400 font-mono">100%</span>
                <span className="text-xs text-slate-400 font-medium">Homologado ANEEL</span>
              </div>
            </div>
          </motion.div>

          {/* Lado Direito: Cockpit Solar 3D Interativo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 relative flex flex-col items-center justify-center perspective-1000"
          >
            <motion.div
              ref={cardRef}
              style={{ rotateX, rotateY }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative p-6 rounded-3xl bg-slate-900/90 border border-slate-700/90 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-md space-y-6 transform-gpu hover:border-amber-500/40 transition-colors"
            >
              {/* Header do Cockpit com Selo Esol */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-md">
                    <Zap className="size-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100 font-display">Cockpit Solar ao Vivo</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Unidade Fotovoltaica Homologada</span>
                  </div>
                </div>
                <SeloVerdeEsol size="sm" />
              </div>

              {/* Seletor de Abas Interativas no Cockpit */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('eficiencia')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'eficiencia'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Eficiência
                </button>
                <button
                  onClick={() => setActiveTab('telemetria')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'telemetria'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Telemetria
                </button>
                <button
                  onClick={() => setActiveTab('retorno')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'retorno'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Payback
                </button>
              </div>

              {/* Conteúdo da Aba Selecionada */}
              {activeTab === 'eficiencia' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Desempenho Fotovoltaico (PR)</span>
                      <span className="text-emerald-400 font-bold font-mono">98.4% PR</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full w-[98.4%] animate-pulse" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between shadow-inner">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">ECONOMIA MÉDIA ANUAL</span>
                      <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">R$ 14.850,00</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <TrendingUp className="size-6" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'telemetria' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Geração Instanânea:</span>
                    <span className="font-mono font-bold text-amber-400">14.2 kW/h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Inversor String Híbrido:</span>
                    <span className="font-mono font-bold text-emerald-400">Status 100% OK</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Conexão Concessionária:</span>
                    <span className="font-mono font-bold text-cyan-400">Sincronizada</span>
                  </div>
                </div>
              )}

              {activeTab === 'retorno' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Retorno Total Estimado em 25 Anos:</span>
                    <span className="text-3xl font-black text-emerald-400 font-mono block">R$ 371.250,00</span>
                    <span className="text-[11px] text-slate-400 font-mono block">Payback estimado em 3.1 anos</span>
                  </div>
                </div>
              )}

              {/* Footer do Cockpit */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="size-4" /> Telemetria IoT 24/7 Ativa
                </span>
                <span className="font-mono text-[10px] text-slate-500">v14.0 Live</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
