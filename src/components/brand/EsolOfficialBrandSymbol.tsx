import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Autoral Ultra-Minimalista 100% SVG Nativo em React (esol energy.).
 *
 * Renderiza o código vetorial em SVG nativo nativo puro gerado no projeto com o laço 's' em curva infinita,
 * a palavra 'energy' alinhada e o ponto verde esmeralda no final (esol energy.).
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 240,
  height,
  variant = 'auto',
  className = '',
}) => {
  const isDark = variant === 'dark' || variant === 'mono-white';

  const mainTextColor   = isDark ? '#FFFFFF' : '#0F172A';
  const greenDotColor   = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#10B981');
  const energyTextColor = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 380 90"
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
            .brand-esol-text {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 64px;
              letter-spacing: -2px;
            }
            .brand-energy-text {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 700;
              font-size: 64px;
              letter-spacing: -2px;
            }
          `}</style>
        </defs>

        <g transform="translate(4, 2)">
          {/* 'esol' com o laço da letra 's' */}
          <g transform="translate(0, 0)">
            {/* 'e' */}
            <text x="0" y="60" fill={mainTextColor} className="brand-esol-text">e</text>

            {/* 's' - O laço monoline fotônico fluindo para o 'o' */}
            <g transform="translate(36, 12)">
              <path
                d="M 28 14 C 28 6 18 4 12 8 C 4 14 6 26 16 30 C 26 34 28 46 20 52 C 12 56 4 50 4 42"
                fill="none"
                stroke={mainTextColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 'o' */}
            <text x="74" y="60" fill={mainTextColor} className="brand-esol-text">o</text>

            {/* 'l' */}
            <text x="114" y="60" fill={mainTextColor} className="brand-esol-text">l</text>
          </g>

          {/* ' energy' */}
          <text x="146" y="60" fill={energyTextColor} className="brand-energy-text"> energy</text>

          {/* Ponto Verde Esmeralda Final '.' */}
          <circle cx="362" cy="56" r="6" fill={greenDotColor} />
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
