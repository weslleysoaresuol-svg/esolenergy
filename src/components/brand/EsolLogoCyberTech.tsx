import React from 'react';
import { motion } from 'framer-motion';

export interface EsolLogoCyberTechProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  interactive?: boolean;
  className?: string;
}

/**
 * `<EsolLogoCyberTech />` — Assinatura Animada CyberTech da Esol Energy (V13.2)
 *
 * Utiliza Framer Motion para criar animações fluidas de iluminação solar,
 * pulsação de fótons e revelação suave de elementos. Ideal para Hero Sections,
 * vídeos promocionais, apresentações da Esol Academy e telas de Splash.
 */
export const EsolLogoCyberTech: React.FC<EsolLogoCyberTechProps> = ({
  width = 300,
  height = 75,
  variant = 'auto',
  showTagline = true,
  interactive = true,
  className = '',
  ...props
}) => {
  const greenColor = '#10B981'; // Eco Green
  const amberColor = '#F59E0B'; // Solar Amber
  const greyColor = '#94A3B8';  // Subtext Slate-400

  const getSolColor = () => {
    if (variant === 'dark') return '#F8FAFC';
    if (variant === 'light') return '#0A2540';
    return 'currentColor';
  };

  return (
    <motion.div
      className={`inline-block select-none ${className}`}
      initial={interactive ? 'initial' : false}
      animate={interactive ? 'animate' : false}
      whileHover={interactive ? { scale: 1.02 } : undefined}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Esol Energy Logo Animada CyberTech"
        role="img"
        {...props}
      >
        <defs>
          {/* Gradiente de feixe de luz solar em movimento */}
          <linearGradient id="cyber-beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g transform="translate(10, 10)">
          {/* 1. Letra 'e' Eco Green com entrada elástica */}
          <motion.text
            x="0"
            y="42"
            fill={greenColor}
            fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="44"
            letterSpacing="-1"
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: 'easeOut' },
              },
            }}
          >
            e
          </motion.text>

          {/* 2. Palavra 'SOL' com entrada deslizada */}
          <motion.text
            x="28"
            y="42"
            fill={getSolColor()}
            fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="44"
            className="dark:fill-slate-50 fill-slate-900"
            letterSpacing="-0.5"
            variants={{
              initial: { opacity: 0, x: 20 },
              animate: {
                opacity: 1,
                x: 28,
                transition: { duration: 0.6, delay: 0.1, ease: 'easeOut' },
              },
            }}
          >
            SOL
          </motion.text>

          {/* 3. Palavra 'energy' com pulsação suave em Solar Amber */}
          <motion.text
            x="128"
            y="42"
            fill={amberColor}
            fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="44"
            letterSpacing="0"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: { duration: 0.6, delay: 0.25 },
              },
            }}
          >
            energy
          </motion.text>

          {/* 4. Feixe de luz fotônica deslizando sobre o logo */}
          {interactive && (
            <motion.rect
              x="0"
              y="10"
              width="280"
              height="3"
              rx="1.5"
              fill="url(#cyber-beam-gradient)"
              variants={{
                initial: { opacity: 0, x: -100 },
                animate: {
                  opacity: [0, 0.8, 0],
                  x: [0, 200, 300],
                  transition: {
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut',
                  },
                },
              }}
            />
          )}

          {/* 5. Tagline Comercial */}
          {showTagline && (
            <motion.text
              x="2"
              y="62"
              fill={greyColor}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
              fontSize="12.5"
              letterSpacing="0.2"
              variants={{
                initial: { opacity: 0, y: 5 },
                animate: {
                  opacity: 0.9,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.4 },
                },
              }}
            >
              Deixe o sol trabalhar por você
            </motion.text>
          )}
        </g>
      </svg>
    </motion.div>
  );
};

export default EsolLogoCyberTech;
