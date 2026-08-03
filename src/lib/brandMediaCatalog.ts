/**
 * ESOL ENERGY — Catálogo de Mídias & Fotografia Premium (V13.2)
 * Módulo com URLs parametrizadas de imagens fotográficas em alta resolução
 * para os 4 setores de atuação da empresa.
 */

export interface MediaAsset {
  id: string;
  category: 'residential' | 'commercial' | 'industrial' | 'agro';
  title: string;
  description: string;
  url: string;
  aspectRatio: string;
  badgeText: string;
}

export const ESOL_MEDIA_CATALOG: Record<string, MediaAsset> = {
  residential_hero: {
    id: 'res-01',
    category: 'residential',
    title: 'Energia Solar Residencial de Alto Padrão',
    description: 'Sistemas fotovoltaicos premium perfeitamente integrados à arquitetura moderna de residências.',
    url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: '16/9',
    badgeText: 'Residencial Premium',
  },
  commercial_hero: {
    id: 'com-01',
    category: 'commercial',
    title: 'Autonomia Energética Comercial',
    description: 'Redução drástica do OPEX de empresas, supermercados, shopping centers e edifícios corporativos.',
    url: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: '16/9',
    badgeText: 'Comercial & Corporativo',
  },
  industrial_hero: {
    id: 'ind-01',
    category: 'industrial',
    title: 'Usinas Solares Industriais Tier-1',
    description: 'Projetos de engenharia pesada para indústrias e galpões fabris com alta demanda em MWh.',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: '16/9',
    badgeText: 'Industrial & MWh',
  },
  agro_hero: {
    id: 'agro-01',
    category: 'agro',
    title: 'Energia Solar para o Agronegócio',
    description: 'Usinas de solo, pivôs de irrigação sustentável e bombeamento solar no campo.',
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: '16/9',
    badgeText: 'Agro Solar',
  },
};

export default ESOL_MEDIA_CATALOG;
