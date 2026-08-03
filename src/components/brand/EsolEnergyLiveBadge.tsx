import React, { useEffect, useState } from 'react';
import { Zap, Leaf, TrendingUp } from 'lucide-react';

export interface EsolEnergyLiveBadgeProps {
  variant?: 'generation' | 'co2' | 'savings';
  initialValue?: number;
  label?: string;
  unit?: string;
  color?: 'emerald' | 'gold' | 'cyan';
  className?: string;
}

/**
 * `<EsolEnergyLiveBadge />` — Micro-Indicador Energético com Telemetria Simulada ao Vivo (V13.2)
 */
export const EsolEnergyLiveBadge: React.FC<EsolEnergyLiveBadgeProps> = ({
  variant = 'generation',
  initialValue,
  label,
  unit,
  color,
  className = '',
}) => {
  // Valores padrão de fábrica por variante
  const config = {
    generation: {
      val: initialValue ?? 1428500,
      lbl: label ?? 'Geração Acumulada',
      un: unit ?? 'kWh',
      icon: Zap,
      themeColor: color ?? 'gold',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      dotColor: 'bg-amber-400',
    },
    co2: {
      val: initialValue ?? 982,
      lbl: label ?? 'CO₂ Evitado',
      un: unit ?? 'Ton',
      icon: Leaf,
      themeColor: color ?? 'emerald',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
    savings: {
      val: initialValue ?? 4950000,
      lbl: label ?? 'Economia Gerada',
      un: unit ?? 'R$',
      icon: TrendingUp,
      themeColor: color ?? 'cyan',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      dotColor: 'bg-cyan-400',
    },
  }[variant];

  const [counter, setCounter] = useState(config.val);
  const IconComponent = config.icon;

  // Efeito de micro-incremento em tempo real para dinamismo visual
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + (variant === 'co2' ? 0.05 : variant === 'savings' ? 12.5 : 2.5));
    }, 3500);

    return () => clearInterval(interval);
  }, [variant]);

  const formattedValue =
    variant === 'savings'
      ? `R$ ${counter.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : `${counter.toLocaleString('pt-BR', { minimumFractionDigits: variant === 'co2' ? 1 : 0, maximumFractionDigits: 1 })} ${config.un}`;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-300 ${config.badgeBg} ${className}`}
    >
      <span className="relative flex size-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`} />
        <span className={`relative inline-flex rounded-full size-2 ${config.dotColor}`} />
      </span>

      <IconComponent className="size-3.5" />

      <div className="flex items-center gap-1.5 text-xs font-medium">
        <span className="opacity-80">{config.lbl}:</span>
        <span className="font-mono font-bold tracking-tight">{formattedValue}</span>
      </div>
    </div>
  );
};

export default EsolEnergyLiveBadge;
