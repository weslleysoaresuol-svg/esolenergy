import React from 'react';
import { EsolCategoryIcon, CategorySlug } from '@/components/brand/EsolCategoryIcons';
import { ShieldCheck, ArrowRight, Zap, Sparkles, CheckCircle } from 'lucide-react';

export interface EsolCatalogShowcaseProps {
  className?: string;
}

/**
 * `<EsolCatalogShowcase />` — Vitrine de Equipamentos Fotovoltaicos Tier-1 (V13.2)
 * Apresentação de hardware com fotografia real em 8K, bordas neon e certificação ANEEL.
 */
export const EsolCatalogShowcase: React.FC<EsolCatalogShowcaseProps> = ({ className = '' }) => {
  const hardwareItems = [
    {
      title: 'Módulos N-Type TOPCon',
      desc: 'Painéis bifaciais Glass-Glass de alta eficiência com até 700W e 25 anos de garantia.',
      tag: 'Tier-1 Canadian / Jinko',
      image: '/images/esol-topcon-panel.png',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      title: 'Inversores String Híbridos',
      desc: 'Inversores senoidais de alta frequência preparados para armazenamento de baterias.',
      tag: 'Deye / Sungrow / Weg',
      image: '/images/esol-hybrid-inverter.png',
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      title: 'Baterias de Lítio (BESS)',
      desc: 'Sistemas de armazenamento LFP para backup de emergência residencial e comercial.',
      tag: 'BYD / Deye Lithium',
      image: '/images/esol-bess-battery.png',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  return (
    <div className={`p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-10 shadow-2xl ${className}`} id="produtos">
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

      {/* Grid de Hardware com Fotografia 8K */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {hardwareItems.map((item, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 backdrop-blur-xl transition-all duration-500 group overflow-hidden space-y-5 shadow-2xl hover:scale-[1.02] flex flex-col justify-between"
          >
            {/* Foto Real de Alta Definição */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-950">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-md ${item.badgeColor}`}>
                  {item.tag}
                </span>
              </div>
            </div>

            {/* Conteúdo de Texto do Card */}
            <div className="p-6 pt-0 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-slate-300 mt-2 leading-relaxed font-normal">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="size-4" /> Certificação ISO 9001
                </span>
                <span className="font-mono text-slate-400">Garantia 25A</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EsolCatalogShowcase;
