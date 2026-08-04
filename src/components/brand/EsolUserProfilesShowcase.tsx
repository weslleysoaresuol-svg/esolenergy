import React, { useState } from 'react';
import { Home, Building2, Sprout, Briefcase, Wrench, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';

export interface EsolUserProfilesShowcaseProps {
  className?: string;
}

/**
 * `<EsolUserProfilesShowcase />` — Apresentação dos 6 Perfis Otimizada (V13.2)
 * Layout denso, altamente informativo e rico sem espaços vazios.
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
      desc: 'Economize até 95% na conta de luz da sua casa. Escolha entre ter sua usina solar própria no telhado com Selo Verde ESOL ou assinar energia limpa sem obras e sem investir nada.',
      benefits: ['Redução imediata na fatura mensal', 'Garantia de 25 anos em placas Tier-1', 'Valorização patrimonial do seu imóvel'],
      cta: 'Simular para Minha Casa',
    },
    {
      id: 'comercial',
      title: 'Comercial & Indústria',
      icon: Building2,
      color: 'text-cyan-400',
      badge: 'Empresas & Galpões',
      desc: 'Reduza o OPEX da sua empresa e proteja seu fluxo de caixa contra aumentos de tarifas. Soluções customizadas para supermercados, galpões industriais e redes varejistas.',
      benefits: ['Migração direta para Mercado Livre ANEEL', 'Projetos Turnkey em Alta/Média Tensão', 'Certificação ESG e Selo Verde Corporativo'],
      cta: 'Solicitar Estudo Corporativo',
    },
    {
      id: 'agro',
      title: 'Produtor Rural Agro',
      icon: Sprout,
      color: 'text-emerald-400',
      badge: 'Campo & Agronegócio',
      desc: 'Autonomia energética para pivôs de irrigação, granjas, resfriadores e bombeamento solar no campo com linhas de financiamento facilitado para o agronegócio.',
      benefits: ['Sistemas isolados Off-Grid e Hybrid', 'Economia em pico de safra e irrigação', 'Linhas de crédito Agro com carência'],
      cta: 'Simular Solução Agro',
    },
    {
      id: 'consultor',
      title: 'Consultor Comercial',
      icon: Briefcase,
      color: 'text-amber-300',
      badge: 'Parceiro de Vendas',
      desc: 'Construa uma carreira de sucesso no mercado de energia solar. Cadastro 100% gratuito sem taxa de adesão e aplicativo completo com simulador de propostas.',
      benefits: ['Sem taxa de adesão ou mensalidades', 'Comissionamento direto no fechamento', 'Suporte técnico de engenharia dedicado'],
      cta: 'Quero Ser Consultor ESOL',
    },
    {
      id: 'instalador',
      title: 'Instalador Credenciado',
      icon: Wrench,
      color: 'text-orange-400',
      badge: 'Equipe de Montagem',
      desc: 'Receba demandas de instalação de sistemas fotovoltaicos homologados na sua região com suprimento direto de kits de hardware Tier-1 e pagamentos pontuais.',
      benefits: ['Suprimento direto de inversores e módulos', 'Demanda garantida na sua região', 'Treinamentos técnicos na ESOL Academy'],
      cta: 'Cadastrar Minha Equipe',
    },
    {
      id: 'engenheiro',
      title: 'Engenheiro CREA',
      icon: ShieldCheck,
      color: 'text-violet-400',
      badge: 'Responsável Técnico',
      desc: 'Homologue pareceres de acesso junto às concessionárias de energia e emita ARTs de engenharia com fluxo 100% ágil e digitalizado.',
      benefits: ['Plataforma ágil de homologação ANEEL', 'Integração direta com o Data Vault ESOL', 'Remuneração transparente por projeto'],
      cta: 'Credenciar Meu CREA',
    },
  ];

  const active = profiles[activeProfile];
  const IconComp = active.icon;

  const handleCTA = () => {
    const msg = encodeURIComponent(`Olá! Sou ${active.title} e gostaria de mais informações sobre as soluções ESOL Energy.`);
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="perfis">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="size-3.5" /> SOLUÇÕES SOB MEDIDA
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          A Solução Certa Para o Seu Perfil
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
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
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                activeProfile === idx
                  ? 'bg-slate-900 text-white border border-amber-500/50 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <PIcon className={`size-5 ${p.color}`} />
              <span className="text-[11px] font-bold tracking-tight">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Card Ativo com Conteúdo Denso e Rico */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
        <div className="lg:col-span-8 space-y-4">
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
            {active.badge}
          </span>
          <h3 className="text-2xl font-black text-white">{active.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">{active.desc}</p>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Principais Vantagens:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {active.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <IconComp className="size-12" />
          </div>
          <button
            onClick={handleCTA}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all duration-300 shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="size-4" />
            <span>{active.cta}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsolUserProfilesShowcase;
