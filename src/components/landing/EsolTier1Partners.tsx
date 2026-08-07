import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

export interface EsolTier1PartnersProps {
  className?: string;
}

const BRAND_PARTNERS = [
  'CANADIAN SOLAR',
  'JINKO SOLAR',
  'JA SOLAR',
  'LONGI SOLAR',
  'GROWATT',
  'HUAWEI SOLAR',
  'SOLAREDGE',
  'DEYE INVERTERS',
  'SUNGROW',
  'BYD ENERGY',
  'ENPHASE ENERGY'
];

export const EsolTier1Partners: React.FC<EsolTier1PartnersProps> = ({ className = '' }) => {
  // Duplicamos a lista para criar a ilusão perfeita de carrossel infinito sem emendas
  const duplicatedBrands = [...BRAND_PARTNERS, ...BRAND_PARTNERS];

  return (
    <section className={`py-10 bg-[#0F172A] border-y border-slate-800/80 text-white overflow-hidden relative ${className}`}>
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Equipamentos Homologados de Classe Mundial • Nível Bloomberg Tier-1</span>
        </div>
      </div>

      {/* Marquee Infinito Continuo */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Gradients de Fade nas Bordas Lateral */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0F172A] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0F172A] to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            ease: 'linear',
            duration: 25,
            repeat: Infinity,
          }}
          className="flex items-center gap-12 whitespace-nowrap w-max"
        >
          {duplicatedBrands.map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-4 group cursor-default"
            >
              <span className="text-sm md:text-base font-black tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors font-mono uppercase">
                {brand}
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500/50" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EsolTier1Partners;
