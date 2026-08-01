/**
 * Configuração Mestre de Marca & Design System — Esol Energy V13.2
 *
 * Módulo centralizador de informações de marca, slogans oficiais,
 * tokens de cores HSL/Hex, regras de aplicação e catálogo de ativos vetoriais.
 */

export interface BrandColorToken {
  hex: string;
  hsl: string;
  name: string;
  description: string;
}

export const BRAND_INFO = {
  name: 'Esol Energy',
  shortName: 'esol',
  legalName: 'Esol Energy Soluções Energéticas S.A.',
  tagline: 'Deixe o sol trabalhar por você',
  domain: 'esolenergy.com.br',
  version: '13.2',
  foundingYear: 2024,
} as const;

export const BRAND_SLOGANS = {
  primaryB2C: 'Deixe o sol trabalhar por você',
  institutionalB2B: 'A Revolução da Sua Soberania Energética',
  directSalesNetwork: 'Conectando Pessoas. Multiplicando Conquistas.',
  residentialPWA: 'Transforme a Luz do Sol em Liberdade Financeira.',
  corporateAdmin: 'Inteligência Energética de Alta Performance para o Seu Negócio.',
} as const;

export type SloganContext = keyof typeof BRAND_SLOGANS;

/**
 * Retorna o slogan oficial apropriado para o contexto de aplicação
 */
export function getBrandSlogan(context: SloganContext = 'primaryB2C'): string {
  return BRAND_SLOGANS[context] || BRAND_SLOGANS.primaryB2C;
}

export const BRAND_COLORS: Record<string, BrandColorToken> = {
  ecoGreen: {
    hex: '#10B981',
    hsl: 'hsl(160, 84%, 39%)',
    name: 'Emerald Eco Green',
    description: 'Representa a transição para energia limpa, ecologia e sustentabilidade ESG.',
  },
  corporateNavy: {
    hex: '#0A2540',
    hsl: 'hsl(211, 73%, 15%)',
    name: 'Midnight Corporate Navy',
    description: 'Representa a solidez institucional, segurança jurídica e estabilidade financeira.',
  },
  solarAmber: {
    hex: '#F59E0B',
    hsl: 'hsl(38, 92%, 50%)',
    name: 'Photovoltaic Solar Amber',
    description: 'Representa a captação de luz solar, geração fotovoltaica e retorno financeiro.',
  },
  slateDark: {
    hex: '#020617',
    hsl: 'hsl(222, 47%, 4%)',
    name: 'Deep Slate Dark',
    description: 'Fundo escuro absoluto para interfaces noturnas e Dark Mode.',
  },
  crystalWhite: {
    hex: '#F8FAFC',
    hsl: 'hsl(210, 40%, 98%)',
    name: 'Crystal White',
    description: 'Branco de alta nitidez para contraste em textos sobre fundos escuros.',
  },
};

export const BRAND_ASSETS = {
  components: {
    primary: 'EsolLogoPrimary',
    stacked: 'EsolLogoStacked',
    gliph: 'EsolBrandmarkGliph',
    negative: 'EsolLogoNegative',
    monochrome: 'EsolLogoMonochrome',
    cyberTech: 'EsolLogoCyberTech',
    faviconMicro: 'EsolFaviconMicro',
  },
  favicons: {
    svg: '/favicon.svg',
    png16: '/favicon-16x16.png',
    png32: '/favicon-32x32.png',
    appleTouch: '/apple-touch-icon.png',
    webmanifest: '/manifest.json',
  },
  brandKitManualPath: '/brand-kit/MANUAL_DE_USO_V13.md',
} as const;

export default {
  BRAND_INFO,
  BRAND_SLOGANS,
  BRAND_COLORS,
  BRAND_ASSETS,
  getBrandSlogan,
};
