import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  showIcon?: boolean;
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Visual Oficial eSOL energy (EnergyTech Internacional 2026).
 *
 * Design autoral de prestígio internacional criado com vetores geométricos puros (SVG).
 * Combina o Ícone "Quantum Solar Nucleus" (Núcleo Fotônico de Alta Voltagem) com a Tipografia
 * "eSOL energy" de precisão suíça, garantindo nitidez absoluta em 4K/Retina e presença de marca global.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 240,
  height,
  variant = 'auto',
  showIcon = true,
  className = '',
}) => {
  const isDarkVariant = variant === 'dark' || variant === 'mono-white';

  // Palette EnergyTech de Prestígio Internacional
  const emeraldGreen = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#10B981');
  const solarGold    = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#F59E0B');
  const electricCyan = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#06B6D4');
  const energyTextColor = isDarkVariant ? '#FFFFFF' : '#0F172A';

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 380 120"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto drop-shadow-md"
      >
        <defs>
          {/* Import de Tipografias Globais Modernas */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            .brand-text-e {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 78px;
            }
            .brand-text-sol {
              font-family: 'Outfit', system-ui, sans-serif;
              font-weight: 900;
              font-size: 78px;
              letter-spacing: -2px;
            }
            .brand-text-energy {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 34px;
              letter-spacing: -0.5px;
            }
          `}</style>

          {/* Gradientes de Alta Voltagem Solar */}
          <linearGradient id="quantumSolarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="emeraldVoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="solarAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <filter id="solarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="esol-international-master-brand">
          {/* ÍCONE NÚCLEO QUANTUM SOLAR (Opcional ou Primário) */}
          {showIcon && (
            <g transform="translate(6, 12)" filter="url(#solarGlow)">
              {/* Anel Externo Fotônico */}
              <circle cx="46" cy="48" r="40" fill="none" stroke="url(#quantumSolarGrad)" strokeWidth="6" strokeDasharray="18 6" opacity="0.9" />
              
              {/* Núcleo Interno de Alta Eficiência Solar */}
              <path d="M 46 16 L 56 36 L 76 48 L 56 60 L 46 80 L 36 60 L 16 48 L 36 36 Z" fill="url(#solarAmberGrad)" />
              
              {/* Raio de Energia Vigorosa */}
              <path d="M 49 22 L 35 52 L 47 52 L 43 74 L 59 44 L 47 44 Z" fill="#FFFFFF" />
            </g>
          )}

          {/* WORDMARK DE ALTA FIDELIDADE INTERNACIONAL */}
          <g transform={`translate(${showIcon ? 112 : 12}, 0)`}>
            {/* 'e' - Emerald Volt */}
            <text x="0" y="74" fill={emeraldGreen} class="brand-text-e">
              e
            </text>

            {/* 'SOL' - Solar Amber Gold */}
            <text x="52" y="74" fill={solarGold} class="brand-text-sol">
              SOL
            </text>

            {/* 'energy' - Pristine White / Dark Slate */}
            <text x="110" y="108" fill={energyTextColor} class="brand-text-energy">
              energy
            </text>

            {/* Ponto Conector Inteligente EnergyTech */}
            <circle cx="218" cy="98" r="5" fill={electricCyan} />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
