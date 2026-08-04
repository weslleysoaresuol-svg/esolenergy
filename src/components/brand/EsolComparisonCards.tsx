import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Zap, XCircle } from 'lucide-react';

export interface EsolComparisonCardsProps {
  className?: string;
}

/**
 * `<EsolComparisonCards />` — Comparativo Antes e Depois (V16.0 Maestro)
 * Foco visual limpo e claro sobre a diferença de estar refém da concessionária vs. ter energia solar ESOL.
 */
export const EsolComparisonCards: React.FC<EsolComparisonCardsProps> = ({ className = '' }) => {
  return (
    <section className={`py-16 bg-slate-900/60 border-y border-slate-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
            A ESCOLHA INTELIGENTE
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Por Que Continuar Rasgando Dinheiro na Conta de Luz?
          </h2>
          <p className="font-body text-sm sm:text-base text-slate-400 font-normal">
            Veja o impacto financeiro de ser refém da concessionária comparado à liberdade da energia solar.
          </p>
        </div>

        {/* Grid dos 2 Lados: Antes vs. Depois */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado 1: Concessionária Tradicional (Sem Solar) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-slate-950/90 border border-red-500/30 text-white space-y-6 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">SITUAÇÃO ATUAL</span>
                  <h3 className="text-xl font-black text-white font-display">Sem Energia Solar</h3>
                </div>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300 font-body">
              <li className="flex items-start gap-3">
                <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Fatura alta todo mês:</strong> Você paga valores crescentes sem nenhum retorno no seu bolso.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Inflação tarifária imprevisível:</strong> Reajustes anuais e bandeiras vermelhas constantes.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Zero patrimônio:</strong> Em 25 anos, você terá entregue centenas de milhares de reais à concessionária.</span>
              </li>
            </ul>
          </motion.div>

          {/* Lado 2: Com ESOL Energy (Com Solar) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-slate-950/90 border border-emerald-500/50 text-white space-y-6 shadow-2xl relative overflow-hidden shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">COM A ESOL ENERGY</span>
                  <h3 className="text-xl font-black text-white font-display">Sua Liberdade Energética</h3>
                </div>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300 font-body">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Economia de até 95%:</strong> Sua fatura cai ao mínimo regulatório ou você obtém desconto no boleto.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Proteção por 25 Anos:</strong> Previsibilidade total de custos garantida pela engenharia ESOL.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Patrimônio & Valorização:</strong> Usina solar que gera ativos reais no imóvel e Selo Verde.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EsolComparisonCards;
