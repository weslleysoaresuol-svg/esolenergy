import React from 'react';
import {
  Sun,
  Cpu,
  Zap,
  BatteryCharging,
  Layers,
  ShieldAlert,
  Car,
  Wifi,
  Activity,
  ZapOff,
  Wrench,
} from 'lucide-react';

export type CategorySlug =
  | 'modulos-fotovoltaicos'
  | 'inversores-string'
  | 'microinversores'
  | 'baterias-storage'
  | 'estruturas-fixacao'
  | 'string-box-protecao'
  | 'carregadores-ev'
  | 'iot-telemetria'
  | 'medidores-bidirecionais'
  | 'transformadores'
  | 'manutencao-om';

export interface EsolCategoryIconProps {
  category: CategorySlug;
  size?: number;
  className?: string;
}

/**
 * `<EsolCategoryIcon />` — Iconografia Vetorial das 11 Categorias da ESOL (V13.2)
 */
export const EsolCategoryIcon: React.FC<EsolCategoryIconProps> = ({
  category,
  size = 24,
  className = '',
}) => {
  const iconMap: Record<CategorySlug, { icon: React.ElementType; color: string; label: string }> = {
    'modulos-fotovoltaicos': { icon: Sun, color: 'text-amber-400', label: 'Módulos N-Type TOPCon' },
    'inversores-string': { icon: Cpu, color: 'text-cyan-400', label: 'Inversores String' },
    'microinversores': { icon: Zap, color: 'text-emerald-400', label: 'Microinversores MLPE' },
    'baterias-storage': { icon: BatteryCharging, color: 'text-amber-500', label: 'Baterias de Lítio (BESS)' },
    'estruturas-fixacao': { icon: Layers, color: 'text-slate-300', label: 'Estruturas de Fixação' },
    'string-box-protecao': { icon: ShieldAlert, color: 'text-rose-400', label: 'Proteção CC/CA String Box' },
    'carregadores-ev': { icon: Car, color: 'text-cyan-300', label: 'Carregadores Veículos Elétricos' },
    'iot-telemetria': { icon: Wifi, color: 'text-emerald-300', label: 'IoT & Telemetria 5G' },
    'medidores-bidirecionais': { icon: Activity, color: 'text-blue-400', label: 'Medição Bidirecional' },
    'transformadores': { icon: ZapOff, color: 'text-violet-400', label: 'Transformadores & Média Tensão' },
    'manutencao-om': { icon: Wrench, color: 'text-orange-400', label: 'Limpeza & Serviços O&M' },
  };

  const current = iconMap[category] || iconMap['modulos-fotovoltaicos'];
  const IconComp = current.icon;

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 ${current.color} ${className}`} title={current.label}>
      <IconComp size={size} strokeWidth={2} />
    </div>
  );
};

export default EsolCategoryIcon;
