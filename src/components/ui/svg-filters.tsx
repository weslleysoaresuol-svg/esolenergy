import * as React from "react";

/**
 * Global SVG Filter Primitives
 * Injects invisible SVG filters into the DOM for ultra-glow, color matrix, and glass refraction effects.
 */
export function SVGFilters() {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <defs>
        {/* Glow Amber Filter */}
        <filter id="glow-amber-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            type="matrix"
            values="
              1.0 0.0 0.0 0.0 1.0
              0.0 0.7 0.0 0.0 0.7
              0.0 0.0 0.0 0.0 0.0
              0.0 0.0 0.0 0.8 0.0"
            result="colorGlow"
          />
          <feMerge>
            <feMergeNode in="colorGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glow Emerald Filter */}
        <filter id="glow-emerald-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            type="matrix"
            values="
              0.0 0.0 0.0 0.0 0.0
              0.0 0.8 0.0 0.0 0.6
              0.0 0.0 0.5 0.0 0.4
              0.0 0.0 0.0 0.8 0.0"
            result="colorGlow"
          />
          <feMerge>
            <feMergeNode in="colorGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glow Cyan Filter */}
        <filter id="glow-cyan-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            type="matrix"
            values="
              0.0 0.0 0.0 0.0 0.0
              0.0 0.7 0.0 0.0 0.7
              0.0 0.0 0.9 0.0 0.9
              0.0 0.0 0.0 0.8 0.0"
            result="colorGlow"
          />
          <feMerge>
            <feMergeNode in="colorGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glass Refraction Filter */}
        <filter id="glass-refraction-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
