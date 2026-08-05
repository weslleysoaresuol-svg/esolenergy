import React from 'react';

export interface EsolOfficialBrandSymbolProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Vetor Oficial Master eSOL Energy (V16.0 Maestro)
 *
 * Anatomia e Fidelidade 100% Homologadas:
 * - `e`: Verde Esmeralda (#22C55E) — Curva circular orgânica com terminais macios.
 * - `SOL`: Âmbar Solar Dourado (#F59E0B no light mode, #FFFFFF no dark mode) — Tipografia geométrica encorpada com cantos arredondados.
 * - `energy`: Dark Navy (#1E293B no light mode, #FFFFFF no dark mode) — Alinhamento cirúrgico sob a palavra `SOL`.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 240,
  height,
  variant = 'auto',
  className = '',
  ...props
}) => {
  // Paleta de Cores Homologada
  const greenColor = '#22C55E';  // Verde Esmeralda Oficial
  const amberColor = '#F59E0B';  // Amarelo Dourado Solar
  const navyColor  = '#1E293B';  // Dark Navy Corporativo
  const whiteColor = '#FFFFFF';  // Branco Puríssimo

  const getColors = () => {
    switch (variant) {
      case 'dark':
        return { e: greenColor, sol: amberColor, energy: whiteColor };
      case 'mono-white':
        return { e: whiteColor, sol: whiteColor, energy: whiteColor };
      case 'mono-dark':
        return { e: navyColor, sol: navyColor, energy: navyColor };
      case 'light':
      case 'auto':
      default:
        return { e: greenColor, sol: amberColor, energy: navyColor };
    }
  };

  const colors = getColors();
  const computedHeight = height || 75;

  return (
    <svg
      width={width}
      height={computedHeight}
      viewBox="0 0 380 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors duration-300 ${className}`}
      aria-label="eSOL energy Logo Oficial"
      role="img"
      {...props}
    >
      <g transform="translate(10, 10)">
        {/* === 1. LETRA 'e' (Verde Esmeralda Arredondado) === */}
        <path
          d="M 64 56 C 64 28, 44 14, 20 14 C -4 14, -24 28, -24 56 C -24 84, -4 98, 20 98 C 40 98, 54 86, 60 70 L 38 70 C 34 78, 28 82, 20 82 C 6 82, -4 74, -6 60 L 63 60 C 64 58.5, 64 57, 64 56 Z M -6 46 C -3 36, 7 28, 20 28 C 33 28, 42 36, 45 46 L -6 46 Z"
          fill={colors.e}
          transform="translate(26, 0)"
        />

        {/* === 2. PALAVRA 'SOL' (Geométrico Encorpado com Cantos Suaves) === */}
        <g fill={colors.sol}>
          {/* 'S' arredondado */}
          <path d="M 118 30 C 118 20, 128 14, 144 14 C 160 14, 170 21, 171 33 L 152 33 C 151 27, 147 24, 144 24 C 138 24, 134 26, 134 30 C 134 34, 138 36, 148 38 L 156 40 C 170 43, 175 50, 175 60 C 175 72, 163 78, 144 78 C 124 78, 114 70, 113 56 L 132 56 C 133 63, 139 67, 144 67 C 151 67, 156 64, 156 59 C 156 55, 152 53, 142 51 L 133 49 C 122 46, 118 40, 118 30 Z" />
          
          {/* 'O' circular perfeito com cantos orgânicos */}
          <path d="M 182 46 C 182 26, 196 14, 216 14 C 236 14, 250 26, 250 46 C 250 66, 236 78, 216 78 C 196 78, 182 66, 182 46 Z M 231 46 C 231 33, 224 24, 216 24 C 208 24, 201 33, 201 46 C 201 59, 208 68, 216 68 C 224 68, 231 59, 231 46 Z" />
          
          {/* 'L' com terminais arredondados */}
          <path d="M 260 16 C 260 14.9, 260.9 14, 262 14 L 278 14 C 279.1 14, 280 14.9, 280 16 L 280 64 L 306 64 C 307.1 64, 308 64.9, 308 66 L 308 76 C 308 77.1, 307.1 78, 306 78 L 262 78 C 260.9 78, 260 77.1, 260 76 Z" />
        </g>

        {/* === 3. PALAVRA 'energy' (Alinhamento sob a palavra SOL) === */}
        <g fill={colors.energy} transform="translate(136, 82)">
          <text
            x="0"
            y="26"
            fontFamily="Plus Jakarta Sans, Quicksand, Sora, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="34"
            letterSpacing="0.5"
          >
            energy
          </text>
        </g>
      </g>
    </svg>
  );
};

export default EsolOfficialBrandSymbol;
