import React, { useState } from 'react';
import { Calculator, Zap, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';

export interface EsolSimulator3in1Props {
  onSendLead?: (data: { valor: number; modalidade: string }) => void;
  className?: string;
}

/**
 * `<EsolSimulator3in1 />` — Widget de Calculadora 3-em-1 Idêntico ao Mockup Oficial (V13.2)
 */
export const EsolSimulator3in1: React.FC<EsolSimulator3in1Props> = ({
  onSendLead,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'turnkey' | 'subscription' | 'free_energy'>('turnkey');
  const [turnkeyVal, setTurnkeyVal] = useState<number>(35000);
  const [subscriptionVal, setSubscriptionVal] = useState<number>(360);
  const [freeEnergyVal, setFreeEnergyVal] = useState<number>(1000);

  return (
    <div className={`p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl text-white space-y-6 shadow-2xl ${className}`} id="simulador">
      {/* Abas Superiores Idênticas ao Mockup */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('turnkey')}
          className={`py-2.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
            activeTab === 'turnkey'
              ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Turnkey
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`py-2.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-slate-800 text-amber-400 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Subscription
        </button>
        <button
          onClick={() => setActiveTab('free_energy')}
          className={`py-2.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
            activeTab === 'free_energy'
              ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Free Energy Market
        </button>
      </div>

      {/* Caixa 1: Turnkey Box */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
          <h4 className="text-sm font-black text-white">Turnkey</h4>
        </div>
        <p className="text-[11px] text-slate-400">Produção estimada de até:</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-sm font-black text-cyan-400 font-mono">
            R$ {turnkeyVal.toLocaleString('pt-BR')},00
          </span>
          <span className="text-[10px] text-slate-500 font-mono">mWh</span>
        </div>
      </div>

      {/* Caixa 2: Subscription Box */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <h4 className="text-sm font-black text-white">Subscription</h4>
        </div>
        <p className="text-[11px] text-slate-400">Produção energia acumulada:</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-sm font-black text-amber-400 font-mono">
            R$ {subscriptionVal.toLocaleString('pt-BR')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">mWh</span>
        </div>
      </div>

      {/* Caixa 3: Free Energy Market Box */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            <h4 className="text-sm font-black text-white">Free Energy Market</h4>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span className="text-emerald-400">● Turnkey</span>
            <span>○ Free Energy</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Inous de junto:</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-sm font-black text-emerald-400 font-mono">
            R$ {freeEnergyVal.toLocaleString('pt-BR')}
          </span>
          <span className="text-slate-500 text-xs">▼</span>
        </div>
      </div>

      {/* Barra de Progresso do Rodapé */}
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 rounded-full w-[65%]" />
      </div>
    </div>
  );
};

export default EsolSimulator3in1;
