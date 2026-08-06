import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Star, CheckCircle, TrendingUp, Users, Building, Sparkles } from 'lucide-react';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';

export interface EsolSocialProofSectionProps {
  className?: string;
}

const TESTIMONIALS = [
  {
    name: "Dr. Roberto Guimarães",
    role: "Proprietário Residencial • Lagoa Santa / MG",
    savings: "Economia de R$ 1.850/mês",
    comment: "A instalação foi concluída em apenas 2 dias sem sujeira. Minha conta de luz caiu de R$ 2.000 para a taxa mínima. O atendimento da engenharia da Esol é nota 10.",
    rating: 5,
    tag: "Usina Residencial 12 kWp"
  },
  {
    name: "Carlos Eduardo Andrade",
    role: "Diretor do Grupo Andrade Logística",
    savings: "Economia de R$ 18.400/mês",
    comment: "Instalamos uma usina de 150 kWp no galpão da nossa distribuidora. O retorno de investimento veio em menos de 3 anos. O aplicativo nos dá o relatório exato todos os meses.",
    rating: 5,
    tag: "Usina Comercial 150 kWp"
  },
  {
    name: "Fazenda Santa Luzia",
    role: "Agronegócio • Triângulo Mineiro",
    savings: "Economia de R$ 34.000/mês",
    comment: "Zeramos os custos de energia da nossa estrutura de irrigação e secagem de grãos. Projeto impecável com a garantia contratual de 25 anos cumprida à risca.",
    rating: 5,
    tag: "Usina Solar Agro 300 kWp"
  }
];

export const EsolSocialProofSection: React.FC<EsolSocialProofSectionProps> = ({ className = '' }) => {
  return (
    <section className={`py-24 bg-[#0F172A] text-white relative overflow-hidden ${className}`} id="prova-social">
      {/* Camada de Granulação Noise */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Award className="size-4 text-emerald-400" />
            <span>Excelência Comprovada em Todo o Brasil</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Resultados Reais de Quem Escolheu a Esol Energy
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Mais de 15 Milhões de Reais economizados e centenas de usinas solares operando em capacidade máxima.
          </p>
        </div>

        {/* Métrica de Impacto Enterprise */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">+15 MWp</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Potência Instalada</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono">R$ 15M+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Economizados pelos Clientes</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <div className="text-3xl md:text-4xl font-black text-white font-mono">100%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Projetos Aprovados ANEEL</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">25 Anos</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Garantia de Desempenho</div>
          </div>
        </div>

        {/* Testemunhos de Clientes Reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating & Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.tag}
                  </span>
                </div>

                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-xs text-slate-400">{item.role}</div>
                <div className="text-xs font-mono font-bold text-emerald-400 pt-1 flex items-center gap-1">
                  <TrendingUp className="size-3.5" />
                  <span>{item.savings}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Banner de Selos de Confiança CREA / ANEEL */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Garantia Técnica & Engenharia Homologada</h3>
            <p className="text-xs text-slate-400">Todos os projetos contam com Responsabilidade Técnica (ART) registrada no CREA e processo direto com a concessionária.</p>
          </div>

          <div className="flex items-center gap-6">
            <SeloVerdeEsol size="md" />
            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20estudo%20gratuito%20de%20viabilidade%20com%20engenheiro."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer shrink-0"
            >
              Solicitar Estudo CREA
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default EsolSocialProofSection;
