import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Zap, Activity, TrendingUp, ShieldCheck, CheckCircle, Sparkles, PieChart } from 'lucide-react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolAppPreviewSectionProps {
  className?: string;
}

export const EsolAppPreviewSection: React.FC<EsolAppPreviewSectionProps> = ({ className = '' }) => {
  return (
    <section className={`py-24 bg-[#0B132B] text-white relative overflow-hidden ${className}`} id="app-preview">
      {/* Halo Néon de Fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Esquerda: Texto de Apresentação do App */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Smartphone className="size-4 text-emerald-400" />
              <span>Tecnologia de Monitoramento Esol Mobile</span>
            </span>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Sua Usina Solar na Palma da Mão em Tempo Real.
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Com o aplicativo oficial <strong className="text-white">esol energy.</strong>, você acompanha a produção diária de kW, o total economizado em R$, o consumo instantâneo e a emissão de créditos ANEEL minuto a minuto.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Telemetria IoT em Tempo Real</h4>
                  <p className="text-xs text-slate-400">Conexão direta aos inversores Wi-Fi/4G com dados atualizados a cada 60 segundos.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Relatórios Financeiros Automáticos</h4>
                  <p className="text-xs text-slate-400">Extratos mensais demonstrando exatamente a economia gerada e o retorno de ROI.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Manutenção Preditiva com IA</h4>
                  <p className="text-xs text-slate-400">Alertas inteligentes acionam a equipe de engenharia antes mesmo que ocorra qualquer queda de eficiência.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direita: Maquete 3D do Smartphone com Specular Glass Overlay */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              whileHover={{ rotateY: -10, rotateX: 5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-full max-w-sm rounded-[48px] bg-slate-950 p-4 border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              {/* Specular Glass Overlay (Reflexo Especular Diagonal) */}
              <div 
                className="absolute inset-0 pointer-events-none z-30 opacity-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)'
                }}
              />

              {/* Notch / Câmera do Smartphone */}
              <div className="w-32 h-5 bg-slate-900 mx-auto rounded-b-2xl mb-4 flex items-center justify-center">
                <div className="size-2 rounded-full bg-slate-800" />
              </div>

              {/* Tela do Aplicativo Esol Mobile */}
              <div className="bg-[#0F172A] rounded-[36px] p-5 space-y-5 text-white border border-slate-800">
                {/* Header do App */}
                <div className="flex items-center justify-between">
                  <EsolOfficialBrandSymbol width={140} />
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                  </span>
                </div>

                {/* Card de Geração Atual */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Geração de Hoje</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">42.8 kWh</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Zap className="size-3 text-amber-400" />
                    <span>Economia estimada hoje: <strong className="text-white">R$ 41,20</strong></span>
                  </div>
                </div>

                {/* Métricas Rápidas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Economia do Mês</div>
                    <div className="text-lg font-black text-amber-400 font-mono">R$ 1.280,00</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Eficiência Usina</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">98.4%</div>
                  </div>
                </div>

                {/* Status da Usina */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="size-4" /> System Healthy
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">12 Módulos Ativos</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EsolAppPreviewSection;
