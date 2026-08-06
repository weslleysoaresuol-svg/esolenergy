import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Marca Oficial esol energy (Internacional 100% Minúscula).
 *
 * Utiliza a tipografia suiça de alta precisão Plus Jakarta Sans Bold 800 (padrão Linear / Supabase / Vercel),
 * garantindo alinhamento óptico absoluto, nitidez 4K e elegância minimalista extrema.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const isDark = variant === 'dark' || variant === 'mono-white';

  // Cores Homologadas EnergyTech de Luxo
  const greenVoltColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#10B981');
  const solarGoldColor  = variant === 'mono-white' ? '#FFFFFF' : (variant === 'mono-dark' ? '#0F172A' : '#F59E0B');
  const mainTextColor   = isDark ? '#FFFFFF' : '#0F172A';
  const energyTextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <svg
        viewBox="0 0 340 92"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            .brand-e-clean {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 68px;
              letter-spacing: -2px;
            }
            .brand-sol-clean {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 800;
              font-size: 68px;
              letter-spacing: -2px;
            }
            .brand-energy-clean {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              font-weight: 700;
              font-size: 28px;
              letter-spacing: -0.5px;
            }
          `}</style>
        </defs>

        <g className="esol-pristine-brand" transform="translate(4, 2)">
          {/* 'e' - Verde Esmeralda Volt */}
          <text x="0" y="62" fill={greenVoltColor} className="brand-e-clean">
            e
          </text>

          {/* 'sol' - Branco no modo escuro / Dark Slate no modo claro */}
          <text x="38" y="62" fill={mainTextColor} className="brand-sol-clean">
            sol
          </text>

          {/* Ponto Fotônico Solar em Amarelo Ouro */}
          <circle cx="146" cy="56" r="4.5" fill={solarGoldColor} />

          {/* 'energy' - Cinza de alta legibilidade em minúsculas */}
          <text x="158" y="84" fill={energyTextColor} className="brand-energy-clean">
            energy
          </text>
        </g>
      </svg>
    </div>
  );
};

export default EsolOfficialBrandSymbol;
