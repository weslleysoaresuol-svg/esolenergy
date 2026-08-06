import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Componente Oficial da eSOL energy.
 *
 * Utiliza a matriz vetorial mestre (1216x532 HD) com a geometria 100% IDÊNTICA
 * fornecida pelo usuário no arquivo de referência neutro.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  const getImageSrc = () => {
    switch (variant) {
      case 'dark':
        return '/esol-logo-dark-2026.png';
      case 'mono-white':
        return '/esol-logo-mono-white-2026.png';
      case 'mono-dark':
        return '/esol-logo-mono-dark-2026.png';
      case 'light':
      case 'auto':
      default:
        return '/esol-logo-official-2026.png';
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
        src={getImageSrc()}
        alt="eSOL energy Logo Oficial Mestre"
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
