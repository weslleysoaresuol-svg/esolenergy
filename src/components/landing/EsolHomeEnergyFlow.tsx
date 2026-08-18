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
  Activity, 
  ShieldCheck, 
  CheckCircle,
  Home
} from 'lucide-react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolHomeEnergyFlowProps {
  className?: string;
}

const PROJECT_STEPS = [
  {
    stepNumber: '01',
    id: 'telhado',
    title: 'Captação Fotovoltaica (Telhado Solar)',
    subtitle: 'Módulos N-Type Bifaciais Monocristalinos',
    icon: Sun,
    pinPos: { top: '32%', left: '46%' },
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Arranjo fotovoltaico de alta densidade no telhado com módulos monocristalinos bifaciais N-Type de altíssima eficiência (> 22.8%) e tecnologia anti-degradação PID.',
    specs: ['Geração Direta + Albedo Refletido', 'Garantia de Desempenho Linear de 25 Anos', 'Resistência a Ventos de 160 km/h e Granizo'],
    telemetry: 'Captação Solar 600W+ por Módulo'
  },
  {
    stepNumber: '02',
    id: 'inversor',
    title: 'Conversão & Inteligência (Parede Técnica)',
    subtitle: 'Inversor Híbrido com IA e Proteção AFCI',
    icon: Cpu,
    pinPos: { top: '60%', left: '34%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'O inversor inteligente fixado na parede técnica sincroniza e converte a corrente contínua em corrente alternada pura (220V/380V) para alimentar toda a residência e a garagem.',
    specs: ['Eficiência Máxima de Conversão de 98.6%', 'Proteção AFCI Arc-Fault com Inteligência Artificial', 'Grau de Proteção IP66 para Área Externa'],
    telemetry: 'Conversão Senoidal Pura 220V/380V'
  },
  {
    stepNumber: '03',
    id: 'casa',
    title: 'Alimentação Residencial 24/7 (Circuitos da Casa)',
    subtitle: 'Energização Total da Casa com Proteção Nobreak',
    icon: Home,
    pinPos: { top: '56%', left: '60%' },
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'A energia solar alimenta instantaneamente todos os cômodos da residência: ar-condicionado, iluminação, eletrodomésticos e refrigeradores, com sistema de Nobreak automático que mantém a casa ligada mesmo em quedas da rede externa.',
    specs: ['Alimentação Contínua de Todos os Eletrodomésticos', 'Nobreak Instantâneo (Ilhamento Seguro em 10ms)', 'Economia Real de até 95% na Conta de Luz'],
    telemetry: 'Casa 100% Energizada com Energia Solar'
  },
  {
    stepNumber: '04',
    id: 'garagem',
    title: 'Estação Esol Charge VE (Garagem & Mobilidade)',
    subtitle: 'Wallbox 22 kW AC para Carros Elétricos',
    icon: Car,
    pinPos: { top: '69%', left: '16%' },
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Estação de recarga inteligente conectada diretamente ao sistema solar, permitindo recarregar o veículo elétrico na garagem de forma ultrarrápida com energia 100% limpa e gratuita do sol.',
    specs: ['Potência de 22 kW AC Ultrarrápida', 'Plugue Universal Tipo 2 IEC 62196', 'Balanceamento Dinâmico de Carga Solar'],
    telemetry: 'Recarga VE 22 kW AC Ultrarrápida'
  },
  {
    stepNumber: '05',
    id: 'telemetria',
    title: 'Monitoramento IoT (Central Mobile & App)',
    subtitle: 'Gestão Inteligente em Tempo Real na Palma da Mão',
    icon: Smartphone,
    pinPos: { top: '73%', left: '72%' },
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Controle total da geração, consumo da casa, recarga do veículo elétrico e economia acumulada em R$ pelo aplicativo oficial ESOL Energy com laudos preditivos de IA.',
    specs: ['Atualização de Dados via Satélite e Wi-Fi a cada 60s', 'Alertas Preditivos de IA para Manutenção Preventiva', 'Emissão Automática de Certificados de Crédito ANEEL'],
    telemetry: 'Telemetria Satélite Contínua'
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeStepId, setActiveStepId] = useState<string>('telhado');

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
            <span>Engenharia Unificada • Casa Solar Residencial 3D</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Projeto Integrado da Casa Solar
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Clique nos botões interativos na maquete para visualizar o caminho da energia: da captação no telhado à alimentação da casa, estação de recarga e telemetria móvel.
          </p>
        </div>

        {/* STAGE PRINCIPAL DA CASA SOLAR REAL COM LINHAS LASER, PINS E LUPA HOLOGRÁFICA */}
        <div className="max-w-5xl mx-auto">
          <div className="p-3 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative overflow-hidden space-y-6">
            
            {/* CONTAINER VISUAL DA FOTOGRAFIA ARQUITETÔNICA REAL */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl group">
              <img
                src="/images/esol_master_real_solar_house_2026.jpg"
                alt="Fotografia Arquitetônica Real de Casa Solar esol energy com Telhado, Inversor, Alimentação da Casa, Garagem VE e Morador no Jardim."
                className="w-full h-[480px] sm:h-[580px] md:h-[660px] object-cover object-center filter brightness-105 contrast-105"
              />

              {/* Gradient Vignette Sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080E21]/90 via-transparent to-[#080E21]/30 pointer-events-none" />

              {/* BRANDING OFICIAL ESOL ENERGY NO TOPO */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
                <EsolOfficialBrandSymbol width={120} />
                <span className="h-4 w-px bg-slate-800" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  PROJETO INTEGRADOR
                </span>
              </div>

              {/* LINHAS DINÂMICAS DE FLUXO LASER SVG ENTRE OS 5 PONTOS FÍSICOS */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-95">
                <defs>
                  <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Trecho 1: Telhado Solar (46%, 32%) -> Inversor Parede (34%, 60%) */}
                <line 
                  x1="46%" 
                  y1="32%" 
                  x2="34%" 
                  y2="60%" 
                  stroke="url(#flowGrad)" 
                  strokeWidth="3.5" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />
                
                {/* Trecho 2: Inversor Parede (34%, 60%) -> Alimentação Residencial (60%, 56%) */}
                <line 
                  x1="34%" 
                  y1="60%" 
                  x2="60%" 
                  y2="56%" 
                  stroke="url(#flowGrad)" 
                  strokeWidth="3.5" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />

                {/* Trecho 3: Inversor Parede (34%, 60%) -> Estação Esol Charge Garagem (16%, 69%) */}
                <line 
                  x1="34%" 
                  y1="60%" 
                  x2="16%" 
                  y2="69%" 
                  stroke="url(#flowGrad)" 
                  strokeWidth="3.5" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />

                {/* Trecho 4: Alimentação Residencial (60%, 56%) -> Morador IoT (72%, 73%) */}
                <line 
                  x1="60%" 
                  y1="56%" 
                  x2="72%" 
                  y2="73%" 
                  stroke="url(#flowGrad)" 
                  strokeWidth="3" 
                  strokeDasharray="8 4" 
                  className="animate-pulse" 
                />

                {/* CONE HOLOGRÁFICO DE ZOOM CONECTANDO O SMARTPHONE NA MÃO DA MORADORA (72%, 73%) AO SMARTPHONE AMPLIADO NO CANTO SUPERIOR (84%, 30%) */}
                <line x1="72%" y1="73%" x2="74%" y2="38%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
                <line x1="72%" y1="73%" x2="94%" y2="38%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
              </svg>

              {/* PINS HOTSPOTS CIRÚRGICOS SOBRE OS 5 COMPONENTES (SEM COBRIR O ROSTO DE NINGUÉM) */}
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

              {/* CELULAR AMPLIADO INTERATIVO (LUPA HOLOGRÁFICA NO CANTO SUPERIOR DIREITO LIMPO) */}
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

                {/* Tela do App Oficial */}
                <div className="bg-[#0F172A] rounded-[20px] p-3 space-y-2 text-white border border-slate-800 font-sans text-left">
                  <div className="flex items-center justify-between">
                    <EsolOfficialBrandSymbol width={85} />
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold flex items-center gap-1">
                      <span className="size-1 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                    </span>
                  </div>

                  {/* Card Dinâmico de Geração */}
                  <div className="p-2 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Geração Atual</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">9.6 kW</div>
                    <div className="text-[8.5px] text-slate-400 flex items-center gap-1">
                      <Zap className="size-2.5 text-amber-400" />
                      <span>Economia Hoje: <strong className="text-white">R$ 48,90</strong></span>
                    </div>
                  </div>

                  {/* Grid de Métricas Secundárias */}
                  <div className="grid grid-cols-2 gap-1">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Consumo Casa</div>
                      <div className="text-[10px] font-black text-emerald-400 font-mono">2.8 kW</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="text-[7px] text-slate-400 uppercase font-bold">Recarga VE</div>
                      <div className="text-[10px] font-black text-cyan-400 font-mono">22 kW AC</div>
                    </div>
                  </div>

                  {/* Badge de Status do Sistema */}
                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-semibold flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="size-2.5 shrink-0" />
                      <span>Sistema 100% Saudável</span>
                    </span>
                    <span className="font-mono text-[7.5px] text-slate-400">16 Módulos</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BARRA DE NAVEGAÇÃO DOS 5 COMPONENTES DE ENGENHARIA */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Sequência de Engenharia ESOL Energy</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {PROJECT_STEPS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeStepId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveStepId(item.id)}
                      className={`p-3 rounded-2xl border text-left space-y-2 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-900 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] scale-105'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {item.stepNumber}
                        </span>
                        <Icon className={`size-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
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
