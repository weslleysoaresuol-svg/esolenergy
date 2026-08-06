import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Marca Oficial esol energy. (Versão Exata Solicitada)
 *
 * Renderiza o logotipo oficial exato (esol energy.) com a fusão em laço infinito entre 's' e 'o'
 * e o ponto verde esmeralda no final, garantindo 100% de precisão visual.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 240,
  height,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <img
        src="/esol-logo-dark-2026.png"
        alt="esol energy. Marca Oficial"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        className="transition-opacity duration-300 hover:opacity-95 drop-shadow-sm"
      />
    </div>
  );
};

export default EsolOfficialBrandSymbol;
