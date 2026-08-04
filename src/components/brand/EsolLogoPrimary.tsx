import React from 'react';

export interface EsolLogoPrimaryProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal da Esol Energy (V13.2)
 *
 * Conceito Homologado: Opção 3 ("eSOL energy") Dual-Tone Eco-Tech.
 * - `e`: Eco Green (#10B981) — Transição Energética & Sustentabilidade ESG.
 * - `SOL`: Corporate Navy (#0A2540 no light mode, #F8FAFC no dark mode).
 * - `energy`: Solar Amber (#F59E0B) — Geração Fotovoltaica & Retorno Financeiro.
 * - Tagline: "Deixe o sol trabalhar por você" (opcional).
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 240,
  height,
  variant = 'auto',
  showTagline = false,
  className = '',
  ...props
}) => {
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber
  const greyColor = '#94A3B8';  // Subtext Slate-400

  const getSolColor = () => {
    if (variant === 'light') return '#0A2540';
    return '#F8FAFC'; // Sempre branco reluzente em fundos escuros
  };

  const computedHeight = height || (showTagline ? 65 : 44);
  const viewBox = showTagline ? "0 0 310 75" : "0 0 290 50";

  return (
    <svg
      width={width}
      height={computedHeight}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors duration-300 ${className}`}
      aria-label="Esol Energy Logo"
      role="img"
      {...props}
    >
      <g transform="translate(5, 5)">
        {/* Letra 'e' (Eco Green #10B981) */}
        <text
          x="0"
          y="38"
          fill={greenColor}
          fontFamily="Sora, Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="40"
          letterSpacing="-1"
        >
          e
        </text>

        {/* Palavra 'SOL' (Branco Reluzente #F8FAFC) */}
        <text
          x="26"
          y="38"
          fill={getSolColor()}
          fontFamily="Sora, Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="40"
          letterSpacing="-0.5"
        >
          SOL
        </text>

        {/* Palavra 'energy' (Solar Amber #F59E0B) */}
        <text
          x="118"
          y="38"
          fill={amberColor}
          fontFamily="Sora, Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="40"
          letterSpacing="0"
        >
          energy
        </text>

        {/* Tagline Comercial Oficial (Opcional) */}
        {showTagline && (
          <text
            x="2"
            y="58"
            fill={greyColor}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
            fontSize="12"
            letterSpacing="0.2"
            opacity="0.9"
          >
            Deixe o sol trabalhar por você
          </text>
        )}
      </g>
    </svg>
  );
};

export default EsolLogoPrimary;
