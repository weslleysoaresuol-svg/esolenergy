import React from 'react';
import { EsolCategoryIcon, CategorySlug } from '@/components/brand/EsolCategoryIcons';
import { ShieldCheck, ArrowRight, Zap, Sparkles } from 'lucide-react';

export interface EsolCatalogShowcaseProps {
  className?: string;
}

/**
 * `<EsolCatalogShowcase />` — Vitrine de Equipamentos Fotovoltaicos Tier-1 (V13.2)
 */
export const EsolCatalogShowcase: React.FC<EsolCatalogShowcaseProps> = ({ className = '' }) => {
  const categories: Array<{ slug: CategorySlug; title: string; desc: string; tag: string }> = [
    {
      slug: 'modulos-fotovoltaicos',
      title: 'Módulos N-Type TOPCon',
      desc: 'Paineis de alta eficiência com vidro duplo Glass-Glass e garantia de 25 anos.',
      tag: 'Tier-1 Canadian / Jinko',
    },
    {
      slug: 'inversores-string',
      title: 'Inversores String Híbridos',
      desc: 'Inversores senoidais de alta frequência preparados para armazenamento de baterias.',
      tag: 'Deye / Sungrow / Weg',
    },
    {
      slug: 'microinversores',
      title: 'Microinversores MLPE',
      desc: 'Otimização nível módulo com monitoramento individual e máxima segurança em CC.',
      tag: 'APsystems / Hoymiles',
    },
    {
      slug: 'baterias-storage',
      title: 'Baterias de Lítio (BESS)',
      desc: 'Sistemas de armazenamento LFP para backup de emergência e Peak Shaving.',
      tag: 'BYD / Deye Lithium',
    },
    {
      slug: 'carregadores-ev',
      title: 'Carregadores Veículos Elétricos',
      desc: 'Estações de recarga rápida Wallbox AC/DC com gestão inteligente por app.',
      tag: 'Esol EV Mobility',
    },
    {
      slug: 'iot-telemetria',
      title: 'IoT & Dataloggers 5G',
      desc: 'Telemetria SaaS em tempo real conectada à inteligência artificial ESOL.',
      tag: 'Telemetria 24/7',
    },
  ];

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="produtos">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Equipamentos Homologados ANEEL
        </span>
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
          Hardware Fotovoltaico de Classe Mundial
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Componentes Tier-1 rigorosamente testados e certificados para garantir máxima geração por 25 anos.
        </p>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 backdrop-blur-xl transition-all duration-300 group space-y-4"
          >
            <div className="flex items-center justify-between">
              <EsolCategoryIcon category={cat.slug} size={28} />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                {cat.tag}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EsolCatalogShowcase;
