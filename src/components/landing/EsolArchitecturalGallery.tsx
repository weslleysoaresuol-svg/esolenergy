import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Camera, MapPin, Zap, Sparkles } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolArchitecturalGalleryProps {
  className?: string;
}

const GALLERY_PROJECTS = [
  {
    id: 1,
    title: 'Residência Alphaville',
    location: 'Nova Lima • MG',
    capacity: '14.8 kWp',
    savings: 'R$ 1.950/mês',
    image: '/assets/hero-house-DklpKRf2.jpg',
    category: 'Residencial Luxo'
  },
  {
    id: 2,
    title: 'Usina Comercial Andrade',
    location: 'Contagem • MG',
    capacity: '150 kWp',
    savings: 'R$ 18.400/mês',
    image: '/assets/hero-solar-premium-DbbfHtsS.png',
    category: 'Comercial & Indústria'
  },
  {
    id: 3,
    title: 'Complexo Solar Agro',
    location: 'Uberaba • MG',
    capacity: '320 kWp',
    savings: 'R$ 36.200/mês',
    image: '/assets/installer-solar-premium-SFDW5uRB.png',
    category: 'Agronegócio'
  }
];

export const EsolArchitecturalGallery: React.FC<EsolArchitecturalGalleryProps> = ({ className = '' }) => {
  return (
    <section className={`py-24 bg-[#0F172A] text-white relative overflow-hidden ${className}`} id="galeria">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Camera className="size-4 text-emerald-400" />
            <span>Portfólio de Engenharia Real</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Engenharia Solar de Alto Padrão em Ação
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Conheça algumas das nossas usinas fotovoltaicas entregues com homologação completa e acabamento arquitetônico impecável.
          </p>
        </div>

        {/* Grid Arquitetônico de Fotos de Usinas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GALLERY_PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl space-y-4 group"
            >
              {/* Moldura da Imagem com Specular Overlay */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase text-emerald-400">
                  {project.category}
                </span>
              </div>

              {/* Informações da Usina */}
              <div className="p-6 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight">{project.title}</h3>
                  <SeloVerdeEsol size="sm" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="size-3.5 text-emerald-400" />
                  <span>{project.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Potência Instalada</div>
                    <div className="text-base font-mono font-black text-white">{project.capacity}</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Economia Gerada</div>
                    <div className="text-base font-mono font-black text-emerald-400">{project.savings}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EsolArchitecturalGallery;
