import React from 'react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';

export interface EsolLogoPrimaryProps {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'mono-white' | 'mono-dark' | 'auto';
  className?: string;
  showTagline?: boolean;
}

/**
 * `<EsolLogoPrimary />` — Assinatura Primária Horizontal Vetorial NATIVA da eSOL Energy
 *
 * Utiliza o componente SVG 100% puro EsolOfficialBrandSymbol com tipografia vetorial de altíssima precisão.
 */
export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 220,
  height,
  variant = 'auto',
  className = '',
}) => {
  return (
    <EsolOfficialBrandSymbol
      width={width}
      height={height}
      variant={variant}
      className={className}
    />
  );
};

export default EsolLogoPrimary;
