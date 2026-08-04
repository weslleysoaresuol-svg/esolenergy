import React from 'react';
import { EsolCategoryIcon, CategorySlug } from '@/components/brand/EsolCategoryIcons';
import { ShieldCheck, ArrowRight, Zap, Sparkles, CheckCircle } from 'lucide-react';

export interface EsolCatalogShowcaseProps {
  className?: string;
}

/**
 * `<EsolCatalogShowcase />` — Vitrine de Equipamentos Fotovoltaicos Tier-1 (V13.2)
 * Apresentação de hardware com estético de luxo, bordas neon e certificação ANEEL.
 */
export const EsolCatalogShowcase: React.FC<EsolCatalogShowcaseProps> = ({ className = '' }) => {
  const categories: Array<{ slug: CategorySlug; title: string; desc: string; tag: string; color: string }> = [
    {
      slug: 'modulos-fotovoltaicos',
      title: 'Módulos N-Type TOPCon',
      desc: 'Painéis bifaciais Glass-Glass de alta eficiência com até 700W e 25 anos de garantia.',
      tag: 'Tier-1 Canadian / Jinko',
      color: 'amber',
    },
    {
      slug: 'inversores-string',
      title: 'Inversores String Híbridos',
      desc: 'Inversores senoidais de alta frequência preparados para armazenamento de baterias.',
      tag: 'Deye / Sungrow / Weg',
      color: 'cyan',
    },
    {
      slug: 'microinversores',
      title: 'Microinversores MLPE',
      desc: 'Otimização nível módulo com monitoramento individual por placa e máxima segurança.',
      tag: 'APsystems / Hoymiles',
      color: 'emerald',
    },
    {
      slug: 'baterias-storage',
      title: 'Baterias de Lítio (BESS)',
      desc: 'Sistemas de armazenamento LFP para backup de emergência residencial e comercial.',
      tag: 'BYD / Deye Lithium',
      color: 'amber',
    },
    {
      slug: 'carregadores-ev',
      title: 'Carregadores Veículos Elétricos',
      desc: 'Estações de recarga rápida Wallbox AC/DC integradas à geração solar.',
      tag: 'Esol EV Mobility',
      color: 'cyan',
    },
    {
      slug: 'iot-telemetria',
      title: 'IoT & Dataloggers 5G',
      desc: 'Telemetria SaaS em tempo real conectada ao aplicativo e inteligência ESOL.',
      tag: 'Telemetria SaaS 24/7',
      color: 'emerald',
    },
  ];

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="produtos">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="size-3.5" /> HARDWARE HOMOLOGADO ANEEL
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Equipamentos Solar de Classe Mundial
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Componentes Tier-1 rigorosamente testados e certificados para garantir máxima geração por 25 anos.
        </p>
      </div>

      {/* Grid de Categorias com Bordas Neon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 backdrop-blur-xl transition-all duration-300 group space-y-4 shadow-xl hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                <EsolCategoryIcon category={cat.slug} size={28} />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-amber-400 border border-amber-500/20">
                {cat.tag}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">{cat.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="size-3.5" /> Certificação ISO 9001
              </span>
              <span>Garantia 25A</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EsolCatalogShowcase;
