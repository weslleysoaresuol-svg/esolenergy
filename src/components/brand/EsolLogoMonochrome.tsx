import React from 'react';

export interface EsolLogoMonochromeProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  inverted?: boolean;
  showTagline?: boolean;
  className?: string;
}

/**
 * `<EsolLogoMonochrome />` — Assinatura Monocromática Pura P&B da Esol Energy (V13.2)
 *
 * Utilizada para documentos fiscais (eNotas, DRE, relatórios contábeis),
 * carimbos corporativos, impressões P&B e gravações a laser em brindes/módulos.
 */
export const EsolLogoMonochrome: React.FC<EsolLogoMonochromeProps> = ({
  width = 280,
  height = 70,
  inverted = false,
  showTagline = true,
  className = '',
  ...props
}) => {
  const mainColor = inverted ? '#FFFFFF' : '#000000';
  const subtextColor = inverted ? '#E2E8F0' : '#475569';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors duration-200 ${className}`}
      aria-label="Esol Energy Logo Monocromática"
      role="img"
      {...props}
    >
      <g transform="translate(10, 10)">
        {/* Letra 'e' Monocromática */}
        <text
          x="0"
          y="42"
          fill={mainColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="-1"
        >
          e
        </text>

        {/* Palavra 'SOL' Monocromática */}
        <text
          x="28"
          y="42"
          fill={mainColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="-0.5"
        >
          SOL
        </text>

        {/* Palavra 'energy' Monocromática */}
        <text
          x="128"
          y="42"
          fill={mainColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="44"
          letterSpacing="0"
        >
          energy
        </text>

        {/* Tagline Monocromática */}
        {showTagline && (
          <text
            x="2"
            y="62"
            fill={subtextColor}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
            fontSize="12.5"
            letterSpacing="0.2"
          >
            Deixe o sol trabalhar por você
          </text>
        )}
      </g>
    </svg>
  );
};

export default EsolLogoMonochrome;
