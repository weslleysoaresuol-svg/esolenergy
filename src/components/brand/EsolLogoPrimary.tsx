import React from 'react';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal Oficial da eSOL Energy (2026 Master)
 *
 * Utiliza diretamente a imagem raster master em alta definição fornecida pelo usuário,
 * garantindo ZERO distorção de fontes, curvas ou proporções.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 180,
  height,
  variant = 'auto',
  className = '',
}) => {
  // Define qual arquivo master utilizar dependendo do modo
  const logoSrc =
    variant === 'light'
      ? '/esol-logo-2026-master-light.png'
      : '/esol-logo-2026-master-dark.png';

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
