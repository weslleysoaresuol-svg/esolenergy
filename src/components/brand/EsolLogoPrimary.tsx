import * as React from "react";

export interface EsolLogoPrimaryProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
  variant?: "full" | "compact";
}

export const EsolLogoPrimary: React.FC<EsolLogoPrimaryProps> = ({
  width = 240,
  height = 64,
  showTagline = true,
  taglineText = "A REVOLUÇÃO DA SUA SOBERANIA ENERGÉTICA",
  className = "",
  variant = "full",
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 ${className}`}
      {...props}
    >
      <defs>
        {/* Photovoltaic Solar Gold Gradient */}
        <linearGradient
          id="esol-solar-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Quantum Cyber Emerald Accent Gradient */}
        <linearGradient
          id="esol-cyber-emerald"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Outer Glow Filter */}
        <filter
          id="esol-solar-glow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* BRANDMARK GLYPH - RADIANT SOLAR 'O' ICON */}
      <g transform="translate(12, 10)" filter="url(#esol-solar-glow)">
        {/* Outer Orbital Solar Corona Ring */}
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="url(#esol-solar-gradient)"
          strokeWidth="3.5"
          strokeDasharray="140"
          strokeDashoffset="15"
          className="opacity-90"
        />

        {/* Inner Photovoltaic Core Ring */}
        <circle
          cx="28"
          cy="28"
          r="16"
          stroke="url(#esol-solar-gradient)"
          strokeWidth="2.5"
          fill="none"
          className="opacity-70"
        />

        {/* Diagonal Quantum Energy Ray (Sun Movement Cut) */}
        <path
          d="M10 46 L46 10"
          stroke="url(#esol-solar-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Center Quantum Photon Node */}
        <circle cx="28" cy="28" r="4.5" fill="url(#esol-cyber-emerald)" />

        {/* Solar Flares / Micro Rays */}
        <line x1="28" y1="0" x2="28" y2="3" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="53" x2="28" y2="56" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="28" x2="3" y2="28" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <line x1="53" y1="28" x2="56" y2="28" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* WORDMARK - ESOL */}
      <text
        x="80"
        y="45"
        fill="#F8FAFC"
        fontFamily="Space Grotesk, Sora, sans-serif"
        fontWeight="900"
        fontSize="34"
        letterSpacing="1.5"
      >
        ESOL
      </text>

      {/* WORDMARK - ENERGY */}
      <text
        x="184"
        y="45"
        fill="url(#esol-solar-gradient)"
        fontFamily="Space Grotesk, Sora, sans-serif"
        fontWeight="800"
        fontSize="34"
        letterSpacing="2"
      >
        ENERGY
      </text>

      {/* SLOGAN / TAGLINE SUBTITLE */}
      {showTagline && variant === "full" && (
        <text
          x="81"
          y="64"
          fill="#94A3B8"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="8.5"
          letterSpacing="1.8"
          className="uppercase tracking-widest"
        >
          {taglineText}
        </text>
      )}
    </svg>
  );
};
