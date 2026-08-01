import React from 'react';

export interface EsolBrandmarkGliphProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'badge' | 'transparent';
  badgeColor?: 'slate' | 'amber' | 'green';
  className?: string;
}

/**
 * `<EsolBrandmarkGliph />` — Glifo / Monograma Isolado da Marca Esol Energy (V13.2)
 *
 * Monograma 'eS' isolado (ViewBox 0 0 64 64) no Padrão iGreen Energy / Claro.
 * Usado em Favicons de navegadores, Ícones de aplicativo PWA, Avatares de rede,
 * Spinners de carregamento e selos de autenticidade.
 */
export const EsolBrandmarkGliph: React.FC<EsolBrandmarkGliphProps> = ({
  size = 64,
  variant = 'badge',
  badgeColor = 'slate',
  className = '',
  ...props
}) => {
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber

  const getBadgeFill = () => {
    if (variant === 'transparent') return 'none';
    if (badgeColor === 'amber') return amberColor;
    if (badgeColor === 'green') return greenColor;
    return '#020617'; // Slate-950 Dark Badge
  };

  const getEColor = () => {
    if (badgeColor === 'green') return '#F8FAFC';
    return greenColor;
  };

  const getSColor = () => {
    if (badgeColor === 'amber') return '#F8FAFC';
    return amberColor;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Glifo Esol Energy"
      role="img"
      {...props}
    >
      {/* Badge Circular de Fundo (Se variant === 'badge') */}
      {variant === 'badge' && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={getBadgeFill()}
          stroke={badgeColor === 'slate' ? '#1E293B' : 'none'}
          strokeWidth="2"
        />
      )}

      {/* Monograma 'eS' Centralizado */}
      <g transform="translate(10, 11)">
        {/* Letra 'e' Eco Green */}
        <text
          x="0"
          y="35"
          fill={getEColor()}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="36"
          letterSpacing="-1"
        >
          e
        </text>

        {/* Letra 'S' Solar Amber */}
        <text
          x="20"
          y="35"
          fill={getSColor()}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="36"
          letterSpacing="-0.5"
        >
          S
        </text>
      </g>
    </svg>
  );
};

export default EsolBrandmarkGliph;
