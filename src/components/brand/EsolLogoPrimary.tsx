import React from 'react';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal Oficial da eSOL Energy
 *
 * Utiliza o arquivo vetorial SVG homologado do Brand-Kit oficial com as cores homologadas:
 * - `e`: Verde Esmeralda (#22C55E)
 * - `SOL`: Âmbar Solar Dourado (#F59E0B)
 * - `energy`: Dark Navy (#1E293B) no modo claro e Branco (#FFFFFF) no modo escuro.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
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
        return '/esol-logo-mono-white-2026.svg';
      case 'mono-dark':
        return '/esol-logo-mono-dark-2026.svg';
      case 'light':
      case 'auto':
      default:
        return '/esol-logo-official-2026.svg';
    }
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={getSvgSrc()}
        alt="eSOL energy Logo Oficial"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
          objectFit: 'contain',
        }}
        className="transition-opacity duration-300 hover:opacity-95"
      />
    </div>
  );
};

export default EsolLogoPrimary;
