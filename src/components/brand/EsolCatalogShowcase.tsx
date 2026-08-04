import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Zap, Sparkles, CheckCircle, Cpu, BatteryCharging, Sun, FileText, ChevronRight } from 'lucide-react';

export interface EsolCatalogShowcaseProps {
  className?: string;
}

/**
 * `<EsolCatalogShowcase />` — Vitrine Interativa de Equipamentos Fotovoltaicos Tier-1 (V14.0 Maestro)
 * Filtros por categoria, 3D Hover Spotlight, animações Framer Motion e fichas técnicas detalhadas.
 */
export const EsolCatalogShowcase: React.FC<EsolCatalogShowcaseProps> = ({ className = '' }) => {
  const [activeCategory, setActiveCategory] = useState<'modulos' | 'inversores' | 'bess' | 'ev'>('modulos');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const categories = [
    { id: 'modulos', label: 'Módulos Fotovoltaicos', icon: Sun },
    { id: 'inversores', label: 'Inversores Híbridos', icon: Cpu },
    { id: 'bess', label: 'Armazenamento BESS', icon: BatteryCharging },
    { id: 'ev', label: 'Carregadores EV', icon: Zap },
  ];

  const products = {
    modulos: [
      {
        title: 'Módulos N-Type TOPCon 700W',
        brand: 'Canadian Solar / Jinko Solar',
        desc: 'Painéis bifaciais Glass-Glass de última geração com 22.8% de eficiência e menor taxa de degradação do mercado.',
        specs: ['Potência: 700Wp', 'Eficiência: 22.8%', 'Garantia Linear: 25 Anos', 'Degradação: 0.4%/ano'],
        image: '/images/esol-topcon-panel.png',
        badge: 'Tier-1 ANEEL',
        badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      },
      {
        title: 'Painéis Bifaciais 660W Glass-Glass',
        brand: 'Trina Solar / Longi',
        desc: 'Módulos fotovoltaicos projetados para geração estendida em telhados industriais e solo com captura traseira de albedo.',
        specs: ['Potência: 660Wp', 'Geração Traseira: +25%', 'Resistência a Granizo: Classe A', 'Garantia: 25 Anos'],
        image: '/images/esol-topcon-panel.png',
        badge: 'Bifacial Gen 3',
        badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      },
    ],
    inversores: [
      {
        title: 'Inversor String Híbrido 15kW',
        brand: 'Deye / Sungrow / WEG',
        desc: 'Inversor inteligente com controle de fluxo bidirecional, suporte off-grid instantâneo e preparado para baterias de lítio.',
        specs: ['Potência: 15 kW AC', 'Eficiência Máxima: 98.6%', 'MPPTs Independentes: 4', 'Garantia: 10 Anos'],
        image: '/images/esol-hybrid-inverter.png',
        badge: 'Híbrido Inteligente',
        badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      },
      {
        title: 'Microinversor Quad 2200W',
        brand: 'Hoymiles / APsystems',
        desc: 'Monitoramento em nível de módulo individual com desligamento rápido de segurança (Rapid Shutdown) e resposta de baixa tensão.',
        specs: ['Potência: 2.200W', 'Entradas MPPT: 4 Módulos', 'Garantia: 15 Anos', 'Proteção IP67'],
        image: '/images/esol-hybrid-inverter.png',
        badge: 'Rapid Shutdown',
        badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      },
    ],
    bess: [
      {
        title: 'Bateria de Lítio LFP BESS 10kWh',
        brand: 'BYD Battery-Box / Deye Lithium',
        desc: 'Sistema de armazenamento de energia em fosfato de ferro-lítio para backup de emergência em residências e comércios.',
        specs: ['Capacidade: 10.24 kWh', 'Química: LiFePO4', 'Ciclos de Vida: >6.000', 'Garantia: 10 Anos'],
        image: '/images/esol-bess-battery.png',
        badge: 'Zero Blackout',
        badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      },
    ],
    ev: [
      {
        title: 'Wallbox Solar EV 22kW Fast Charge',
        brand: 'WEG / Deye EV',
        desc: 'Estação de recarga inteligente para veículos elétricos alimentada diretamente pela energia solar fotovoltaica.',
        specs: ['Potência: 22 kW 32A', 'Conector: Tipo 2 Universal', 'Protocolo OCPP 1.6J', 'Garantia: 3 Anos'],
        image: '/images/esol-bess-battery.png',
        badge: 'Solar EV Ready',
        badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      },
    ],
  };

  const activeList = products[activeCategory];

  return (
    <div
      className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl ${className}`}
      id="produtos"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="size-3.5" /> HARDWARE FOTOVOLTAICO HOMOLOGADO ANEEL
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Equipamentos Solar de Classe Mundial
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-400 font-medium">
          Componentes Tier-1 rigorosamente testados e certificados para garantir máxima geração por 25 anos.
        </p>
      </div>

      {/* Tabs de Seleção de Categoria */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-3 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <IconComponent className="size-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid de Hardware com Animações Framer Motion */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="wait">
          {activeList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/60 backdrop-blur-2xl transition-all duration-300 group overflow-hidden flex flex-col justify-between shadow-2xl"
            >
              {/* Foto Real do Hardware */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-md ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Conteúdo de Texto */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    {item.brand}
                  </span>
                  <h3 className="font-display text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-slate-300 leading-relaxed font-normal">{item.desc}</p>
                </div>

                {/* Especificações Técnicas */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                  {item.specs.map((sp, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span>• {sp}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="size-4" /> Garantia 25A Tier-1
                  </span>
                  <span className="text-slate-400 group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                    Ver Datasheet <ChevronRight className="size-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EsolCatalogShowcase;
