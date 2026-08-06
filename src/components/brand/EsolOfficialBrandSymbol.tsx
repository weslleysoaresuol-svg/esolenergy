import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Componente Vetorial 100% Nativo SVG para a eSOL energy.
 *
 * Elimina completamente rastreio de pixels (PNG) e renderiza traços vetoriais com matemática perfeita,
 * garantindo nitidez absoluta em qualquer resolução, display 4K/Retina e escalabilidade infinita.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  // Cores Homologadas
  const greenHex = '#22C55E';
  const amberHex = '#F59E0B';
  const navyHex  = '#1E293B';
  const whiteHex = '#FFFFFF';

  const getColors = () => {
    switch (variant) {
      case 'dark':
        return { e: greenHex, sol: amberHex, energy: whiteHex };
      case 'mono-white':
        return { e: whiteHex, sol: whiteHex, energy: whiteHex };
      case 'mono-dark':
        return { e: navyHex, sol: navyHex, energy: navyHex };
      case 'light':
      case 'auto':
      default:
        return { e: greenHex, sol: amberHex, energy: navyHex };
    }
  };

  const { e: colE, sol: colSol, energy: colEnergy } = getColors();

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 380 145"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            .v-e { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; font-weight: 800; font-size: 92px; }
            .v-sol { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; font-weight: 900; font-size: 92px; letter-spacing: -0.02em; }
            .v-energy { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 42px; letter-spacing: -0.02em; }
          `}</style>
        </defs>
        <g className="esol-pure-vector">
          {/* Letra 'e' (Verde Esmeralda) */}
          <text x="12" y="86" fill={colE} className="v-e">
            e
          </text>
          {/* Palavra 'SOL' (Amarelo Dourado Solar) */}
          <text x="74" y="86" fill={colSol} className="v-sol">
            SOL
          </text>
          {/* Palavra 'energy' (Dark Navy ou Branco) */}
          <text x="144" y="128" fill={colEnergy} className="v-energy">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
