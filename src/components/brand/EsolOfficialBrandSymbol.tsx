import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Assinatura Vetorial Nativa 100% SVG em React.
 *
 * Renderiza a marca eSOL energy em SVG puro com tipografia vetorial de altíssima fidelidade.
 * Elimina 100% qualquer ruído, bloco, fundo ou pixelização bitmap.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const getEnergyColor = () => {
    switch (variant) {
      case 'dark':
      case 'mono-white':
        return '#FFFFFF'; // Branco Puríssimo para fundo escuro
      case 'mono-dark':
      case 'light':
      case 'auto':
      default:
        return '#1E293B'; // Dark Navy para fundo claro
    }
  };

  const energyColor = getEnergyColor();
  const greenColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#1E293B' : '#22C55E');
  const amberColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#1E293B' : '#F59E0B');

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 320 136"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap');
            .esol-font-e {
              font-family: 'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif;
              font-weight: 800;
              font-size: 88px;
            }
            .esol-font-sol {
              font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              font-weight: 900;
              font-size: 88px;
              letter-spacing: -2px;
            }
            .esol-font-energy {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              font-weight: 800;
              font-size: 40px;
              letter-spacing: -1px;
            }
          `}</style>
        </defs>
        
        <g transform="translate(4, 0)">
          {/* Letra 'e' (Verde Esmeralda #22C55E) */}
          <text x="8" y="82" fill={greenColor} className="esol-font-e">
            e
          </text>
          
          {/* Palavra 'SOL' (Amarelo Dourado Solar #F59E0B) */}
          <text x="68" y="82" fill={amberColor} className="esol-font-sol">
            SOL
          </text>
          
          {/* Palavra 'energy' (Branco no topo escuro / Dark Navy no topo claro) */}
          <text x="134" y="122" fill={energyColor} className="esol-font-energy">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
