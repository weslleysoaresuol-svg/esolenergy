import React from 'react';

export interface EsolOfficialBrandSymbolProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Símbolo de Marca Oficial eSOL Energy
 *
 * Vetorização 100% fiel com curvas geométricas suaves e arredondadas:
 * - `e`: Verde Esmeralda Vívido (#22C55E / #10B981) em formato circular suave.
 * - `SOL`: Dourado Solar Âmbar (#F59E0B / #FBBF24) em tipo geométrico encorpado.
 * - `energy`: Azul Navy Escuro (#1E293B) no modo claro e Branco Puríssimo (#FFFFFF) no modo escuro.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 240,
  height,
  variant = 'auto',
  className = '',
  ...props
}) => {
  const greenColor = '#22C55E'; // Verde Esmeralda Vívido
  const yellowColor = '#F59E0B'; // Amarelo Dourado Solar

  const getEnergyColor = () => {
    if (variant === 'light') return '#1E293B'; // Dark Navy
    return '#FFFFFF'; // Branco Puríssimo em fundos escuros
  };

  const computedHeight = height || 80;

  return (
    <svg
      width={width}
      height={computedHeight}
      viewBox="0 0 380 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="eSOL energy Logo Oficial"
      role="img"
      {...props}
    >
      <g transform="translate(10, 15)">
        {/* === LETRA 'e' (Verde Esmeralda Arredondado #22C55E) === */}
        <g fill={greenColor}>
          {/* Círculo suave do 'e' com barra transversal interna */}
          <path d="M42 56 C42 32, 24 16, 0 16 C-24 16, -42 32, -42 56 C-42 80, -24 96, 0 96 C18 96, 32 86, 38 72 L18 72 C15 78, 9 81, 0 81 C-14 81, -24 73, -26 60 L41 60 C42 58.5, 42 57, 42 56 Z M-26 47 C-23 37, -13 30, 0 30 C13 30, 22 37, 25 47 L-26 47 Z" transform="translate(45, 0)" />
        </g>

        {/* === PALAVRA 'SOL' (Amarelo Dourado Solar #F59E0B) === */}
        <g fill={yellowColor}>
          {/* S */}
          <path d="M 115 28 C 115 20, 123 15, 137 15 C 151 15, 160 21, 161 31 L 145 31 C 144 26, 141 24, 137 24 C 132 24, 128 26, 128 29 C 128 32, 131 34, 141 36 L 148 38 C 160 41, 165 47, 165 56 C 165 67, 154 73, 138 73 C 121 73, 112 66, 111 54 L 127 54 C 128 60, 133 63, 138 63 C 144 63, 148 61, 148 57 C 148 54, 145 52, 136 50 L 129 48 C 118 45, 115 39, 115 28 Z" />
          {/* O */}
          <path d="M 172 44 C 172 26, 185 14, 203 14 C 221 14, 234 26, 234 44 C 234 62, 221 74, 203 74 C 185 74, 172 62, 172 44 Z M 218 44 C 218 33, 212 24, 203 24 C 194 24, 188 33, 188 44 C 188 55, 194 64, 203 64 C 212 64, 218 55, 218 44 Z" />
          {/* L */}
          <path d="M 243 16 L 259 16 L 259 61 L 285 61 L 285 72 L 243 72 Z" />
        </g>

        {/* === PALAVRA 'energy' (Dark Navy #1E293B / Branco) === */}
        <g fill={getEnergyColor()} transform="translate(138, 76)">
          <text
            x="0"
            y="26"
            fontFamily="Plus Jakarta Sans, Sora, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="32"
            letterSpacing="1"
          >
            energy
          </text>
        </g>
      </g>
    </svg>
  );
};

export default EsolOfficialBrandSymbol;
