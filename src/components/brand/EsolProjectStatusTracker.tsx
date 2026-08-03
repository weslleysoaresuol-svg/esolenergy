import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, Clock, Truck, Wrench, Gauge, Zap, Sparkles } from 'lucide-react';

export interface EsolProjectStatusTrackerProps {
  className?: string;
}

/**
 * `<EsolProjectStatusTracker />` — Buscador de Status de Usina por CPF/CNPJ (V13.2)
 */
export const EsolProjectStatusTracker: React.FC<EsolProjectStatusTrackerProps> = ({ className = '' }) => {
  const [docInput, setDocInput] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (docInput.trim().length > 3) {
      setSearched(true);
    }
  };

  const steps = [
    { title: '1. Dimensionamento & ART', desc: 'Projeto aprovado pela engenharia CREA', done: true },
    { title: '2. Parecer de Acesso', desc: 'Homologação aceita pela concessionária', done: true },
    { title: '3. Montagem & Hardware', desc: 'Instalação física dos módulos Tier-1', done: true },
    { title: '4. Vistoria Técnica', desc: 'Checklist de segurança e anti-ilhamento', done: true },
    { title: '5. Medidor Bidirecional', desc: 'Medidor trocado e usina gerando economia', done: false, active: true },
  ];

  return (
    <div className={`p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-8 shadow-2xl ${className}`} id="rastreamento">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Portal de Transparência
        </span>
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
          Acompanhe o Status do Seu Projeto
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Digite seu CPF, CNPJ ou o número da sua proposta para ver a fase de instalação da sua usina solar.
        </p>
      </div>

      {/* Formulário de Busca */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <input
            type="text"
            placeholder="Digite CPF, CNPJ ou Código (Ex: EPC-1046)"
            value={docInput}
            onChange={(e) => setDocInput(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all duration-300 cursor-pointer shrink-0"
        >
          Consultar
        </button>
      </form>

      {/* Timeline de Resultado */}
      {searched && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Projeto Localizado:</span>
              <h4 className="text-base font-extrabold text-white">Usina Fotovoltaica 12.5 kWp • Enel SP</h4>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Fase Final: Medidor Bidirecional
            </span>
          </div>

          <div className="space-y-4">
            {steps.map((st, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="pt-0.5">
                  {st.done ? (
                    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="size-5" />
                    </div>
                  ) : st.active ? (
                    <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      <Clock className="size-5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-slate-950 text-slate-600 border border-slate-800">
                      <Clock className="size-5" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${st.done ? 'text-emerald-400' : st.active ? 'text-amber-400' : 'text-slate-500'}`}>
                    {st.title}
                  </h5>
                  <p className="text-xs text-slate-400">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EsolProjectStatusTracker;
