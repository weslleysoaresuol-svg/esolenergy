import React from 'react';

export interface EsolGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'emerald' | 'cyan';
  glowOnHover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * `<EsolGlassCard />` — Container Glassmorphism com Desfoque Profundo (V13.2)
 */
export const EsolGlassCard: React.FC<EsolGlassCardProps> = ({
  variant = 'default',
  glowOnHover = true,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const variantBorderMap = {
    default: 'border-slate-800/80 hover:border-amber-500/40',
    gold: 'border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)]',
  }[variant];

  return (
    <div
      className={`relative rounded-2xl bg-slate-950/80 backdrop-blur-2xl border transition-all duration-300 ${
        glowOnHover ? 'hover:-translate-y-1' : ''
      } ${paddingMap} ${variantBorderMap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default EsolGlassCard;
