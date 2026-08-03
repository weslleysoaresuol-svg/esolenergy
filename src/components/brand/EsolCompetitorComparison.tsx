import React from 'react';
import { Check, X, ShieldCheck, Zap, Award, Sparkles, TrendingUp } from 'lucide-react';

export interface EsolCompetitorComparisonProps {
  className?: string;
}

/**
 * `<EsolCompetitorComparison />` — Quadro Comparativo de Benchmarking Superior (V13.2)
 * Demarcação dos diferenciais da ESOL Energy frente à Clarke Energia, SolarZ e Concessionárias Tradicionais.
 */
export const EsolCompetitorComparison: React.FC<EsolCompetitorComparisonProps> = ({ className = '' }) => {
  const comparisonMatrix = [
    {
      feature: 'Propriedade Física da Usina (Selo Verde Esol)',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Sua usina gera patrimônio real',
    },
    {
      feature: 'Energia por Assinatura sem Obras (GD B2C/B2B)',
      esol: true,
      clarke: true,
      solarz: false,
      concessionaria: false,
      highlight: 'Economia imediata no boleto',
    },
    {
      feature: 'Mercado Livre de Energia (MLE ANEEL)',
      esol: true,
      clarke: true,
      solarz: false,
      concessionaria: false,
      highlight: 'Para médias e grandes indústrias',
    },
    {
      feature: 'Telemetria SaaS & Monitoramento 24/7',
      esol: true,
      clarke: false,
      solarz: true,
      concessionaria: false,
      highlight: 'Acompanhamento via IoT 5G',
    },
    {
      feature: 'Rede Comercial MMN de 7 Níveis (Overrides)',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Royalties recorrentes para parceiros',
    },
    {
      feature: 'Isenção Fio B & Lei 14.300/2022 Garantida',
      esol: true,
      clarke: false,
      solarz: false,
      concessionaria: false,
      highlight: 'Proteção jurídica e regulatória',
    },
  ];

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Benchmarking de Excelência
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Por que a ESOL Energy é a Escolha Nº 1 do Brasil?
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Comparamos os pilares da ESOL Energy com as principais soluções do mercado.
        </p>
      </div>

      {/* Matriz Comparativa */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Diferenciais & Soluções</th>
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
                <td className="p-4 font-semibold text-slate-200">
                  <span>{item.feature}</span>
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{item.highlight}</span>
                </td>
                <td className="p-4 text-center bg-amber-500/5 border-x border-amber-500/20">
                  <div className="inline-flex p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="size-4 stroke-[3]" />
                  </div>
                </td>
                <td className="p-4 text-center">
                  {item.clarke ? (
                    <Check className="size-4 text-slate-400 mx-auto" />
                  ) : (
                    <X className="size-4 text-rose-500/60 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {item.solarz ? (
                    <Check className="size-4 text-slate-400 mx-auto" />
                  ) : (
                    <X className="size-4 text-rose-500/60 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  <X className="size-4 text-rose-500/60 mx-auto" />
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
