import React from 'react';
import { Bell, Settings, ShieldCheck, Sun, Zap, TrendingUp, CheckCircle2, Award } from 'lucide-react';

export interface EsolHeroSectionProps {
  onSimulateClick?: () => void;
  onSpecialistClick?: () => void;
  className?: string;
}

/**
 * `<EsolHeroSection />` — Hero Section Idêntica ao Mockup Oficial (V13.2)
 */
export const EsolHeroSection: React.FC<EsolHeroSectionProps> = ({
  onSimulateClick,
  onSpecialistClick,
  className = '',
}) => {
  return (
    <section className={`relative overflow-hidden bg-slate-950 text-white pt-10 pb-16 ${className}`}>
      {/* Matriz Ambient Matrix Glows (Luzes de Fóton de Fundo) */}
      <div className="absolute top-10 left-1/3 -translate-x-1/2 size-[500px] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-20 right-10 size-[450px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Lado Esquerdo: Headline & CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Deixe o <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Sol</span> Gerar Sua Independência Financeira
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
            ESOL Energy, é a premier Brazilian solar energytech enterprise. Soluções de alta tecnologia, energia limpa e inteligência financeira para sua residência ou empresa.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onSimulateClick}
              className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.02]"
            >
              Simular Agora
            </button>

            <button
              onClick={onSpecialistClick}
              className="px-8 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all duration-300 cursor-pointer"
            >
              Falar com Especialista
            </button>
          </div>
        </div>

        {/* Lado Direito: Solar Power Generation Cockpit (Card Idêntico ao Mockup) */}
        <div className="lg:col-span-6 relative">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-6">
            {/* Header do Cockpit */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="text-sm font-extrabold text-slate-100 tracking-wide">
                Solar power generation cockpit
              </h3>
              <div className="flex items-center gap-2 text-slate-400">
                <button className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                  <Bell className="size-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                  <Settings className="size-4" />
                </button>
              </div>
            </div>

            {/* Performance Graphs Area */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Gráfico de Linha Otimizado */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-300">Performance graphs</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400">Real-time</span>
                  </div>
                </div>

                {/* Visualizador de Onda do Gráfico */}
                <div className="h-32 w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                  
                  {/* Tooltip de Pico */}
                  <div className="absolute top-4 right-8 px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[9px] shadow-lg">
                    ★ 13,335 kWh
                  </div>

                  {/* Curva SVG Vetorial do Gráfico */}
                  <svg className="w-full h-full text-cyan-400" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 Q30,60 60,70 T120,40 T180,20 T240,50 T300,30 L300,100 L0,100 Z"
                      fill="url(#cyanGlow)"
                      opacity="0.2"
                    />
                    <path
                      d="M0,80 Q30,60 60,70 T120,40 T180,20 T240,50 T300,30"
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="3"
                    />
                    <defs>
                      <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                    <span>Jan</span>
                    <span>Fev</span>
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>Mai</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas 3D Sol */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                  <span>Statistics</span>
                  <span className="text-amber-400">•••</span>
                </div>
                <div className="relative py-2 flex justify-center">
                  <div className="size-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse border border-amber-500/40">
                    <Sun className="size-10 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">Status da Radiação Solar</span>
              </div>
            </div>

            {/* Micro-Métricas de Rodapé do Cockpit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Energy produção</span>
                <span className="text-xs font-black text-amber-400 font-mono block mt-0.5">10,000 kWh/mês</span>
                <span className="text-[8px] text-emerald-400 block mt-1">Savings 25 anos</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Real time energia</span>
                <span className="text-xs font-black text-cyan-400 font-mono block mt-0.5">7,136 kWh</span>
                <div className="flex items-end gap-0.5 h-3 mt-1">
                  <div className="w-1 bg-cyan-400 h-full rounded-full" />
                  <div className="w-1 bg-cyan-400 h-3/4 rounded-full" />
                  <div className="w-1 bg-cyan-400 h-1/2 rounded-full" />
                  <div className="w-1 bg-cyan-400 h-5/6 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Painéis Garantia</span>
                <span className="text-xs font-black text-emerald-400 font-mono block mt-0.5">25 anos</span>
                <span className="text-[8px] text-slate-400 block mt-1">Garantia Tier-1</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Eficiência PR</span>
                <span className="text-xs font-black text-amber-400 font-mono block mt-0.5">83.5%</span>
                <span className="text-[8px] text-emerald-400 block mt-1">Alta Performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsolHeroSection;
