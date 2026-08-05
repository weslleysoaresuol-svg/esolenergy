import React from 'react';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Oficial eSOL Energy (V15.0 Alta Definição 4K)
 *
 * Renderiza em 4K cristalino com fundo transparente:
 * - `e`: Verde Esmeralda (#22C55E)
 * - `SOL`: Âmbar Solar Dourado (#F59E0B)
 * - `energy`: Dark Navy (#1E293B) no modo claro e Branco Puríssimo (#FFFFFF) no modo escuro.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 180,
  height,
  variant = 'auto',
  className = '',
}) => {
  const logoSrc =
    variant === 'dark'
      ? '/esol-logo-dark-2026.png'
      : '/esol-logo-official-2026.png';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
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
