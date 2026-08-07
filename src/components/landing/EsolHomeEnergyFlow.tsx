import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Cpu, Car, Smartphone, CheckCircle2, Sparkles, Box, Activity, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

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
    pinPos: { top: '20%', left: '46%' },
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
    pinPos: { top: '46%', left: '28%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'O inversor inteligente fixado na parede técnica converte a energia contínua em corrente alternada sincronizada com a rede.',
    specs: ['Eficiência Máxima de 98.6%', 'Proteção AFCI Arc-Fault com IA', 'Grau de Proteção IP66 para Exterior'],
    telemetry: 'Conversão 220V/380V'
  },
  {
    stepNumber: '03',
    id: 'garagem',
    title: 'Sistema BESS & Esol Charge (Alimenta Casa & VE)',
    subtitle: 'Armazenamento Residencial + Recarga VE',
    icon: Car,
    pinPos: { top: '62%', left: '76%' },
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'O carregador Esol Charge e o banco de baterias BESS alimentam o veículo elétrico E fornecem energia limpa para toda a residência durante a noite ou falhas de rede (Grid-Backup 24/7).',
    specs: ['Nobreak Residencial Automático (Zero Grid)', 'Baterias LFP de Lítio (6.000+ Ciclos)', 'Estação Esol Charge VE 22 kW AC'],
    telemetry: 'Alimenta Casa & VE 24/7'
  },
  {
    stepNumber: '04',
    id: 'telemetria',
    title: 'Monitoramento IoT (Central Mobile)',
    subtitle: 'Gestão Inteligente via App',
    icon: Smartphone,
    pinPos: { top: '78%', left: '50%' },
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
            <span>Engenharia Unificada • Casa Solar Residencial em 3D</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Projeto Integrado da Casa Solar 3D
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Acompanhe na maquete 3D da residência a sequência técnica do seu projeto, desde a captação no telhado até a alimentação da casa, carregador e telemetria.
          </p>
        </div>

        {/* MAQUETE 3D ULTRA-SIMPLES DE CASA TÉRREA COM POSICIONAMENTO INTELIGENTE E LINHAS DE ZOOM */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="p-4 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Render 3D Isométrico de Casa Solar Simples com Pouco Urbanismo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/images/esol_simple_house_light_urbanism.png"
                alt="Maquete 3D de Casa Solar Simples com Pouco Urbanismo esol energy."
                className="w-full h-[460px] md:h-[620px] object-cover object-center filter brightness-105 contrast-105"
              />

              {/* Overlay Gradient suave para contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent opacity-30 pointer-events-none" />

              {/* MARCA OFICIAL ESOL ENERGY LOGO APLICADA NO TOPO DA IMAGEM */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
                <EsolOfficialBrandSymbol width={130} />
                <span className="h-4 w-px bg-slate-800" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  PROJETO 3D INTEGRADOR
                </span>
              </div>

              {/* LINHAS DE LASER SEQUENCIAIS (1 ➔ 2 ➔ 3 ➔ 4) E LINHAS INDICADORAS DE ZOOM DO CELULAR */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-90">
                <defs>
                  <linearGradient id="seqLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Trecho 1: Placas Solares (Item 01) -> Inversor Parede (Item 02) */}
                <line x1="46%" y1="20%" x2="28%" y2="46%" stroke="url(#seqLaserGrad)" strokeWidth="3.5" strokeDasharray="8 4" className="animate-pulse" />
                
                {/* Trecho 2: Inversor Parede (Item 02) -> Chargebox & BESS (Item 03) */}
                <line x1="28%" y1="46%" x2="76%" y2="62%" stroke="url(#seqLaserGrad)" strokeWidth="3.5" strokeDasharray="8 4" className="animate-pulse" />

                {/* Trecho 3: Chargebox & BESS (Item 03) -> Morador IoT (Item 04) */}
                <line x1="76%" y1="62%" x2="50%" y2="78%" stroke="url(#seqLaserGrad)" strokeWidth="3.5" strokeDasharray="8 4" className="animate-pulse" />

                {/* LINHAS INDICADORAS DE ZOOM QUE LIGAM O CELULAR DO MORADOR (50%, 78%) AO CELULAR AMPLIADO (16%, 72%) */}
                <line x1="50%" y1="78%" x2="22%" y2="68%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.85" />
                <line x1="50%" y1="78%" x2="22%" y2="88%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.85" />
              </svg>

              {/* PINS SEQUENCIAIS 01 - 02 - 03 - 04 SOBRE OS COMPONENTES EXATOS */}
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
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer shadow-2xl ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_35px_#10b981] scale-110'
                          : 'bg-slate-950/90 text-emerald-400 border-emerald-500/70 hover:scale-105 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                    >
                      <span className="text-xs font-black font-mono">{item.stepNumber}</span>
                      <Icon className="size-4" />

                      {/* Halo Anel Pulsante */}
                      <span className={`absolute inset-0 rounded-full border-2 border-emerald-400 ${isActive ? 'animate-ping' : 'opacity-0'}`} />
                    </button>

                    {/* BALÃO EXPLICATIVO MINIMALISTA ULTRA-CLEAN (APENAS O TÍTULO) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: -12 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-950/95 border-2 border-emerald-400 shadow-2xl backdrop-blur-xl z-40 text-center pointer-events-auto"
                        >
                          {/* Seta do Balão */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-emerald-400" />
                          
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                              {item.stepNumber}
                            </span>
                            <span>{item.title}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* CELULAR AMPLIADO SAINDO DO CELULAR DA PESSOA COM LINHAS DE ZOOM (POSICIONADO NO CANTO INFERIOR ESQUERDO SEM ATAPALHAR A CASA OU OUTROS PINS) */}
              <div className="absolute bottom-6 left-6 z-30 hidden md:block w-52 sm:w-56 rounded-[32px] bg-slate-950/95 p-2.5 border-2 border-emerald-500/90 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                {/* Specular Glass Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-30 opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)'
                  }}
                />

                {/* Notch do Smartphone */}
                <div className="w-20 h-3 bg-slate-900 mx-auto rounded-b-lg mb-2 flex items-center justify-center">
                  <div className="size-1 rounded-full bg-slate-800" />
                </div>

                {/* Tela do App Oficial */}
                <div className="bg-[#0F172A] rounded-[20px] p-3 space-y-2 text-white border border-slate-800 font-sans text-left">
                  <div className="flex items-center justify-between">
                    <EsolOfficialBrandSymbol width={85} />
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold flex items-center gap-1">
                      <span className="size-1 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Geração de Hoje</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">42.8 kWh</div>
                    <div className="text-[8.5px] text-slate-400 flex items-center gap-1">
                      <Zap className="size-2.5 text-amber-400" />
                      <span>Economia: <strong className="text-white">R$ 41,20/dia</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Economia Mês</div>
                      <div className="text-[10px] font-black text-amber-400 font-mono">R$ 1.280,00</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Eficiência</div>
                      <div className="text-[10px] font-black text-emerald-400 font-mono">98.4%</div>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[8.5px] font-semibold text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="size-3" /> System Healthy
                    </span>
                    <span className="font-mono text-[7.5px] text-slate-400">12 Módulos</span>
                  </div>
                </div>
              </div>

            </div>

            {/* LINHA SEQUENCIAL DO PROJETO COM BOTÕES APENAS 01, 02 E 03 */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Sequência de Execução do Projeto Engenharia ESOL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PROJECT_STEPS.slice(0, 3).map((item) => {
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
