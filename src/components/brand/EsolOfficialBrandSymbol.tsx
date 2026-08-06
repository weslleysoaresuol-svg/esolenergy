import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Componente 100% VETORIAL SVG NATIVO da eSOL energy.
 *
 * Utiliza o arquivo vetorial puro extraído via ImageTracer (caminhos Bezier <path d="..." /> puros),
 * garantindo nitidez matemática absoluta, zero pixels bitmap e fundo 100% transparente.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const getSvgSrc = () => {
    switch (variant) {
      case 'dark':
        return '/esol-logo-dark-2026.svg';
      case 'mono-white':
        return '/esol-logo-dark-2026.svg';
      case 'mono-dark':
        return '/esol-logo-official-2026.svg';
      case 'light':
      case 'auto':
      default:
        return '/esol-logo-official-2026.svg';
    }
  };

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <img
        src={getSvgSrc()}
        alt="eSOL energy Logo Vetorial Puro"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        className="transition-opacity duration-300 hover:opacity-95"
      />
    </div>
  );
};

export default EsolOfficialBrandSymbol;
