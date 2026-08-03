import React, { useState } from 'react';
import { Home, Building2, Sprout, Briefcase, Wrench, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export interface EsolUserProfilesShowcaseProps {
  className?: string;
}

/**
 * `<EsolUserProfilesShowcase />` — Apresentação Institucional dos 6 Perfis (V13.2)
 */
export const EsolUserProfilesShowcase: React.FC<EsolUserProfilesShowcaseProps> = ({ className = '' }) => {
  const [activeProfile, setActiveProfile] = useState<number>(0);

  const profiles = [
    {
      id: 'residente',
      title: 'Cliente Residencial',
      icon: Home,
      color: 'text-amber-400',
      badge: 'Residência & Família',
      desc: 'Economize até 95% na conta de luz da sua casa. Escolha entre ter sua usina solar no telhado com Selo Verde ESOL ou assinar energia limpa sem obras.',
    },
    {
      id: 'comercial',
      title: 'Comercial & Indústria',
      icon: Building2,
      color: 'text-cyan-400',
      badge: 'Empresas & Galpões',
      desc: 'Reduza o OPEX da sua empresa e proteja seu fluxo de caixa contra aumentos de tarifas. Soluções customizadas para supermercados, galpões e indústrias.',
    },
    {
      id: 'agro',
      title: 'Produtor Rural Agro',
      icon: Sprout,
      color: 'text-emerald-400',
      badge: 'Campo & Agronegócio',
      desc: 'Autonomia energética para pivôs de irrigação, granjas e bombeamento solar no campo com financiamento facilitado para o agronegócio.',
    },
    {
      id: 'consultor',
      title: 'Consultor Comercial',
      icon: Briefcase,
      color: 'text-amber-300',
      badge: 'Parceiro de Vendas',
      desc: 'Construa uma carreira de sucesso no mercado de energia solar. Cadastro 100% gratuito sem taxa de adesão e ferramentas de propostas prontas.',
    },
    {
      id: 'instalador',
      title: 'Instalador Credenciado',
      icon: Wrench,
      color: 'text-orange-400',
      badge: 'Equipe de Montagem',
      desc: 'Receba demandas de instalação de sistemas fotovoltaicos na sua região com suporte técnico e suprimento direto de hardware Tier-1.',
    },
    {
      id: 'engenheiro',
      title: 'Engenheiro CREA',
      icon: ShieldCheck,
      color: 'text-violet-400',
      badge: 'Responsável Técnico',
      desc: 'Homologue pareceres de acesso junto às concessionárias de energia e emita ARTs de engenharia com fluxo ágil e digitalizado.',
    },
  ];

  const active = profiles[activeProfile];
  const IconComp = active.icon;

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="perfis">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Soluções Sob Medida
        </span>
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
          A Solução Certa Para o Seu Perfil
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Seja para economizar em casa, na empresa ou atuar no mercado solar, a ESOL tem o modelo ideal.
        </p>
      </div>

      {/* Tabs de Seleção */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {profiles.map((p, idx) => {
          const PIcon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfile(idx)}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                activeProfile === idx
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <PIcon className={`size-5 ${p.color}`} />
              <span className="text-[11px] font-bold tracking-tight line-clamp-1">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Painel do Perfil Ativo */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6">
        <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${active.color} shrink-0`}>
          <IconComp className="size-12" />
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {active.badge}
          </span>
          <h3 className="text-xl font-extrabold text-white">{active.title}</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{active.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default EsolUserProfilesShowcase;
