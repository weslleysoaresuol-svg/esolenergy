import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';
import { EsolEnergyLiveBadge } from '@/components/brand/EsolEnergyLiveBadge';

export interface EsolHeroSectionProps {
  onSimulateClick?: () => void;
  onWhatsAppClick?: () => void;
  className?: string;
}

/**
 * `<EsolHeroSection />` — Hero Section de Alto Impacto Internacional (V13.2)
 * 100% Focada no Cliente Final com Headline Ultra-Conversível.
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({
  onSimulateClick,
  onWhatsAppClick,
  className = '',
}) => {
  return (
    <section className={`relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 border-b border-slate-800 ${className}`}>
      {/* Luzes de Fóton de Fundo (Glow Radial Ambient Matrix) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 size-[400px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 size-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl text-xs text-slate-300">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">ISO 9001 & Selo Verde Esol</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-400">Lei 14.300/2022 Homologada</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <EsolEnergyLiveBadge variant="savings" />
            <EsolEnergyLiveBadge variant="co2" />
          </div>
        </div>

        {/* Grid Principal: Headline + Cockpit Solar 3D */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Textos & CTAs de Conversão */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="size-3.5" /> Tecnologia & Engenharia Solar Fotovoltaica
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Reduza sua conta de luz em até{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                95% sem complicações
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-medium">
              Escolha a melhor solução para o seu perfil: usina própria com o exclusivo <strong>Selo Verde ESOL</strong> ou <strong>Energia por Assinatura sem obras e sem investimento inicial</strong>.
            </p>

            {/* CTAs Primários */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={onSimulateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
              >
                <span>Simular Minha Economia Agora</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onWhatsAppClick}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="size-4 text-emerald-400" />
                <span>Atendimento no WhatsApp</span>
              </button>
            </div>

            {/* Micro-Benefícios com Ícones */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
              <div>
                <span className="block text-lg font-bold text-amber-400 font-mono">25 Anos</span>
                <span className="text-[11px] text-slate-400 font-medium">Garantia em Módulos Tier-1</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-emerald-400 font-mono">Zero</span>
                <span className="text-[11px] text-slate-400 font-medium">Investimento Inicial na GD</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-cyan-400 font-mono">100%</span>
                <span className="text-[11px] text-slate-400 font-medium">Conectado a Concessionárias</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Cockpit Solar Visual & Selo Verde */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <Zap className="size-5 text-amber-400 fill-amber-400" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Cockpit Solar ao Vivo</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Unidade Fotovoltaica Homologada</span>
                  </div>
                </div>
                <SeloVerdeEsol size="sm" />
              </div>

              {/* Simulação de Geração Diária */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Eficiência de Geração Solar</span>
                  <span className="text-emerald-400 font-bold font-mono">98.4%</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full w-[98.4%] transition-all duration-1000" />
                </div>
              </div>

              {/* Card de Economia Garantida */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Economia Média Anual</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-0.5">R$ 14.850,00</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <TrendingUp className="size-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
