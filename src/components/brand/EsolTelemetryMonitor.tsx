import React from 'react';
import { Wifi, Cpu, Activity, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export interface EsolTelemetryMonitorProps {
  inverterModel?: string;
  kwpCapacidade?: number;
  geracaoHojeKwh?: number;
  statusConexao?: 'online' | 'warning' | 'offline';
  className?: string;
}

/**
 * `<EsolTelemetryMonitor />` — Cockpit de Telemetria SaaS & Inversores Solares (V13.2)
 */
export const EsolTelemetryMonitor: React.FC<EsolTelemetryMonitorProps> = ({
  inverterModel = 'Inversor Deye 75kW Hybrid N-Type',
  kwpCapacidade = 75.0,
  geracaoHojeKwh = 385.4,
  statusConexao = 'online',
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">{inverterModel}</h4>
            <span className="text-[10px] text-slate-400 font-mono">IoT Modem 5G • Telemetria SaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
          {statusConexao.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Potência kWp</span>
          <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{kwpCapacidade} kWp</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Geração Hoje</span>
          <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{geracaoHojeKwh} kWh</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Eficiência PR</span>
          <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">98.2%</span>
        </div>
      </div>
    </div>
  );
};

export default EsolTelemetryMonitor;
