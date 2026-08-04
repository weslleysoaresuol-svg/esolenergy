import React from 'react';
import { Check, X, ShieldCheck, Zap, Award, Sparkles, TrendingUp } from 'lucide-react';

export interface EsolCompetitorComparisonProps {
  className?: string;
}

/**
 * `<EsolCompetitorComparison />` — Quadro Comparativo de Benchmarking Superior (V13.2)
 * Focado 100% no cliente final.
 */
export const EsolCompetitorComparison: React.FC<EsolCompetitorComparisonProps> = ({ className = '' }) => {
  const comparisonMatrix = [
    {
      feature: 'Propriedade Física da Usina (Selo Verde ESOL)',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Sua usina gera patrimônio real e valorização imobiliária',
    },
    {
      feature: 'Energia por Assinatura sem Obras (GD B2C/B2B)',
      esol: true,
      clarke: true,
      solarz: false,
      concessionaria: false,
      highlight: 'Economia imediata no boleto sem investir nenhum centavo',
    },
    {
      feature: 'Mercado Livre de Energia (MLE ANEEL)',
      esol: true,
      clarke: true,
      solarz: false,
      concessionaria: false,
      highlight: 'Migração descomplicada para médias e grandes indústrias',
    },
    {
      feature: 'Telemetria SaaS & Monitoramento IoT 24/7',
      esol: true,
      clarke: false,
      solarz: true,
      concessionaria: false,
      highlight: 'Acompanhamento da geração em tempo real pelo celular',
    },
    {
      feature: 'Atendimento Dedicado & Engenheiros Próprios CREA',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Suporte técnico pós-venda direto sem robôs de atendimento',
    },
    {
      feature: 'Proteção Lei 14.300/2022 & Homologação ANEEL',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Garantia jurídica e regulatória da sua concessão solar',
    },
  ];

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="diferenciais">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="size-3.5" /> BENCHMARKING DE EXCELÊNCIA
        </span>
        <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          Por que a ESOL Energy é a Escolha Nº 1 do Brasil?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Comparamos a estrutura de engenharia da ESOL com as principais soluções do mercado.
        </p>
      </div>

      {/* Matriz Comparativa Estilo SaaS Premium */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-4 text-slate-400 font-extrabold uppercase text-[10px]">Diferenciais & Soluções</th>
              <th className="p-4 text-center bg-amber-500/10 text-amber-400 font-black border-x border-amber-500/30 text-sm">
                ESOL ENERGY 🏆
              </th>
              <th className="p-4 text-center text-slate-400 font-bold">Clarke Energia</th>
              <th className="p-4 text-center text-slate-400 font-bold">SolarZ SaaS</th>
              <th className="p-4 text-center text-slate-400 font-bold">Concessionária</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparisonMatrix.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-200">
                  <span className="text-sm font-extrabold text-white">{item.feature}</span>
                  <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{item.highlight}</span>
                </td>
                <td className="p-4 text-center bg-amber-500/5 border-x border-amber-500/20">
                  <div className="size-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                    <Check className="size-4 stroke-[3]" />
                  </div>
                </td>
                <td className="p-4 text-center">
                  {item.clarke ? (
                    <Check className="size-4 text-slate-400 mx-auto" />
                  ) : (
                    <X className="size-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {item.solarz ? (
                    <Check className="size-4 text-slate-400 mx-auto" />
                  ) : (
                    <X className="size-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {item.concessionaria ? (
                    <Check className="size-4 text-slate-400 mx-auto" />
                  ) : (
                    <X className="size-4 text-slate-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EsolCompetitorComparison;
