import React from 'react';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura da Marca Oficial eSOL Energy
 * Renderiza 100% DIRETO o arquivo binário de imagem fornecido pelo usuário,
 * sem nenhuma alteração gráfica, corte, vetorização ou perda de qualidade.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 180,
  height,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/esol-logo-official-2026.png"
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
