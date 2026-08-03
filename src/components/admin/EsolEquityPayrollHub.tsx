import React, { useState } from 'react';
import { PieChart, DollarSign, Users, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';

/**
 * `<EsolEquityPayrollHub />` — Central de Governança de Cap Table, Dividendos Isentos & Folha (V13.2)
 */
export const EsolEquityPayrollHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'captable' | 'payroll' | 'tax'>('captable');

  const capTable = [
    { shareholder: 'Holding Founders Brasil', shares: '60.0%', type: 'Ações Ordinárias (ON)', dividends: 'Isento Lei 9.249/95' },
    { shareholder: 'Esol Energy Global LLC (DE)', shares: '25.0%', type: 'Holding Internacional', dividends: 'Pass-through DE' },
    { shareholder: 'Pool de Incentive Equity (SOP)', shares: '10.0%', type: 'Option Pool (Vesting)', dividends: 'Bônus de Performance' },
    { shareholder: 'Investidores Anjo / Seed', shares: '5.0%', type: 'Preferenciais (PN)', dividends: 'Preferencial Fixo' },
  ];

  const payrollRegimes = [
    { regime: 'CLT (Regime Geral)', count: '14 Colaboradores', taxImpact: 'INSS / FGTS / IRRF', status: 'Ativo' },
    { regime: 'PJ (Simples Nacional)', count: '48 Consultores PJ', taxImpact: 'Anexo III (6%)', status: 'Ativo' },
    { regime: 'Lucro Presumido / Real', count: '12 Parceiros EPC', taxImpact: 'ISS + PIS/COFINS', status: 'Ativo' },
    { regime: 'Pró-Labore Executivo', count: '4 Diretores', taxImpact: 'Teto INSS + IRRF', status: 'Ativo' },
    { regime: 'Overrides MMN (7 Níveis)', count: '1.240 Ativos', taxImpact: 'Retenção Automática', status: 'Ativo' },
    { regime: 'RPA Autônomo PF', count: '18 Vendedores', taxImpact: 'INSS 11% + IRRF', status: 'Ativo' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-6 max-w-7xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="size-5 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">Esol Equity & Corporate Payroll Hub</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Lei 9.249/95 Homologada
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Governança de acionistas, distribuição de dividendos isentos e otimização fiscal da folha em 6 regimes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('captable')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'captable' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cap Table
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'payroll' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Folha (6 Regimes)
          </button>
        </div>
      </div>

      {/* Tab Content 1: Cap Table */}
      {activeTab === 'captable' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Capital Social Total</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">R$ 5.000.000,00</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Dividendos Isentos Distribuídos</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">R$ 1.280.450,00</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Entidade Holding Delaware</span>
              <p className="text-lg font-bold text-cyan-400 font-mono mt-1">25.0% LLC</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Reserva de Option Pool</span>
              <p className="text-lg font-bold text-slate-200 font-mono mt-1">10.0% Vesting</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Acionista / Entidade</th>
                  <th className="p-3">Participação (%)</th>
                  <th className="p-3">Classe de Ações</th>
                  <th className="p-3">Tratamento Tributário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {capTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">{row.shareholder}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{row.shares}</td>
                    <td className="p-3 text-slate-300">{row.type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {row.dividends}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Payroll */}
      {activeTab === 'payroll' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payrollRegimes.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">{item.regime}</h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">{item.count}</p>
              <span className="block text-[10px] text-slate-500 font-mono">Impacto: {item.taxImpact}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EsolEquityPayrollHub;
