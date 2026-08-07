import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Cpu, Car, Smartphone, CheckCircle2, Sparkles, Box, Activity, RotateCw, Eye, ShieldCheck } from 'lucide-react';
import { EsolProduct3DViewer } from './EsolProduct3DViewer';

export interface EsolHomeEnergyFlowProps {
  className?: string;
}

const FLOW_NODES = [
  {
    id: 'sol',
    title: '1. Radiação Solar Fotônica',
    subtitle: 'Energia Limpa e Abundante',
    icon: Sun,
    pinPos: { top: '12%', left: '22%' },
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'A iluminação solar banha o telhado do imóvel com radiação de alta frequência, fornecendo os fótons necessários para a geração contínua.',
    specs: ['Irradiância Solar Global: 5.6 kWh/m²/dia', 'Emissão Zero Carbono na Fonte', 'Energia 100% Renovável e Gratuita'],
    powerFlow: '5.6 kWh/m²'
  },
  {
    id: 'modulos',
    title: '2. Módulos Fotovoltaicos N-Type (Telhado)',
    subtitle: 'Captação no Telhado Solar',
    icon: Zap,
    pinPos: { top: '26%', left: '48%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Módulos bifaciais de safira instalados no telhado transformam a luz em eletricidade de corrente contínua com máxima eficiência.',
    specs: ['Eficiência da Célula > 22.8%', 'Resistência a Granizo e Carga de Vento', 'Tecnologia N-Type Bifacial Tier-1'],
    powerFlow: '600W+ por Módulo'
  },
  {
    id: 'inversor',
    title: '3. Inversor Central Esol (Parede Técnica)',
    subtitle: 'Gerenciamento com IA na Parede',
    icon: Cpu,
    pinPos: { top: '48%', left: '28%' },
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Instalado na parede técnica da casa, o inversor converte a energia para corrente alternada pronta para consumo no imóvel e rede.',
    specs: ['Eficiência Máxima de 98.6%', 'Proteção AFCI Arc-Fault com IA', 'Sincronia Automática com Concessionária'],
    powerFlow: '220V/380V AC'
  },
  {
    id: 'bateria',
    title: '4. Esol Charge VE (Garagem Iluminada)',
    subtitle: 'Estação de Recarga na Garagem',
    icon: Car,
    pinPos: { top: '64%', left: '72%' },
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Na garagem iluminada, a estação de recarga alimenta o seu veículo elétrico utilizando diretamente a energia vinda do telhado.',
    specs: ['Carregamento VE 22 kW Ultrarrápido', 'Plugue Universal Tipo 2 IEC', 'Gestão Inteligente de Sobrecarga'],
    powerFlow: '22 kW Recarga'
  },
  {
    id: 'app',
    title: '5. Telemetria Mobile (Monitoramento IoT)',
    subtitle: 'Gestão Inteligente na Palma da Mão',
    icon: Smartphone,
    pinPos: { top: '78%', left: '46%' },
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Controle total da usina através do aplicativo Esol Energy, exibindo a economia acumulada em tempo real e o status dos equipamentos.',
    specs: ['Telemetria via Satélite a cada 60s', 'Extratos Mensais em PDF', 'Alertas Preditivos de Limpeza'],
    powerFlow: 'Sincronizado IoT'
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('modulos');
  const [is3DModalOpen, setIs3DModalOpen] = useState<boolean>(false);

  const activeNode = FLOW_NODES.find((node) => node.id === activeNodeId) || FLOW_NODES[1];

  return (
    <section className={`py-24 bg-[#0B132B] text-white relative overflow-hidden ${className}`} id="fluxo-energetico">
      {/* Glow de Fundo Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Box className="size-4 text-emerald-400" />
            <span>Palco 3D Arquitetônico Hiper-Realista</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Casa Solar Inteligente em Realidade 3D
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Clique nos pontos pulsantes na casa, no telhado solar e na garagem para explorar o funcionamento e abrir a imersão 3D de cada item.
          </p>
        </div>

        {/* NAVEGAÇÃO SUPERIOR DE ITENS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {FLOW_NODES.map((node) => {
            const Icon = node.icon;
            const isActive = node.id === activeNodeId;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono transition-all cursor-pointer inline-flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] scale-105'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                <span>{node.title.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* PALCO 3D HIPER-REALISTA COM PINS INTERATIVOS */}
        <div className="max-w-5xl mx-auto">
          <div className="p-4 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Render 3D da Casa Solar com Garagem e Pins */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/images/esol_3d_real_solar_house_garage.png"
                alt="Casa Solar 3D com Garagem e Carro Elétrico Esol Energy"
                className="w-full h-[400px] md:h-[550px] object-cover object-center filter brightness-105 contrast-105"
              />

              {/* Overlay Gradient suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* PINS INTERATIVOS NA CASA 3D */}
              {FLOW_NODES.map((node) => {
                const Icon = node.icon;
                const isActive = node.id === activeNodeId;
                return (
                  <div
                    key={node.id}
                    style={{ top: node.pinPos.top, left: node.pinPos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      onClick={() => setActiveNodeId(node.id)}
                      className={`relative flex items-center justify-center p-3 rounded-full border transition-all cursor-pointer group/pin ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_30px_#10b981] scale-125'
                          : 'bg-slate-950/80 text-emerald-400 border-emerald-500/50 hover:scale-110 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                    >
                      <Icon className="size-5" />

                      {/* Anel Pulsante */}
                      <span className={`absolute inset-0 rounded-full border-2 border-emerald-400 ${isActive ? 'animate-ping' : 'opacity-0'}`} />

                      {/* Tooltip com Nome ao Passar o Mouse */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-white opacity-0 group-hover/pin:opacity-100 transition-opacity shadow-xl pointer-events-none">
                        {node.title}
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* Badge Flutuante de Instrução */}
              <div className="absolute bottom-6 left-6 z-10 hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono font-bold text-emerald-400 shadow-xl backdrop-blur-md">
                <Sparkles className="size-4 text-emerald-400 animate-pulse" />
                <span>Clique nos marcadores na casa para destacar os equipamentos</span>
              </div>
            </div>

            {/* PAINEL DETALHADO DE DESTAQUE DO ITEM SELECIONADO */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2"
              >
                <div className="md:col-span-8 space-y-4">
                  <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${activeNode.badgeColor}`}>
                    {activeNode.subtitle}
                  </span>

                  <h3 className="text-2xl md:text-3xl font-black text-white">{activeNode.title}</h3>

                  <p className="text-slate-300 text-sm leading-relaxed">{activeNode.description}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Especificações Técnicas:</span>
                    {activeNode.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIs3DModalOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer inline-flex items-center gap-2"
                    >
                      <RotateCw className="size-4" />
                      <span>Abrir Imersão 3D Interativa em Three.js WebGL</span>
                    </button>
                  </div>
                </div>

                {/* Card de Métricas do Nó */}
                <div className="md:col-span-4 flex justify-center">
                  <div
                    onClick={() => setIs3DModalOpen(true)}
                    className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 w-full relative overflow-hidden shadow-2xl cursor-pointer group hover:border-emerald-500/50 transition-all"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500" />
                    
                    <div className="size-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-all">
                      <activeNode.icon className="size-8" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                        <span>{activeNode.powerFlow}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Clique para inspecionar em Three.js 3D com rotação 360°.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* Modal Canvas Three.js WebGL para Imersão 3D Completa */}
      <AnimatePresence>
        {is3DModalOpen && (
          <EsolProduct3DViewer
            productId={activeNodeId as any}
            onClose={() => setIs3DModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default EsolHomeEnergyFlow;
