import React from 'react';

export interface EsolOfficialBrandSymbolProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolOfficialBrandSymbol />` — Marca Mestre Oficial esol energy.
 *
 * Renderiza a assinatura autoral exata escolhida pelo usuário (`esol energy.`),
 * com a fusão contínua em laço infinito entre as letras 's' e 'o' e o ponto verde esmeralda final.
 * Oferece fidelidade visual de 100%, transparência nativa e nitidez em 4K.
 */
export const EsolOfficialBrandSymbol: React.FC<EsolOfficialBrandSymbolProps> = ({
  width = 220,
  height,
  variant = 'auto',
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
          height: '100%',
          objectFit: 'contain',
        }}
        className="transition-opacity duration-300 hover:opacity-95 drop-shadow-sm"
      />
    </div>
  );
};

export default EsolOfficialBrandSymbol;
