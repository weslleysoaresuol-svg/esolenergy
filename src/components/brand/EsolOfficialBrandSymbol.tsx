import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Autoral Ultra-Minimalista (esol energy) REFINADA.
 *
 * Refinamento Tipográfico Suíço de Precisão Cirúrgica:
 * A curva inferior da letra 's' flui no mesmo eixo óptico horizontal (baseline)
 * encontrando com perfeição matemática o início da letra 'o'.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const isDark = variant === 'dark' || variant === 'mono-white';

  // Paleta Ultra-Minimalista de Prestígio Internacional
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
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            .esol-text-main {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 72px;
              letter-spacing: -2.5px;
            }
            .esol-text-sub {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 700;
              font-size: 32px;
              letter-spacing: -0.5px;
            }
          `}</style>

          <linearGradient id="esolRefinedWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={greenVoltColor} />
            <stop offset="100%" stopColor={solarGoldColor} />
          </linearGradient>
        </defs>

        <g className="esol-all-lowercase-refined">
          <g transform="translate(6, 0)">
            {/* 'e' */}
            <text x="0" y="68" fill={greenVoltColor} className="esol-text-main">
              e
            </text>

            {/* 's' - Refinado: A perna inferior termina alinhada horizontalmente com a entrada da letra 'o' */}
            <g transform="translate(39, 17)">
              <path
                d="M 27 12 C 27 5 17 3 11 7 C 3 13 5 25 15 29 C 25 33 27 45 19 50 C 13 54 4 52 2 44"
                fill="none"
                stroke="url(#esolRefinedWaveGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 'o' */}
            <text x="74" y="68" fill={mainTextColor} className="esol-text-main">
              o
            </text>

            {/* 'l' */}
            <text x="118" y="68" fill={mainTextColor} className="esol-text-main">
              l
            </text>

            {/* Ponto Fotônico Solar em Harmonia com o 'l' */}
            <circle cx="140" cy="62" r="4.5" fill={solarGoldColor} />
          </g>

          {/* Palavra 'energy' Minúscula com Espaçamento de Alta Precisão */}
          <text x="156" y="100" fill={energyTextColor} className="esol-text-sub">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
