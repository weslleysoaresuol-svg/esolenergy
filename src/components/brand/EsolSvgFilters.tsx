import React from 'react';

/**
 * `<EsolSvgFilters />` — Definições de Filtros SVG Globais da ESOL Energy (V13.2)
 *
 * Injetado no topo da aplicação para fornecer efeitos de brilho fotônico,
 * reflexos metálicos e sombras orgânicas em qualquer componente SVG ou HTML.
 */
export const EsolSvgFilters: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none aria-hidden:true" aria-hidden="true">
      <defs>
        {/* Filtro 1: Photon Solar Glow (Dourado & Emerald) */}
        <filter id="esol-photon-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope="0.8" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Filtro 2: Metallic Gold Shimmer */}
        <linearGradient id="esol-gold-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Filtro 3: Emerald Sustainability Shimmer */}
        <linearGradient id="esol-emerald-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Filtro 4: Cyber Cyan Telemetry Shimmer */}
        <linearGradient id="esol-cyan-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default EsolSvgFilters;
