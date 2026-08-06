import React from "react";
import { ShieldCheck } from "lucide-react";

export interface SeloVerdeEsolProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  hashVerification?: string;
  className?: string;
}

/**
 * `<SeloVerdeEsol />` — Selo Oficial de Garantia & Certificação da esol energy.
 *
 * Baseado no monograma mestre "so." e atestando 100% Energia Limpa Homologada ANEEL.
 */
export const SeloVerdeEsol: React.FC<SeloVerdeEsolProps> = ({
  size = "md",
  hashVerification,
  className = "",
  ...props
}) => {
  const dimensions = {
    sm: { width: 44, height: 44 },
    md: { width: 64, height: 64 },
    lg: { width: 88, height: 88 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Selo Oficial esol energy."
        role="img"
        {...props}
      >
        <defs>
          <linearGradient id="selo-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="selo-gold-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Circulo Externo em Ouro Solar */}
        <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="url(#selo-gold-border)" strokeWidth="2.5" />
        
        {/* Anel Interno em Verde Esmeralda */}
        <circle cx="50" cy="50" r="41" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Monograma "so" mestre no centro */}
        <g transform="translate(18, 28)">
          <path
            d="M20 28C14.4772 28 10 23.5228 10 18C10 12.4772 14.4772 8 20 8C25.5228 8 30 12.4772 30 18V28M30 28C30 33.5228 34.4772 38 40 38C45.5228 38 50 33.5228 50 28C50 22.4772 45.5228 18 40 18C34.4772 18 30 22.4772 30 28ZM30 28V8"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ponto Verde Volt */}
          <circle cx="58" cy="35" r="4" fill="#10B981" />
        </g>
      </svg>

      {hashVerification && (
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          {hashVerification.slice(0, 8)}
        </span>
      )}
    </div>
  );
};

export default SeloVerdeEsol;
