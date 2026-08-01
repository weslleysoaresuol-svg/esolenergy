import React from 'react';

export interface EsolFaviconMicroProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  fillBg?: boolean;
  badgeShape?: 'circle' | 'square';
  className?: string;
}

/**
 * `<EsolFaviconMicro />` — Favicon Micro-SVG Nativo 32x32 da Esol Energy (V13.2)
 *
 * Desenhado especificamente para abas de navegadores (16px/32px) e marcadores móveis.
 * Entrega máxima nitidez com o monograma 'eS' (Eco Green + Solar Amber).
 */
export const EsolFaviconMicro: React.FC<EsolFaviconMicroProps> = ({
  size = 32,
  fillBg = true,
  badgeShape = 'circle',
  className = '',
  ...props
}) => {
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber
  const bgSlate = '#020617';    // Slate-950

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Favicon Esol Energy"
      role="img"
      {...props}
    >
      {/* Background Badge (16px / 32px) */}
      {fillBg && (
        badgeShape === 'circle' ? (
          <circle cx="16" cy="16" r="15" fill={bgSlate} stroke="#1E293B" strokeWidth="1" />
        ) : (
          <rect x="1" y="1" width="30" height="30" rx="7" fill={bgSlate} stroke="#1E293B" strokeWidth="1" />
        )
      )}

      {/* Monograma 'eS' Micro-Vetorial de Alta Nitidez */}
      <g transform="translate(5, 5)">
        {/* Letra 'e' Eco Green */}
        <text
          x="0"
          y="17.5"
          fill={greenColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="-0.5"
        >
          e
        </text>

        {/* Letra 'S' Solar Amber */}
        <text
          x="10.5"
          y="17.5"
          fill={amberColor}
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="-0.5"
        >
          S
        </text>
      </g>
    </svg>
  );
};

export default EsolFaviconMicro;
