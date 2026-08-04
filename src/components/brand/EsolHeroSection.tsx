import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Sparkles, TrendingUp, Sun, CheckCircle } from 'lucide-react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';
import { EsolEnergyLiveBadge } from '@/components/brand/EsolEnergyLiveBadge';

export interface EsolHeroSectionProps {
  onSimulateClick?: () => void;
  onWhatsAppClick?: () => void;
  className?: string;
}

/**
 * `<EsolHeroSection />` — Hero Section de Classe Mundial (V13.2)
 * Fotografia Arquitetônica 8K com Vinheta Obsidian e Cockpit Solar Translúcido.
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  return (
    <section className={`relative overflow-hidden bg-slate-950 text-white pt-16 pb-28 border-b border-slate-800/80 ${className}`}>
      {/* Imagem de Fundo Arquitetônica de Luxo com Vinheta Obsidian */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/esol-hero-house.png"
          alt="ESOL Energy Architectural Solar Home"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        {/* Overlay de Gradientes Obsidian */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
      </div>

      {/* Glows Ambientais Fotônicos */}
      <div className="absolute top-10 left-1/3 size-[600px] rounded-full bg-amber-500/15 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/4 right-0 size-[450px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Top Badges de Confiança Corporativa */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl text-xs text-slate-200 shadow-2xl">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-emerald-400">ISO 9001 & SELO VERDE ESOL</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-300 font-medium">Lei 14.300/2022 Homologada ANEEL</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <EsolEnergyLiveBadge variant="savings" />
            <EsolEnergyLiveBadge variant="co2" />
          </div>
        </div>

        {/* Grid Principal: Headline + Cockpit Solar 3D */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Headline & CTAs de Conversão */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="size-3.5" /> ENGENHARIA & INTELIGÊNCIA SOLAR FOTOVOLTAICA
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              Reduza sua conta de luz em até{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                95% com Energia Limpa
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              Escolha a melhor solução para sua residência ou empresa: usina solar própria com o exclusivo <strong>Selo Verde ESOL</strong> ou <strong>Energia por Assinatura sem obras e zero investimento inicial</strong>.
            </p>

            {/* CTAs Primários com Sombra Ouro */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={onSimulateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-[0_0_35px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 flex items-center justify-center gap-2.5 group cursor-pointer hover:scale-[1.02]"
              >
                <span>Simular Minha Economia Agora</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onWhatsAppClick}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50"
              >
                <MessageCircle className="size-4 text-emerald-400" />
                <span>Atendimento no WhatsApp</span>
              </button>
            </div>

            {/* Micro-Benefícios de Confiança */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
              <div>
                <span className="block text-xl font-black text-amber-400 font-mono">25 Anos</span>
                <span className="text-xs text-slate-400 font-medium">Garantia Módulos Tier-1</span>
              </div>
              <div>
                <span className="block text-xl font-black text-emerald-400 font-mono">Zero</span>
                <span className="text-xs text-slate-400 font-medium">Investimento na Assinatura</span>
              </div>
              <div>
                <span className="block text-xl font-black text-cyan-400 font-mono">100%</span>
                <span className="text-xs text-slate-400 font-medium">Homologado ANEEL</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Cockpit Solar Visual Translúcido */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-2xl shadow-2xl w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Zap className="size-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100">Cockpit Solar ao Vivo</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Unidade Fotovoltaica Homologada</span>
                  </div>
                </div>
                <SeloVerdeEsol size="sm" />
              </div>

              {/* Curva de Eficiência */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Eficiência de Geração Solar</span>
                  <span className="text-emerald-400 font-bold font-mono">98.4% PR</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full w-[98.4%] animate-pulse" />
                </div>
              </div>

              {/* Métrica de Economia Anual Acumulada */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">ECONOMIA MÉDIA ANUAL</span>
                  <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">R$ 14.850,00</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <TrendingUp className="size-6" />
                </div>
              </div>

              {/* Rodapé do Cockpit */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="size-4" /> Telemetria IoT 24/7 Ativa
                </span>
                <span className="font-mono text-[10px] text-slate-500">v2.4 Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
