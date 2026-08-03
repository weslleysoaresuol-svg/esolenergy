/**
 * ESOL ENERGY — Provider Abstraction Layer (V13.2)
 * Camada de resiliência e chaveamento dinâmico entre distribuidores de hardware solar e fintechs.
 */

export interface ProviderStatus {
  name: string;
  category: 'distribuidor_hardware' | 'baas_banking' | 'emissao_fiscal';
  priority: number;
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
}

export const ESOL_PROVIDERS_HEALTH: ProviderStatus[] = [
  { name: 'Aldo Solar / Premium Hardware', category: 'distribuidor_hardware', priority: 1, status: 'online', latencyMs: 140 },
  { name: 'Weg Solar Tier-1', category: 'distribuidor_hardware', priority: 2, status: 'online', latencyMs: 180 },
  { name: 'SolisInverters Direct', category: 'distribuidor_hardware', priority: 3, status: 'online', latencyMs: 210 },
  { name: 'Asaas BaaS Banking', category: 'baas_banking', priority: 1, status: 'online', latencyMs: 95 },
  { name: 'Iugu Financial Services', category: 'baas_banking', priority: 2, status: 'online', latencyMs: 110 },
  { name: 'eNotas NFe/NFSe API', category: 'emissao_fiscal', priority: 1, status: 'online', latencyMs: 160 },
];

export function getActiveProvider(category: ProviderStatus['category']): ProviderStatus {
  const available = ESOL_PROVIDERS_HEALTH.filter((p) => p.category === category && p.status === 'online');
  return available.sort((a, b) => a.priority - b.priority)[0] || ESOL_PROVIDERS_HEALTH[0];
}
