import React from 'react';

export interface EsolLogoStackedProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  className?: string;
}

/**
 * `<EsolLogoStacked />` — Assinatura Empilhada Vertical da Esol Energy (V13.2)
 *
 * Formato quadrado (ViewBox 0 0 160 160) otimizado para modais, cartões,
 * selos de certificação e avatares de rede.
 */
export const EsolLogoStacked: React.FC<EsolLogoStackedProps> = ({
  width = 160,
  height = 160,
  variant = 'auto',
  showTagline = true,
  className = '',
  ...props
}) => {
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber
  const greyColor = '#94A3B8';  // Subtext Slate-400

  const getSolColor = () => {
    if (variant === 'dark') return '#F8FAFC';
    if (variant === 'light') return '#0A2540';
    return 'currentColor';
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors duration-300 ${className}`}
      aria-label="Esol Energy Logo Empilhada"
      role="img"
      {...props}
    >
      <g transform="translate(10, 15)">
        {/* Bloco Superior: "eSOL" Centralizado */}
        <g transform="translate(12, 40)">
          {/* 'e' Eco Green */}
          <text
            x="0"
            y="0"
            fill={greenColor}
            fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="42"
            letterSpacing="-1"
          >
            e
          </text>
          {/* 'SOL' Navy / White */}
          <text
            x="26"
            y="0"
            fill={getSolColor()}
            fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="42"
            className="dark:fill-slate-50 fill-slate-900"
            letterSpacing="-0.5"
          >
            SOL
          </text>
        </g>

        {/* Bloco Intermediário: "energy" Centralizado */}
        <text
          x="70"
          y="78"
          textAnchor="middle"
          fill={amberColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="30"
          letterSpacing="1"
        >
          energy
        </text>

        {/* Linha Divisória de Precisão */}
        <line
          x1="25"
          y1="92"
          x2="115"
          y2="92"
          stroke={amberColor}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Bloco Inferior: Tagline em 2 linhas (Opcional) */}
        {showTagline && (
          <g transform="translate(70, 112)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={greyColor}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
              fontSize="10"
              letterSpacing="0.2"
              opacity="0.9"
            >
              Deixe o sol trabalhar
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill={greyColor}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
              fontSize="10"
              letterSpacing="0.2"
              opacity="0.9"
            >
              por você
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

export default EsolLogoStacked;
