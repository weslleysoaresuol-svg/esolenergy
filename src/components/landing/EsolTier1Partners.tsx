import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface EsolTier1PartnersProps {
  className?: string;
}

const BRAND_PARTNERS = [
  'Canadian Solar',
  'Jinko Solar',
  'JA Solar',
  'Longi Solar',
  'Growatt',
  'Huawei Solar',
  'SolarEdge',
  'Deye Inverters',
  'Sungrow'
];

export const EsolTier1Partners: React.FC<EsolTier1PartnersProps> = ({ className = '' }) => {
  return (
    <section className={`py-12 bg-[#0F172A] border-y border-slate-800/80 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Equipamentos de Classe Mundial • Nível Bloomberg Tier-1</span>
        </div>

        {/* Faixa de Marcas Parceiras */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-2 opacity-75">
          {BRAND_PARTNERS.map((brand, i) => (
            <div
              key={i}
              className="text-sm md:text-base font-black text-slate-400 hover:text-white transition-colors cursor-default tracking-tight uppercase"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EsolTier1Partners;
