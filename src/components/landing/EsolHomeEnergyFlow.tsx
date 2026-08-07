import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Cpu, Car, Smartphone, CheckCircle2, Sparkles, Box, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export interface EsolHomeEnergyFlowProps {
  className?: string;
}

const PROJECT_STEPS = [
  {
    stepNumber: '01',
    id: 'telhado',
    title: 'Captação Fotovoltaica (Telhado Solar)',
    subtitle: 'Módulos N-Type Bifaciais',
    icon: Sun,
    pinPos: { top: '25%', left: '42%' },
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Instalação da usina fotovoltaica no telhado com módulos monocristalinos bifaciais de alta eficiência (> 22.8%).',
    specs: ['Geração Direta + Albedo Refletido', 'Garantia de Desempenho de 25 Anos', 'Resistência Extrema a Vento e Granizo'],
    telemetry: 'Captação Sol 600W+'
  },
  {
    stepNumber: '02',
    id: 'inversor',
    title: 'Conversão & Inteligência (Parede Técnica)',
    subtitle: 'Inversor Central Inteligente',
    icon: Cpu,
    pinPos: { top: '52%', left: '24%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'O inversor inteligente fixado na parede técnica converte a energia contínua em corrente alternada sincronizada com a rede.',
    specs: ['Eficiência Máxima de 98.6%', 'Proteção AFCI Arc-Fault com IA', 'Grau de Proteção IP66 para Exterior'],
    telemetry: 'Conversão 220V/380V'
  },
  {
    stepNumber: '03',
    id: 'garagem',
    title: 'Alimentação VE (Garagem Iluminada)',
    subtitle: 'Estação Esol Charge VE',
    icon: Car,
    pinPos: { top: '62%', left: '78%' },
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Na garagem, o carregador inteligente utiliza a energia gerada no telhado para recarregar veículos elétricos de forma ultrarrápida.',
    specs: ['Potência de 22 kW AC Ultrarrápido', 'Plugue Universal Tipo 2 IEC 62196', 'Balanceamento Dinâmico de Carga'],
    telemetry: 'Recarga VE 22 kW'
  },
  {
    stepNumber: '04',
    id: 'telemetria',
    title: 'Monitoramento IoT (Central Mobile)',
    subtitle: 'Gestão Inteligente via App',
    icon: Smartphone,
    pinPos: { top: '82%', left: '48%' },
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Painel de controle na palma da sua mão com atualização a cada 60s, histórico de economia em R$ e laudos preditivos.',
    specs: ['Extratos Mensais em PDF', 'Notificações Preditivas de Manutenção', 'Certificado Verde da ANEEL'],
    telemetry: 'Telemetria Satélite'
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeStepId, setActiveStepId] = useState<string>('telhado');

  const activeStep = PROJECT_STEPS.find((s) => s.id === activeStepId) || PROJECT_STEPS[0];

  return (
    <section className={`py-24 bg-[#0B132B] text-white relative overflow-hidden ${className}`} id="fluxo-energetico">
      {/* Ambient Lighting Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
            <Box className="size-4 text-emerald-400" />
            <span>Engenharia Unificada • Casa Solar em 3D</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Projeto Integrado da Casa Solar 3D
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Acompanhe na maquete 3D completa a sequência técnica do seu projeto, desde a captação no telhado até a recarga na garagem.
          </p>
        </div>

        {/* MESTRE 3D VILLA COM PINS SEQUENCIAIS DO PROJETO */}
        <div className="max-w-5xl mx-auto">
          <div className="p-4 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Render 3D Unificado da Casa com Garagem */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/images/esol_3d_master_solar_villa_project.png"
                alt="Projeto 3D Unificado Casa Solar e Garagem Esol Energy"
                className="w-full h-[420px] md:h-[580px] object-cover object-center filter brightness-105 contrast-105"
              />

              {/* Gradient Overlay de Proteção Visual */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* PINS SEQUENCIAIS 01 - 02 - 03 - 04 SOBRE A CASA 3D */}
              {PROJECT_STEPS.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeStepId;
                return (
                  <div
                    key={item.id}
                    style={{ top: item.pinPos.top, left: item.pinPos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      onClick={() => setActiveStepId(item.id)}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xl ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_30px_#10b981] scale-110'
                          : 'bg-slate-950/80 text-emerald-400 border-emerald-500/50 hover:scale-105 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                    >
                      <span className="text-xs font-black font-mono">{item.stepNumber}</span>
                      <Icon className="size-4" />

                      {/* Halo Anel Pulsante */}
                      <span className={`absolute inset-0 rounded-full border-2 border-emerald-400 ${isActive ? 'animate-ping' : 'opacity-0'}`} />
                    </button>
                  </div>
                );
              })}

              {/* Badge de Legenda no Rodapé da Imagem */}
              <div className="absolute bottom-6 left-6 z-10 hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono font-bold text-emerald-400 shadow-xl backdrop-blur-md">
                <Sparkles className="size-4 text-emerald-400 animate-pulse" />
                <span>Clique nos pontos 01, 02, 03 e 04 no 3D para acompanhar o projeto</span>
              </div>
            </div>

            {/* LINHA SEQUENCIAL DO PROJETO (TIMELINE CONTINUA 01 ➔ 02 ➔ 03 ➔ 04) */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Sequência de Execução do Projeto Engenharia ESOL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {PROJECT_STEPS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeStepId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveStepId(item.id)}
                      className={`p-4 rounded-2xl border text-left space-y-3 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-950 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] scale-105'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {item.stepNumber}
                        </span>
                        <Icon className={`size-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white truncate">{item.title.split('(')[0]}</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{item.telemetry}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAINEL DETALHADO DA ETAPA SELECIONADA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-800/80"
              >
                <div className="md:col-span-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950">
                      PASSO {activeStep.stepNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${activeStep.badgeColor}`}>
                      {activeStep.subtitle}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white">{activeStep.title}</h3>

                  <p className="text-slate-300 text-sm leading-relaxed">{activeStep.description}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Especificações Técnicas da Etapa:</span>
                    {activeStep.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card de Status da Etapa */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 w-full relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500" />
                    
                    <div className="size-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                      <activeStep.icon className="size-8" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                        <span>{activeStep.telemetry}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Padrão Homologado ANEEL e Certificação CREA.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

      </div>
    </section>
  );
};

export default EsolHomeEnergyFlow;
