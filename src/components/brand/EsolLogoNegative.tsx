import React from 'react';

export interface EsolLogoNegativeProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  glow?: boolean;
  showTagline?: boolean;
  className?: string;
}

/**
 * `<EsolLogoNegative />` — Assinatura Dark Mode Absoluto da Esol Energy (V13.2)
 *
 * Otimizada para fundos escuros (#020617, #0F172A), Painel Administrativo Noturno,
 * Modais com backdrop escuro e Hero sections com iluminação HSL Glow.
 */
export const EsolLogoNegative: React.FC<EsolLogoNegativeProps> = ({
  width = 280,
  height = 70,
  glow = true,
  showTagline = true,
  className = '',
  ...props
}) => {
  const emeraldGlowColor = '#34D399'; // Emerald-400 com alta luminância
  const whiteColor = '#F8FAFC';        // Slate-50 Pura
  const amberGlowColor = '#FBBF24';   // Amber-400 com alta luminância
  const lightGreyColor = '#CBD5E1';   // Slate-300

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 ${className}`}
      aria-label="Esol Energy Logo Dark Mode"
      role="img"
      {...props}
    >
      {/* Filtro HSL Glow para iluminação de fótons em fundos escuros */}
      <defs>
        {glow && (
          <filter id="esol-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      <g transform="translate(10, 10)">
        {/* Letra 'e' Emerald Glow (#34D399) */}
        <text
          x="0"
          y="42"
          fill={emeraldGlowColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="-1"
          filter={glow ? 'url(#esol-glow-filter)' : undefined}
        >
          e
        </text>

        {/* Palavra 'SOL' Branco Puro (#F8FAFC) */}
        <text
          x="28"
          y="42"
          fill={whiteColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="-0.5"
        >
          SOL
        </text>

        {/* Palavra 'energy' Amber Glow (#FBBF24) */}
        <text
          x="128"
          y="42"
          fill={amberGlowColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="44"
          letterSpacing="0"
          filter={glow ? 'url(#esol-glow-filter)' : undefined}
        >
          energy
        </text>

        {/* Tagline para Dark Mode */}
        {showTagline && (
          <text
            x="2"
            y="62"
            fill={lightGreyColor}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
            fontSize="12.5"
            letterSpacing="0.2"
            opacity="0.85"
          >
            Deixe o sol trabalhar por você
          </text>
        )}
      </g>
    </svg>
  );
};

export default EsolLogoNegative;
