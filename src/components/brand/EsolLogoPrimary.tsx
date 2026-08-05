import React from 'react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  className?: string;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal Oficial da eSOL Energy
 * Fidelidade visual 100% fiel ao símbolo oficial fornecido pelo usuário.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 240,
  height = 70,
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
