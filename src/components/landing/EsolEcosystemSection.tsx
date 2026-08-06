import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Zap, Car, Users, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export interface EsolEcosystemSectionProps {
  className?: string;
}

const ECOSYSTEM_CARDS = [
  {
    id: "fotovoltaico",
    title: "1. Usinas Fotovoltaicas Inteligentes",
    tag: "Foco Principal • 70% de Economia Máxima",
    badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    highlight: true,
    icon: Sun,
    description: "Projetos de engenharia turnkey para residências, comércios, indústrias e agronegócio. Instalação física com módulos Tier-1 e monitoramento por IA.",
    metrics: [
      { label: "Economia Real", val: "Até 95%" },
      { label: "Garantia Painéis", val: "25 Anos" },
      { label: "Payback Médio", val: "3 Anos" }
    ],
    ctaText: "Simular Usina Própria"
  },
  {
    id: "assinatura",
    title: "2. Energia por Assinatura (Sem Obras)",
    tag: "Mercado Livre GD",
    badgeColor: "bg-blue-500 text-white font-bold",
    highlight: false,
    icon: Zap,
    description: "Desconto direto na sua fatura da concessionária sem precisar instalar painéis no telhado. Perfeito para imóveis alugados e apartamentos.",
    metrics: [
      { label: "Desconto Direto", val: "Até 25%" },
      { label: "Investimento Inicial", val: "R$ 0" },
      { label: "Cancelamento", val: "Sem Multa" }
    ],
    ctaText: "Ativar Assinatura"
  },
  {
    id: "charge",
    title: "3. Esol Charge — Eletropostos VE",
    tag: "Mobilidade Elétrica",
    badgeColor: "bg-amber-400 text-slate-950 font-bold",
    highlight: false,
    icon: Car,
    description: "Carregadores inteligentes de alta potência (AC/DC) para veículos elétricos em residências, condomínios, frotas e estabelecimentos comerciais.",
    metrics: [
      { label: "Velocidade", val: "Fast Charge" },
      { label: "Conectividade", val: "App OCPP" },
      { label: "Compatibilidade", val: "100% EVs" }
    ],
    ctaText: "Conhecer Esol Charge"
  },
  {
    id: "club",
    title: "4. Esol Club — Indique e Ganhe",
    tag: "Programa de Recompensas",
    badgeColor: "bg-indigo-500 text-white font-bold",
    highlight: false,
    icon: Users,
    description: "Transforme sua rede de contatos em comissões em dinheiro. Indique novos projetos fotovoltaicos e receba recompensas diretas na sua conta.",
    metrics: [
      { label: "Comissão Média", val: "R$ 1.500+" },
      { label: "Pagamento", val: "Via PIX" },
      { label: "Níveis", val: "Rank VIP" }
    ],
    ctaText: "Entrar no Esol Club"
  }
];

export const EsolEcosystemSection: React.FC<EsolEcosystemSectionProps> = ({ className = '' }) => {
  return (
    <section className={`py-24 bg-[#0F172A] text-white relative overflow-hidden ${className}`} id="ecossistema">
      {/* Grade Fotônica de Fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="size-4 text-emerald-400" />
            <span>Ecossistema Integrado de Energia Limpa</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Soluções Sob Medida para Qualquer Necessidade
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Da usina física no seu telhado à assinatura digital sem investimentos: escolha a modalidade perfeita para o seu perfil.
          </p>
        </div>

        {/* Grid dos 4 Pilares do Ecossistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ECOSYSTEM_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`p-8 rounded-3xl border relative flex flex-col justify-between transition-all duration-300 ${
                  card.highlight
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Border Beam Animado no Card Principal */}
                {card.highlight && (
                  <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 pointer-events-none animate-pulse" />
                )}

                <div className="space-y-6">
                  {/* Badge & Ícone */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider ${card.badgeColor}`}>
                      {card.tag}
                    </span>
                    <div className={`p-3 rounded-2xl ${card.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                      <Icon className="size-6" />
                    </div>
                  </div>

                  {/* Título & Descrição */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{card.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                  </div>

                  {/* Métricas-Chave */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {card.metrics.map((m, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</div>
                        <div className="text-base font-black text-emerald-400 font-mono">{m.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão CTA do Card */}
                <div className="pt-8">
                  <a
                    href="#simulador"
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      card.highlight
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_25px_-3px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{card.ctaText}</span>
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default EsolEcosystemSection;
