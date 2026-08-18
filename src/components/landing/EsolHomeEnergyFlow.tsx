import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Zap, 
  Cpu, 
  Car, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  Box, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle,
  Moon,
  BatteryCharging,
  ShieldAlert,
  Gauge,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolHomeEnergyFlowProps {
  className?: string;
}

// Modos de Simulação Dinâmica de Fluxo Energético
type SimulationMode = 'DAY_PEAK' | 'NIGHT_BESS' | 'GRID_OUTAGE' | 'FAST_CHARGE';

interface ModeConfig {
  id: SimulationMode;
  label: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  generationKw: number;
  consumptionKw: number;
  batterySoc: number;
  batteryKw: number; // positivo = carregando, negativo = descarregando
  gridKw: number; // positivo = injetando, negativo = importando
  savingsToday: string;
  appStatus: string;
  appStatusColor: string;
  flowDescription: string;
}

const SIMULATION_MODES: Record<SimulationMode, ModeConfig> = {
  DAY_PEAK: {
    id: 'DAY_PEAK',
    label: 'Pico Solar (12h)',
    badge: 'Geração Máxima',
    icon: Sun,
    color: 'amber',
    generationKw: 9.6,
    consumptionKw: 2.8,
    batterySoc: 98,
    batteryKw: 4.4,
    gridKw: 2.4,
    savingsToday: 'R$ 48,90',
    appStatus: 'Pico Solar Ativo • 100% Limpo',
    appStatusColor: 'text-emerald-400',
    flowDescription: 'O telhado gera 9.6 kW: abastece o consumo da casa (2.8 kW), carrega o banco BESS e o carro elétrico (4.4 kW) e injeta o excedente (2.4 kW) na rede para gerar créditos.'
  },
  NIGHT_BESS: {
    id: 'NIGHT_BESS',
    label: 'Modo Noturno (20h)',
    badge: 'Autossuficiência BESS',
    icon: Moon,
    color: 'purple',
    generationKw: 0.0,
    consumptionKw: 3.2,
    batterySoc: 82,
    batteryKw: -3.2,
    gridKw: 0.0,
    savingsToday: 'R$ 54,20',
    appStatus: 'BESS Ativo • Zero Custo de Ponta',
    appStatusColor: 'text-purple-400',
    flowDescription: 'Sem sol, o banco de baterias BESS assume 100% da carga da residência (3.2 kW). A casa não consome nada da concessionária no horário de ponta.'
  },
  GRID_OUTAGE: {
    id: 'GRID_OUTAGE',
    label: 'Blackout / Queda de Rede',
    badge: 'Nobreak 10ms Ativo',
    icon: ShieldAlert,
    color: 'rose',
    generationKw: 6.8,
    consumptionKw: 3.0,
    batterySoc: 92,
    batteryKw: -1.2,
    gridKw: 0.0,
    savingsToday: '100% Protegido',
    appStatus: 'Modo Ilhamento Seguro (Zero Grid)',
    appStatusColor: 'text-amber-400',
    flowDescription: 'A rede externa caiu! Em 10 milissegundos o sistema ESOL isola a residência e mantém iluminação, refrigeradores, internet e ar-condicionado 100% ligados sem piscar.'
  },
  FAST_CHARGE: {
    id: 'FAST_CHARGE',
    label: 'Turbo Esol Charge VE',
    badge: 'Recarga Prioritária VE',
    icon: Car,
    color: 'cyan',
    generationKw: 9.6,
    consumptionKw: 1.6,
    batterySoc: 95,
    batteryKw: 1.0,
    gridKw: 0.0,
    savingsToday: 'R$ 180 economizados no tanque',
    appStatus: 'Esol Charge 22 kW AC • 100km em 45min',
    appStatusColor: 'text-cyan-400',
    flowDescription: 'Prioridade solar inteligente direcionada para a estação Esol Charge de 22 kW na garagem, garantindo recarga ultrarrápida do veículo com energia 100% gratuita do sol.'
  }
};

const PROJECT_STEPS = [
  {
    stepNumber: '01',
    id: 'telhado',
    title: 'Captação Fotovoltaica (Telhado Solar)',
    subtitle: 'Módulos N-Type Bifaciais Monocristalinos',
    icon: Sun,
    pinPos: { top: '32%', left: '46%' },
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Arranjo fotovoltaico de alta densidade no telhado com células N-Type monocristalinas bifaciais de altíssima eficiência (> 22.8%) e tecnologia anti-degradação PID.',
    specs: ['Geração Direta + Albedo Refletido', 'Garantia de Desempenho Linear de 25 Anos', 'Resistência a Ventos de 160 km/h e Granizo'],
    telemetry: 'Captação Solar 600W+ por Módulo'
  },
  {
    stepNumber: '02',
    id: 'inversor',
    title: 'Conversão & Inteligência (Parede Técnica)',
    subtitle: 'Inversor Híbrido com IA e Proteção AFCI',
    icon: Cpu,
    pinPos: { top: '68%', left: '34%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'O inversor híbrido central na parede técnica sincroniza a energia fotovoltaica, controla o fluxo de corrente contínua para alternada (220V/380V) e gerencia o isolamento seguro da rede.',
    specs: ['Eficiência de Conversão de 98.6%', 'Proteção de Arco Elétrico AFCI com Inteligência Artificial', 'Grau de Proteção IP66 com Dissipação Passiva'],
    telemetry: 'Conversão Senoidal Pura 220V/380V'
  },
  {
    stepNumber: '03',
    id: 'garagem',
    title: 'Sistema BESS & Esol Charge (Casa & VE)',
    subtitle: 'Baterias LFP de Lítio + Wallbox 22 kW AC',
    icon: Car,
    pinPos: { top: '72%', left: '14%' },
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'O banco de baterias BESS e o carregador Esol Charge alimentam a recarga do veículo elétrico E atuam como Nobreak automático residencial durante a noite ou em quedas de energia (Grid-Backup 24/7).',
    specs: ['Nobreak Automático Residencial (10ms Zero Grid)', 'Baterias LFP de Lítio com 6.000+ Ciclos Úteis', 'Estação Esol Charge VE de 22 kW AC Ultrarrápida'],
    telemetry: 'Alimentação Casa & VE 24/7'
  },
  {
    stepNumber: '04',
    id: 'telemetria',
    title: 'Monitoramento IoT (Central Mobile)',
    subtitle: 'Telemetria em Tempo Real via App Oficial',
    icon: Smartphone,
    pinPos: { top: '76%', left: '66%' },
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Gestão completa do ecossistema solar na palma da mão: geração instantânea em kW, fluxo de energia em tempo real, extratos de economia em R$ e laudos preditivos de manutenção.',
    specs: ['Atualização de Dados via Satélite e Wi-Fi a cada 60s', 'Alertas Preditivos de IA para Manutenção Preventiva', 'Emissão Automática de Certificados de Crédito ANEEL'],
    telemetry: 'Telemetria Satélite Contínua'
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeStepId, setActiveStepId] = useState<string>('telhado');
  const [activeMode, setActiveMode] = useState<SimulationMode>('DAY_PEAK');

  const currentMode = SIMULATION_MODES[activeMode];
  const activeStep = PROJECT_STEPS.find((s) => s.id === activeStepId) || PROJECT_STEPS[0];

  return (
    <section className={`py-24 bg-[#080E21] text-white relative overflow-hidden ${className}`} id="fluxo-energetico">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[900px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Sparkles className="size-4 text-emerald-400 animate-pulse" />
            <span>Simulador 3D • Ecossistema Solar Residencial Inteligente</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Engenharia Integrada da Casa Solar em Tempo Real
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Interaja com a maquete arquitetônica real e alterne os modos operacionais para visualizar o fluxo contínuo de energia entre telhado, inversor, banco BESS, carregador VE e telemetria móvel.
          </p>
        </div>

        {/* COCKPIT DE MODOS OPERACIONAIS (SELETOR DE CENÁRIOS EM TEMPO REAL) */}
        <div className="max-w-4xl mx-auto p-2 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(SIMULATION_MODES) as SimulationMode[]).map((modeKey) => {
              const mode = SIMULATION_MODES[modeKey];
              const ModeIcon = mode.icon;
              const isSelected = activeMode === modeKey;

              return (
                <button
                  key={modeKey}
                  onClick={() => setActiveMode(modeKey)}
                  className={`relative p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-400 shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] scale-[1.02]'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/60 text-slate-400'}`}>
                      <ModeIcon className="size-4" />
                    </div>
                    {isSelected && (
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{mode.label}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-medium">{mode.badge}</div>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="activeModeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Banner Explicativo do Modo Ativo */}
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-300">
            <Info className="size-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{currentMode.flowDescription}</span>
          </div>
        </div>

        {/* STAGE PRINCIPAL DA CASA SOLAR REAL COM LINHAS LASER, PINS E LUPA HOLOGRÁFICA */}
        <div className="max-w-5xl mx-auto">
          <div className="p-3 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative overflow-hidden space-y-6">
            
            {/* CONTAINER VISUAL DA FOTOGRAFIA ARQUITETÔNICA REAL */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl group">
              <img
                src="/images/esol_master_real_solar_house_2026.jpg"
                alt="Fotografia Arquitetônica Real de Casa Solar esol energy com Telhado, Inversor, Garagem VE e Morador no Jardim."
                className="w-full h-[480px] sm:h-[580px] md:h-[660px] object-cover object-center filter brightness-105 contrast-105 transition-transform duration-700"
              />

              {/* Gradient Vignette Sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080E21]/90 via-transparent to-[#080E21]/30 pointer-events-none" />

              {/* BRANDING OFICIAL ESOL ENERGY NO TOPO */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
                <EsolOfficialBrandSymbol width={120} />
                <span className="h-4 w-px bg-slate-800" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  SIMULADOR REAL 360°
                </span>
              </div>

              {/* HUD DE TELEMETRIA EM TEMPO REAL NO TOPO DIREITO (MOBILE/DESKTOP) */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-md font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sun className="size-3.5" />
                  <span>{currentMode.generationKw > 0 ? `+${currentMode.generationKw} kW` : '0.0 kW'}</span>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <BatteryCharging className="size-3.5" />
                  <span>{currentMode.batterySoc}%</span>
                </div>
              </div>

              {/* LINHAS DINÂMICAS DE FLUXO LASER SVG ENTRE OS 4 PONTOS FÍSICOS DA CASA */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-95">
                <defs>
                  <linearGradient id="solarFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  <linearGradient id="bessDischargeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                
                {/* Trecho 1: Telhado Solar (46%, 32%) -> Inversor Parede (34%, 68%) */}
                {activeMode !== 'NIGHT_BESS' && (
                  <line 
                    x1="46%" 
                    y1="32%" 
                    x2="34%" 
                    y2="68%" 
                    stroke="url(#solarFlowGrad)" 
                    strokeWidth="3.5" 
                    strokeDasharray="8 4" 
                    className="animate-pulse" 
                  />
                )}
                
                {/* Trecho 2: Inversor Parede (34%, 68%) -> Garagem Esol Charge & BESS (14%, 72%) */}
                <line 
                  x1="34%" 
                  y1="68%" 
                  x2="14%" 
                  y2="72%" 
                  stroke={activeMode === 'NIGHT_BESS' ? 'url(#bessDischargeGrad)' : 'url(#solarFlowGrad)'} 
                  strokeWidth="3.5" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />

                {/* Trecho 3: Inversor Parede (34%, 68%) -> Morador IoT / Casa (66%, 76%) */}
                <line 
                  x1="34%" 
                  y1="68%" 
                  x2="66%" 
                  y2="76%" 
                  stroke="url(#solarFlowGrad)" 
                  strokeWidth="3" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />

                {/* CONE HOLOGRÁFICO DE ZOOM CONECTANDO O SMARTPHONE NA MÃO DA MORADORA (66%, 76%) AO SMARTPHONE AMPLIADO (84%, 32%) */}
                <line x1="66%" y1="76%" x2="72%" y2="40%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
                <line x1="66%" y1="76%" x2="94%" y2="40%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
              </svg>

              {/* PINS HOTSPOTS CIRÚRGICOS SOBRE OS 4 COMPONENTES DA CASA REAL */}
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
                      className={`relative flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all cursor-pointer shadow-2xl backdrop-blur-md ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_35px_#10b981] scale-110'
                          : 'bg-slate-950/90 text-emerald-400 border-emerald-500/70 hover:scale-105 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                    >
                      <span className="text-xs font-black font-mono">{item.stepNumber}</span>
                      <Icon className="size-3.5 sm:size-4" />

                      {/* Halo Radar Pulsante */}
                      <span className={`absolute inset-0 rounded-full border-2 border-emerald-400 ${isActive ? 'animate-ping' : 'opacity-0'}`} />
                    </button>

                    {/* BALÃO EXPLICATIVO MINIMALISTA ULTRA-CLEAN */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: -12 }}
                          exit={{ opacity: 0, scale: 0.85, y: -10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-950/95 border-2 border-emerald-400 shadow-2xl backdrop-blur-xl z-40 text-center pointer-events-auto"
                        >
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

              {/* CELULAR AMPLIADO INTERATIVO (LUPA HOLOGRÁFICA NO CANTO SUPERIOR DIREITO) */}
              <div className="absolute top-20 right-4 sm:top-20 sm:right-6 z-30 hidden md:block w-56 sm:w-60 rounded-[32px] bg-slate-950/95 p-2.5 border-2 border-emerald-500/90 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                {/* Efeito Specular Glass */}
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

                {/* Tela do App Oficial Dinâmico */}
                <div className="bg-[#0F172A] rounded-[20px] p-3 space-y-2 text-white border border-slate-800 font-sans text-left">
                  <div className="flex items-center justify-between">
                    <EsolOfficialBrandSymbol width={85} />
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold flex items-center gap-1">
                      <span className="size-1 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                    </span>
                  </div>

                  {/* Card Dinâmico de Geração / Status do Modo */}
                  <div className="p-2 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Potência Atual</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {currentMode.generationKw > 0 ? `${currentMode.generationKw} kW` : 'BESS 3.2 kW'}
                    </div>
                    <div className="text-[8.5px] text-slate-400 flex items-center gap-1">
                      <Zap className="size-2.5 text-amber-400" />
                      <span>Hoje: <strong className="text-white">{currentMode.savingsToday}</strong></span>
                    </div>
                  </div>

                  {/* Grid de Métricas Secundárias */}
                  <div className="grid grid-cols-2 gap-1">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Bateria BESS</div>
                      <div className="text-[10px] font-black text-cyan-400 font-mono">{currentMode.batterySoc}%</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Rede Ext.</div>
                      <div className="text-[10px] font-black text-amber-400 font-mono">
                        {currentMode.gridKw > 0 ? `+${currentMode.gridKw} kW` : '0.0 kW'}
                      </div>
                    </div>
                  </div>

                  {/* Badge de Status do Sistema */}
                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-semibold flex items-center justify-between">
                    <span className={`flex items-center gap-1 truncate ${currentMode.appStatusColor}`}>
                      <CheckCircle className="size-2.5 shrink-0" />
                      <span className="truncate">{currentMode.appStatus}</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* BARRA DE NAVEGAÇÃO DOS 4 COMPONENTES DE ENGENHARIA */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Sequência de Execução de Engenharia ESOL Energy</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROJECT_STEPS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeStepId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveStepId(item.id)}
                      className={`p-3 sm:p-4 rounded-2xl border text-left space-y-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-900 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] scale-105'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {item.stepNumber}
                        </span>
                        <Icon className={`size-4 sm:size-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white truncate">{item.title.split('(')[0]}</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">{item.telemetry}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAINEL TÉCNICO ESTRATIFICADO DA ETAPA SELECIONADA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4 border-t border-slate-800/80"
              >
                <div className="md:col-span-8 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950">
                      ETAPA {activeStep.stepNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${activeStep.badgeColor}`}>
                      {activeStep.subtitle}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">{activeStep.title}</h3>

                  <p className="text-slate-300 text-sm leading-relaxed">{activeStep.description}</p>

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Especificações e Garantias:</span>
                    {activeStep.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card de Homologação e Selos de Engenharia */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center space-y-3.5 w-full relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500" />

                    <div className="size-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                      <activeStep.icon className="size-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                        <span>{activeStep.telemetry}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        Projeto 100% em conformidade com Normas ANEEL 482/687/1000 e ART CREA.
                      </div>
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
