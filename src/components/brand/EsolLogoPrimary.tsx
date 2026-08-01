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
 * - `SOL`: Corporate Navy (#0A2540 no light mode, #F8FAFC no dark mode) — Solidez Institucional.
 * - `energy`: Solar Amber (#F59E0B) — Geração Fotovoltaica & Retorno Financeiro.
 * - Tagline: "Deixe o sol trabalhar por você" (opcional).
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 280,
  height = 70,
  variant = 'auto',
  showTagline = true,
  className = '',
  ...props
}) => {
  // Cores da paleta homologada V13.2
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber
  const greyColor = '#94A3B8';  // Subtext Slate-400

  // Tratamento de variante light / dark / auto (via CSS dark class ou prop)
  const getSolColor = () => {
    if (variant === 'dark') return '#F8FAFC';
    if (variant === 'light') return '#0A2540';
    return 'currentColor'; // no auto, adapta ao text-color do pai (com fallbacks)
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors duration-300 ${className}`}
      aria-label="Esol Energy Logo"
      role="img"
      {...props}
    >
      {/* Grupo da Wordmark "eSOL energy" */}
      <g transform="translate(10, 10)">
        {/* Letra 'e' (Eco Green #10B981) */}
        <text
          x="0"
          y="42"
          fill={greenColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="-1"
        >
          e
        </text>

        {/* Palavra 'SOL' (Corporate Navy #0A2540 / Dark White #F8FAFC) */}
        <text
          x="28"
          y="42"
          fill={getSolColor()}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="44"
          className="dark:fill-slate-50 fill-slate-900"
          letterSpacing="-0.5"
        >
          SOL
        </text>

        {/* Palavra 'energy' (Solar Amber #F59E0B) */}
        <text
          x="128"
          y="42"
          fill={amberColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="44"
          letterSpacing="0"
        >
          energy
        </text>

        {/* Tagline Comercial Oficial (Opcional) */}
        {showTagline && (
          <text
            x="2"
            y="62"
            fill={greyColor}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
            fontSize="12.5"
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
