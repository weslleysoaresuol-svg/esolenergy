import React from "react";
import { ShieldCheck, Leaf } from "lucide-react";

export interface SeloVerdeEsolProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  hashVerification?: string;
  className?: string;
}

/**
 * `<SeloVerdeEsol />` — Certificação Ecológica e Legal Exclusiva da ESOL Energy
 *
 * Emitido exclusivamente para projetos físicos instalados e homologados pela
 * engenharia da ESOL Energy, atestando conformidade com a Lei 14.300/2022.
 */
export const SeloVerdeEsol: React.FC<SeloVerdeEsolProps> = ({
  size = "md",
  hashVerification,
  className = "",
  ...props
}) => {
  const dimensions = {
    sm: { width: 120, height: 120, fontSize: "9px" },
    md: { width: 180, height: 180, fontSize: "11px" },
    lg: { width: 240, height: 240, fontSize: "14px" },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none group ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105"
        aria-label="Selo Verde ESOL Energy"
        role="img"
        {...props}
      >
        <defs>
          {/* Gold Ring Gradient */}
          <linearGradient id="gold-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Emerald Center Gradient */}
          <linearGradient id="emerald-center-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Text Path Arc */}
          <path
            id="text-path-top"
            d="M 25,100 A 75,75 0 1,1 175,100"
            fill="none"
          />
          <path
            id="text-path-bottom"
            d="M 175,100 A 75,75 0 0,1 25,100"
            fill="none"
          />

          {/* Glow Filter */}
          <filter id="selo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Gold Ring Background */}
        <circle cx="100" cy="100" r="94" fill="url(#gold-ring-grad)" filter="url(#selo-glow)" />

        {/* Inner Dark Gap Ring */}
        <circle cx="100" cy="100" r="84" fill="#020617" />

        {/* Inner Emerald Center */}
        <circle cx="100" cy="100" r="68" fill="url(#emerald-center-grad)" />

        {/* Arc Text Top */}
        <text fill="#FDE68A" fontSize="10" fontWeight="800" fontFamily="Sora, Inter, sans-serif" letterSpacing="2">
          <textPath href="#text-path-top" startOffset="50%" textAnchor="middle">
            ★ SELO VERDE ESOL ★
          </textPath>
        </text>

        {/* Arc Text Bottom */}
        <text fill="#F8FAFC" fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="1.5">
          <textPath href="#text-path-bottom" startOffset="50%" textAnchor="middle">
            LEI 14.300/2022 • ENERGIA LIMPA
          </textPath>
        </text>

        {/* Central Iconography (Leaf + Sun Rays) */}
        <g transform="translate(100, 100) scale(1.2)" textAnchor="middle">
          {/* Sun Rays */}
          <circle cx="0" cy="-4" r="18" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.6" />

          {/* Center Shield & Leaf SVG */}
          <g transform="translate(-16, -20)">
            <path
              d="M16 3L4 8v7c0 7.5 5 14.5 12 17 7-2.5 12-9.5 12-17V8l-12-5z"
              fill="#020617"
              stroke="#FDE68A"
              strokeWidth="2"
            />
            <path
              d="M16 10c-3.3 0-6 2.7-6 6 0 4.4 6 10 6 10s6-5.6 6-10c0-3.3-2.7-6-6-6z"
              fill="#34D399"
            />
          </g>
        </g>
      </svg>

      {/* Verification Hash Badge */}
      {hashVerification && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="size-3" />
            HASH: {hashVerification.slice(0, 12)}...
          </span>
        </div>
      )}
    </div>
  );
};

export default SeloVerdeEsol;
