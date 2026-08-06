import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Autoral Ultra-Minimalista (esol energy) HARMONIZADA.
 *
 * Resolução Matemática Definitiva:
 * Todas as letras da palavra 'esol' foram desenhadas como caminhos vetoriais Bezier puros (<path d="..." />)
 * em um sistema de coordenadas unificado. A saída da letra 's' se funde continuamente e sem interrupções
 * com a entrada da letra 'o' em uma curva óptica perfeita.
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
        viewBox="0 0 340 100"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
            .esol-text-sub {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 700;
              font-size: 30px;
              letter-spacing: -0.5px;
            }
          `}</style>

          <linearGradient id="esolUnifiedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={greenVoltColor} />
            <stop offset="100%" stopColor={solarGoldColor} />
          </linearGradient>
        </defs>

        <g className="esol-unified-vector-wordmark" transform="translate(4, 4)">
          {/* WORDMARK 'esol' EM VETORES PUROS UNIFICADOS */}
          <g transform="translate(0, 0)">
            {/* Letra 'e' - Vetor Esmeralda */}
            <path
              d="M 32 36 C 32 20 20 14 10 24 C 0 34 2 54 18 56 C 28 57 33 50 34 44 L 10 44 C 10 34 22 24 32 36 Z"
              fill={greenVoltColor}
            />

            {/* Letra 's' - Vetor Fotônico cuja perna inferior flui perfeitamente para o 'o' */}
            <path
              d="M 64 22 C 64 16 54 14 48 18 C 40 24 42 36 52 40 C 62 44 64 56 56 60 C 48 64 38 60 36 52 M 56 60 C 62 61 68 60 74 57"
              fill="none"
              stroke="url(#esolUnifiedGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letra 'o' - Vetor Círculo Fotônico perfeitamente conectado com a linha do 's' */}
            <path
              d="M 94 20 C 82 20 74 30 74 42 C 74 54 82 64 94 64 C 106 64 114 54 114 42 C 114 30 106 20 94 20 Z M 94 30 C 100 30 104 35 104 42 C 104 49 100 54 94 54 C 88 54 84 49 84 42 C 84 35 88 30 94 30 Z"
              fill={mainTextColor}
            />

            {/* Letra 'l' - Haste Vetorial de Precisão */}
            <path
              d="M 124 12 C 124 9 127 6 130 6 L 130 6 C 133 6 136 9 136 12 L 136 60 C 136 63 133 66 130 66 L 130 66 C 127 66 124 63 124 60 Z"
              fill={mainTextColor}
            />

            {/* Ponto Fotônico Solar em Harmonia */}
            <circle cx="146" cy="60" r="4.5" fill={solarGoldColor} />
          </g>

          {/* Palavra 'energy' Minúscula com Alinhamento Perfeito */}
          <text x="156" y="92" fill={energyTextColor} className="esol-text-sub">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
