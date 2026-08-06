import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Autoral Ultra-Minimalista em Minúsculas (esol energy).
 *
 * Inspirada no minimalismo extremo de marcas globais (Apple, Polestar, Stripe, Vizio).
 * Utiliza 100% minúsculas em tipografia sans-serif de alta precisão com a letra 's'
 * desenhada como um laço de onda fotônica limpa que serve como Favicon nativo.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const isDark = variant === 'dark' || variant === 'mono-white';

  // Paleta Ultra-Minimalista Internacional
  const mainTextColor   = isDark ? '#FFFFFF' : '#0F172A';
  const greenVoltColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#10B981');
  const solarGoldColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#F59E0B');
  const energyTextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 340 110"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Outfit:wght@700;800;900&display=swap');
            .esol-text-main {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 72px;
              letter-spacing: -2px;
            }
            .esol-text-sub {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 700;
              font-size: 32px;
              letter-spacing: -0.5px;
            }
          `}</style>

          <linearGradient id="esolWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={greenVoltColor} />
            <stop offset="100%" stopColor={solarGoldColor} />
          </linearGradient>
        </defs>

        <g className="esol-all-lowercase-brand">
          {/* Palavra 'esol' 100% Minúscula */}
          <g transform="translate(6, 0)">
            {/* 'e' */}
            <text x="0" y="68" fill={greenVoltColor} className="esol-text-main">
              e
            </text>

            {/* 's' - A Letra Ícone Favicon em Onda Fotônica Continuada */}
            <g transform="translate(42, 14)">
              <path
                d="M 28 14 C 28 6 18 4 12 8 C 4 14 6 26 16 30 C 26 34 28 46 20 52 C 12 56 4 50 4 42"
                fill="none"
                stroke="url(#esolWaveGrad)"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 'o' */}
            <text x="82" y="68" fill={mainTextColor} className="esol-text-main">
              o
            </text>

            {/* 'l' */}
            <text x="126" y="68" fill={mainTextColor} className="esol-text-main">
              l
            </text>

            {/* Ponto Fotônico Minimalista */}
            <circle cx="148" cy="62" r="4.5" fill={solarGoldColor} />
          </g>

          {/* Palavra 'energy' Minúscula com Espaçamento Fino */}
          <text x="162" y="100" fill={energyTextColor} className="esol-text-sub">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
