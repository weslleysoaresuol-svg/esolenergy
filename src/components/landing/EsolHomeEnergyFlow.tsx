import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Cpu, Car, Smartphone, CheckCircle2, Sparkles, Box, Activity, ShieldCheck } from 'lucide-react';

export interface EsolHomeEnergyFlowProps {
  className?: string;
}

const FLOW_NODES = [
  {
    id: 'sol',
    title: '1. Captação Fotônica Solar',
    subtitle: 'Radiação Infinita do Sol',
    icon: Sun,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'A luz solar é captada pelos módulos fotovoltaicos de última geração instalados no seu telhado ou terreno.',
    specs: ['Eficiência da Célula > 22.8%', 'Resistência a Granizo e Vento', 'Tecnologia N-Type Bifacial'],
    powerFlow: '98.4 kW/h'
  },
  {
    id: 'modulos',
    title: '2. Módulos Fotovoltaicos Tier-1',
    subtitle: 'Conversão CC de Alta Precisão',
    icon: Zap,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Os semicondutores de silício puro transformam os fótons em corrente contínua (CC) com perda zero de energia.',
    specs: ['Garantia de Desempenho 25 Anos', 'Degradação Menor que 0.4%/ano', 'Vidro Duplo de Safira Anti-Reflexo'],
    powerFlow: '750V DC'
  },
  {
    id: 'inversor',
    title: '3. Inversor Inteligente Esol',
    subtitle: 'Conversão CA & Sincronia ANEEL',
    icon: Cpu,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Converte a corrente contínua em corrente alternada (CA) idêntica à da rede elétrica, gerenciando o fluxo inteligente.',
    specs: ['Eficiência Máxima de 98.6%', 'Proteção AFCI Arc-Fault com IA', 'Conectividade Wi-Fi/4G Integrada'],
    powerFlow: '220V/380V AC'
  },
  {
    id: 'bateria',
    title: '4. Esol Charge & Autoconsumo',
    subtitle: 'Alimentação VE & Imóvel',
    icon: Car,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'A energia limpa alimenta instantaneamente as luzes, eletrodomésticos e os veículos elétricos da sua propriedade.',
    specs: ['Carregamento VE Ultrarrápido', 'Redução Imediata na Fatura', 'Créditos Injetados na Concessionária'],
    powerFlow: '22 kW Ultrarrápido'
  },
  {
    id: 'app',
    title: '5. Telemetria App Esol Mobile',
    subtitle: 'Gestão Inteligente na Palma da Mão',
    icon: Smartphone,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Você visualiza exatamente quantos kWh sua usina está gerando em tempo real e o montante em R$ economizado.',
    specs: ['Atualização a Cada 60 Segundos', 'Extratos Mensais em PDF', 'Alertas Preditivos de Manutenção'],
    powerFlow: 'IoT Sincronizado'
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('modulos');

  const activeNode = FLOW_NODES.find((node) => node.id === activeNodeId) || FLOW_NODES[1];

  return (
    <section className={`py-24 bg-[#0B132B] text-white relative overflow-hidden ${className}`} id="fluxo-energetico">
      {/* Luz de Fundo Fotônica 3D */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Box className="size-4 text-emerald-400" />
            <span>Estágio Tridimensional Interativo 3D</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Palco 3D do Fluxo Energético Fotônico
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Explore interativamente cada nó do ecossistema tridimensional e acompanhe o transporte em tempo real dos fótons solares.
          </p>
        </div>

        {/* PALCO 3D INTERATIVO */}
        <div className="perspective-1000 max-w-5xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-12 relative overflow-hidden">
            
            {/* Diagrama 3D dos Nós Conectados com Lasers Fotônicos */}
            <div className="relative py-8">
              {/* Linha de Conexão Tridimensional */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-purple-500 -translate-y-1/2 rounded-full opacity-40 z-0" />
              
              {/* Partícula Laser Fotônica Animada (Pulse Loop) */}
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-4 w-12 h-2 bg-emerald-400 rounded-full blur-[4px] -translate-y-1/2 shadow-[0_0_20px_#10b981] z-0 pointer-events-none"
              />

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                {FLOW_NODES.map((node) => {
                  const Icon = node.icon;
                  const isActive = node.id === activeNodeId;
                  return (
                    <motion.button
                      key={node.id}
                      whileHover={{ scale: 1.08, rotateX: 10, rotateY: -10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveNodeId(node.id)}
                      className={`p-5 rounded-2xl border transition-all text-center space-y-3 cursor-pointer relative ${
                        isActive
                          ? 'bg-slate-950 border-emerald-500 shadow-[0_0_35px_-5px_rgba(16,185,129,0.5)] scale-105'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className={`size-12 mx-auto rounded-xl flex items-center justify-center transition-all ${
                        isActive ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Icon className="size-6" />
                      </div>

                      <div className="text-xs font-black text-white truncate font-mono">
                        {node.title.split('.')[1]}
                      </div>

                      <div className="text-[10px] text-emerald-400 font-mono font-bold">
                        {node.powerFlow}
                      </div>

                      {isActive && (
                        <div className="absolute -top-2 -right-2 size-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Painel Detalhado 3D com Métricas de Telemetria */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-800/80"
              >
                <div className="md:col-span-7 space-y-4">
                  <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${activeNode.badgeColor}`}>
                    {activeNode.subtitle}
                  </span>

                  <h3 className="text-2xl md:text-3xl font-black text-white">{activeNode.title}</h3>

                  <p className="text-slate-300 text-sm leading-relaxed">{activeNode.description}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Especificações do Nó:</span>
                    {activeNode.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HUD Card Holográfico 3D */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 w-full relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500" />
                    
                    <div className="size-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                      <activeNode.icon className="size-8" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                        <span>3D HUD • {activeNode.powerFlow}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Homologado e Certificado conforme as normas da ANEEL e do CREA.</div>
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
