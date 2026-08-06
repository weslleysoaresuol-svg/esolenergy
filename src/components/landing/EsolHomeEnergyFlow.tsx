import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Cpu, Car, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

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
    specs: ['Eficiência da Célula > 22.8%', 'Resistência a Granizo e Vento', 'Tecnologia N-Type Bifacial']
  },
  {
    id: 'modulos',
    title: '2. Módulos Fotovoltaicos Tier-1',
    subtitle: 'Conversão CC de Alta Precisão',
    icon: Zap,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Os semicondutores de silício puro transformam os fótons em corrente contínua (CC) com perda zero de energia.',
    specs: ['Garantia de Desempenho 25 Anos', 'Degradação Menor que 0.4%/ano', 'Vidro Duplo de Safira Anti-Reflexo']
  },
  {
    id: 'inversor',
    title: '3. Inversor Inteligente Esol',
    subtitle: 'Conversão CA & Sincronia ANEEL',
    icon: Cpu,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    description: 'Converte a corrente contínua em corrente alternada (CA) idêntica à da rede elétrica, gerenciando o fluxo inteligente.',
    specs: ['Eficiência Máxima de 98.6%', 'Proteção AFCI Arc-Fault com IA', 'Conectividade Wi-Fi/4G Integrada']
  },
  {
    id: 'bateria',
    title: '4. Esol Charge & Autoconsumo',
    subtitle: 'Alimentação VE & Imóvel',
    icon: Car,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'A energia limpa alimenta instantaneamente as luzes, eletrodomésticos e os veículos elétricos da sua propriedade.',
    specs: ['Carregamento VE Ultrarrápido', 'Redução Imediata na Fatura', 'Créditos Injetados na Concessionária']
  },
  {
    id: 'app',
    title: '5. Telemetria App Esol Mobile',
    subtitle: 'Gestão Inteligente na Palma da Mão',
    icon: Smartphone,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Você visualiza exatamente quantos kWh sua usina está gerando em tempo real e o montante em R$ economizado.',
    specs: ['Atualização a Cada 60 Segundos', 'Extratos Mensais em PDF', 'Alertas Preditivos de Manutenção']
  }
];

export const EsolHomeEnergyFlow: React.FC<EsolHomeEnergyFlowProps> = ({ className = '' }) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('modulos');

  const activeNode = FLOW_NODES.find((node) => node.id === activeNodeId) || FLOW_NODES[1];

  return (
    <section className={`py-24 bg-[#0F172A] text-white relative overflow-hidden ${className}`} id="fluxo-energetico">
      {/* Grade de Fundo Sutileza 1px */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="size-4 text-emerald-400" />
            <span>Arquitetura de Engenharia Enphase / Tesla Tier</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Como Funciona o Fluxo da Sua Energia Limpa
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Clique em cada etapa abaixo para entender a tecnologia de ponta que converte o sol em economia financeira garantida.
          </p>
        </div>

        {/* Barra Nav de Passos Interativos (Nodes) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-5xl mx-auto">
          {FLOW_NODES.map((node) => {
            const Icon = node.icon;
            const isActive = node.id === activeNodeId;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`p-4 rounded-2xl border transition-all text-left space-y-2 cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900 border-emerald-500/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="size-5" />
                  </div>
                  {isActive && <span className="size-2 rounded-full bg-emerald-400 animate-ping" />}
                </div>

                <div className="text-xs font-bold text-white truncate">{node.title.split('.')[1]}</div>
              </button>
            );
          })}
        </div>

        {/* Card Detalhado da Etapa Selecionada com Animação */}
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-7 space-y-4">
                <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${activeNode.badgeColor}`}>
                  {activeNode.subtitle}
                </span>

                <h3 className="text-2xl md:text-3xl font-black text-white">{activeNode.title}</h3>

                <p className="text-slate-300 text-sm leading-relaxed">{activeNode.description}</p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Especificações Técnicas:</span>
                  {activeNode.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lado Gráfico do Nó */}
              <div className="md:col-span-5 flex justify-center">
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 w-full">
                  <div className="size-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                    <activeNode.icon className="size-10" />
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">100% OPERACIONAL</div>
                  <div className="text-[11px] text-slate-400">Homologado e Certificado conforme as normas da ANEEL e do CREA.</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default EsolHomeEnergyFlow;
