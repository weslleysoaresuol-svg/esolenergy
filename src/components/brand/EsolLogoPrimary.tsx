import React from 'react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal Oficial da eSOL Energy
 *
 * Fidelidade 100% Homologada ao formato, tipografia e posições da logo oficial.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 240,
  height = 75,
  variant = 'auto',
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <EsolOfficialBrandSymbol width={width} height={height} variant={variant} />
    </div>
  );
};

export default EsolLogoPrimary;
