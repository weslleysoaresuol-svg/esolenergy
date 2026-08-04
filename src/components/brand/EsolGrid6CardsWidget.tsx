import React from 'react';
import { CheckCircle2, Timer, Award, Leaf, Droplet, Sun } from 'lucide-react';

export interface EsolGrid6CardsWidgetProps {
  className?: string;
}

/**
 * `<EsolGrid6CardsWidget />` — Grid dos 6 Cards com Ícones Neon Idêntico ao Mockup (V13.2)
 */
export const EsolGrid6CardsWidget: React.FC<EsolGrid6CardsWidgetProps> = ({ className = '' }) => {
  const cards = [
    {
      title: 'Sustentabilidade',
      desc: 'Sustentabilidade para consumo em preço da sustentabilidade.',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Eficiência',
      desc: 'Engrenagens de máxima eficiência energética.',
      icon: Timer,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Economia',
      desc: 'Caminho de atração da máxima economia.',
      icon: Award,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Conservação',
      desc: 'Conservação e eficiência energética contínua.',
      icon: Leaf,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Produtividade',
      desc: 'Produção de energia com rentabilidade garantida.',
      icon: Droplet,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Brazilian energytech',
      desc: 'Soluções de classe mundial para todo o Brasil.',
      icon: Sun,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} id="vantagens">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl hover:border-slate-700 transition-all duration-300 space-y-3 group shadow-xl"
          >
            <div className={`p-3 rounded-xl ${item.bgColor} border w-fit group-hover:scale-105 transition-transform`}>
              <Icon className={`size-6 ${item.color}`} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EsolGrid6CardsWidget;
