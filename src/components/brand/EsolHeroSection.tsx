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
 * Estética de luxo, alta conversão e cockpit fotovoltaico translúcido.
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  return (
    <section className={`relative overflow-hidden bg-slate-950 text-white pt-14 pb-24 border-b border-slate-800/80 ${className}`}>
      {/* Luzes de Fóton de Fundo (Glow Radial Ambient Matrix) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 size-[450px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 size-[450px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Top Badges de Confiança */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl text-xs text-slate-300 shadow-lg">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-400">ISO 9001 & Selo Verde ESOL</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-400 font-medium">Lei 14.300/2022 Homologada ANEEL</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <EsolEnergyLiveBadge variant="savings" />
            <EsolEnergyLiveBadge variant="co2" />
          </div>
        </div>

        {/* Grid Principal: Headline + Cockpit Solar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Textos & CTAs de Conversão */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="size-3.5" /> Engenharia & Inteligência Solar Fotovoltaica
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Reduza sua conta de luz em até{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                95% com Energia Limpa
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              Escolha a melhor solução para sua casa ou empresa: usina solar própria com o exclusivo <strong>Selo Verde ESOL</strong> ou <strong>Energia por Assinatura sem obras e zero investimento inicial</strong>.
            </p>

            {/* CTAs Primários */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-3">
              <button
                onClick={onSimulateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
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
                <span className="block text-lg font-black text-amber-400 font-mono">25 Anos</span>
                <span className="text-[11px] text-slate-400 font-medium">Garantia Módulos Tier-1</span>
              </div>
              <div>
                <span className="block text-lg font-black text-emerald-400 font-mono">Zero</span>
                <span className="text-[11px] text-slate-400 font-medium">Investimento na Assinatura</span>
              </div>
              <div>
                <span className="block text-lg font-black text-cyan-400 font-mono">100%</span>
                <span className="text-[11px] text-slate-400 font-medium">Homologado ANEEL</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Cockpit Solar Visual Translúcido */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl shadow-2xl w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                    <Zap className="size-4 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-100">Cockpit Solar ao Vivo</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Unidade Fotovoltaica Homologada</span>
                  </div>
                </div>
                <SeloVerdeEsol size="sm" />
              </div>

              {/* Curva de Eficiência */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Eficiência de Geração Solar</span>
                  <span className="text-emerald-400 font-bold font-mono">98.4% PR</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full w-[98.4%] animate-pulse" />
                </div>
              </div>

              {/* Métrica de Economia Anual Acumulada */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ECONOMIA MÉDIA ANUAL</span>
                  <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">R$ 14.850,00</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <TrendingUp className="size-5" />
                </div>
              </div>

              {/* Rodapé do Cockpit */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="size-3.5" /> Monitoramento IoT 24/7
                </span>
                <span className="font-mono text-[10px] text-slate-500">Telemetry v2.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
