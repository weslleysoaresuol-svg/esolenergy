// Catálogo de Concessionárias de Energia Elétrica do Brasil
// Tarifas ANEEL 2025 — Referência: Resoluções Homologatórias vigentes (jun/2025)
// Editável pelo admin no painel de Parâmetros conforme reajustes ANEEL

export interface Concessionaria {
  id: string;
  nome: string;
  uf: string;
  regiao: string;
  tarifa_residencial: number;   // R$/kWh (B1 Residencial com impostos)
  tarifa_comercial: number;     // R$/kWh (B3 Comercial com impostos)
  tarifa_rural: number;         // R$/kWh (B2 Rural com impostos)
  tarifa_industrial: number;    // R$/kWh (A4 Industrial estimado)
  custo_disponib_mono_kwh: number;  // kWh mínimo monofásico (ANEEL: 30 kWh)
  custo_disponib_bi_kwh: number;    // kWh mínimo bifásico (ANEEL: 50 kWh)
  custo_disponib_tri_kwh: number;   // kWh mínimo trifásico (ANEEL: 100 kWh)
  site: string;
  vigencia: string;             // Mês/ano da tarifa vigente
}

// Catálogo completo — 29 UFs cobertas
export const CONCESSIONARIAS: Concessionaria[] = [
  // ── SUDESTE ────────────────────────────────────────────────────────────────
  {
    id: "edp_sp", nome: "EDP São Paulo", uf: "SP", regiao: "sudeste",
    tarifa_residencial: 0.890, tarifa_comercial: 0.755, tarifa_rural: 0.620, tarifa_industrial: 0.540,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.edp.com.br", vigencia: "Jan/2025"
  },
  {
    id: "cpfl_paulista", nome: "CPFL Paulista", uf: "SP", regiao: "sudeste",
    tarifa_residencial: 0.875, tarifa_comercial: 0.740, tarifa_rural: 0.610, tarifa_industrial: 0.528,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.cpfl.com.br", vigencia: "Abr/2025"
  },
  {
    id: "elektro", nome: "Elektro / CPFL", uf: "SP", regiao: "sudeste",
    tarifa_residencial: 0.862, tarifa_comercial: 0.728, tarifa_rural: 0.598, tarifa_industrial: 0.519,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.elektro.com.br", vigencia: "Abr/2025"
  },
  {
    id: "cemig", nome: "CEMIG", uf: "MG", regiao: "sudeste",
    tarifa_residencial: 0.859, tarifa_comercial: 0.725, tarifa_rural: 0.594, tarifa_industrial: 0.515,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.cemig.com.br", vigencia: "Mai/2025"
  },
  {
    id: "enel_rj", nome: "Enel Rio (ex-Light)", uf: "RJ", regiao: "sudeste",
    tarifa_residencial: 0.925, tarifa_comercial: 0.790, tarifa_rural: 0.651, tarifa_industrial: 0.562,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.enel.com.br", vigencia: "Mar/2025"
  },
  {
    id: "edp_es", nome: "EDP Espírito Santo", uf: "ES", regiao: "sudeste",
    tarifa_residencial: 0.875, tarifa_comercial: 0.741, tarifa_rural: 0.611, tarifa_industrial: 0.530,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.edp.com.br", vigencia: "Jan/2025"
  },

  // ── SUL ────────────────────────────────────────────────────────────────────
  {
    id: "copel", nome: "COPEL", uf: "PR", regiao: "sul",
    tarifa_residencial: 0.832, tarifa_comercial: 0.704, tarifa_rural: 0.580, tarifa_industrial: 0.500,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.copel.com", vigencia: "Jun/2025"
  },
  {
    id: "celesc", nome: "CELESC", uf: "SC", regiao: "sul",
    tarifa_residencial: 0.820, tarifa_comercial: 0.694, tarifa_rural: 0.572, tarifa_industrial: 0.492,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.celesc.com.br", vigencia: "Jun/2025"
  },
  {
    id: "ceee_equatorial", nome: "CEEE Equatorial (RS)", uf: "RS", regiao: "sul",
    tarifa_residencial: 0.810, tarifa_comercial: 0.685, tarifa_rural: 0.565, tarifa_industrial: 0.484,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Mai/2025"
  },
  {
    id: "rge_cpfl", nome: "RGE / CPFL Sul (RS)", uf: "RS", regiao: "sul",
    tarifa_residencial: 0.845, tarifa_comercial: 0.715, tarifa_rural: 0.589, tarifa_industrial: 0.506,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.cpfl.com.br", vigencia: "Abr/2025"
  },

  // ── CENTRO-OESTE ───────────────────────────────────────────────────────────
  {
    id: "enel_go", nome: "Enel Goiás", uf: "GO", regiao: "centro_oeste",
    tarifa_residencial: 0.855, tarifa_comercial: 0.724, tarifa_rural: 0.597, tarifa_industrial: 0.512,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.enel.com.br", vigencia: "Fev/2025"
  },
  {
    id: "energisa_mt", nome: "Energisa Mato Grosso", uf: "MT", regiao: "centro_oeste",
    tarifa_residencial: 0.905, tarifa_comercial: 0.767, tarifa_rural: 0.632, tarifa_industrial: 0.545,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "energisa_ms", nome: "Energisa Mato Grosso do Sul", uf: "MS", regiao: "centro_oeste",
    tarifa_residencial: 0.882, tarifa_comercial: 0.747, tarifa_rural: 0.616, tarifa_industrial: 0.528,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "neoenergia_df", nome: "Neoenergia Brasília (CEB)", uf: "DF", regiao: "centro_oeste",
    tarifa_residencial: 0.860, tarifa_comercial: 0.728, tarifa_rural: 0.599, tarifa_industrial: 0.515,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.neoenergia.com", vigencia: "Jun/2025"
  },

  // ── NORDESTE ───────────────────────────────────────────────────────────────
  {
    id: "coelba", nome: "COELBA / Neoenergia Bahia", uf: "BA", regiao: "nordeste",
    tarifa_residencial: 0.871, tarifa_comercial: 0.737, tarifa_rural: 0.607, tarifa_industrial: 0.522,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.neoenergia.com", vigencia: "Abr/2025"
  },
  {
    id: "neoenergia_pe", nome: "Neoenergia Pernambuco (CELPE)", uf: "PE", regiao: "nordeste",
    tarifa_residencial: 0.850, tarifa_comercial: 0.719, tarifa_rural: 0.593, tarifa_industrial: 0.508,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.neoenergia.com", vigencia: "Abr/2025"
  },
  {
    id: "enel_ce", nome: "Enel Ceará", uf: "CE", regiao: "nordeste",
    tarifa_residencial: 0.860, tarifa_comercial: 0.728, tarifa_rural: 0.600, tarifa_industrial: 0.516,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.enel.com.br", vigencia: "Abr/2025"
  },
  {
    id: "equatorial_ma", nome: "Equatorial Maranhão", uf: "MA", regiao: "nordeste",
    tarifa_residencial: 0.905, tarifa_comercial: 0.767, tarifa_rural: 0.632, tarifa_industrial: 0.544,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Mar/2025"
  },
  {
    id: "equatorial_pi", nome: "Equatorial Piauí", uf: "PI", regiao: "nordeste",
    tarifa_residencial: 0.947, tarifa_comercial: 0.802, tarifa_rural: 0.661, tarifa_industrial: 0.570,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Jun/2025"
  },
  {
    id: "equatorial_al", nome: "Equatorial Alagoas", uf: "AL", regiao: "nordeste",
    tarifa_residencial: 0.882, tarifa_comercial: 0.747, tarifa_rural: 0.616, tarifa_industrial: 0.529,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Mai/2025"
  },
  {
    id: "cosern", nome: "Neoenergia Cosern (RN)", uf: "RN", regiao: "nordeste",
    tarifa_residencial: 0.865, tarifa_comercial: 0.733, tarifa_rural: 0.604, tarifa_industrial: 0.518,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.neoenergia.com", vigencia: "Mai/2025"
  },
  {
    id: "energisa_pb", nome: "Energisa Paraíba", uf: "PB", regiao: "nordeste",
    tarifa_residencial: 0.870, tarifa_comercial: 0.736, tarifa_rural: 0.607, tarifa_industrial: 0.522,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "energisa_se", nome: "Energisa Sergipe", uf: "SE", regiao: "nordeste",
    tarifa_residencial: 0.858, tarifa_comercial: 0.726, tarifa_rural: 0.598, tarifa_industrial: 0.514,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },

  // ── NORTE ──────────────────────────────────────────────────────────────────
  {
    id: "equatorial_pa", nome: "Equatorial Pará", uf: "PA", regiao: "norte",
    tarifa_residencial: 0.978, tarifa_comercial: 0.828, tarifa_rural: 0.682, tarifa_industrial: 0.588,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Jun/2025"
  },
  {
    id: "energisa_to", nome: "Energisa Tocantins", uf: "TO", regiao: "norte",
    tarifa_residencial: 0.930, tarifa_comercial: 0.788, tarifa_rural: 0.649, tarifa_industrial: 0.558,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "amazonas_energia", nome: "Amazonas Energia", uf: "AM", regiao: "norte",
    tarifa_residencial: 0.890, tarifa_comercial: 0.754, tarifa_rural: 0.621, tarifa_industrial: 0.535,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.amazonasenergia.gov.br", vigencia: "Jan/2025"
  },
  {
    id: "energisa_ac", nome: "Energisa Acre", uf: "AC", regiao: "norte",
    tarifa_residencial: 0.892, tarifa_comercial: 0.755, tarifa_rural: 0.622, tarifa_industrial: 0.536,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "energisa_ro", nome: "Energisa Rondônia", uf: "RO", regiao: "norte",
    tarifa_residencial: 0.897, tarifa_comercial: 0.759, tarifa_rural: 0.626, tarifa_industrial: 0.538,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.energisa.com.br", vigencia: "Mar/2025"
  },
  {
    id: "roraima_energia", nome: "Roraima Energia", uf: "RR", regiao: "norte",
    tarifa_residencial: 0.880, tarifa_comercial: 0.745, tarifa_rural: 0.614, tarifa_industrial: 0.528,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.roraimaenergia.com.br", vigencia: "Jan/2025"
  },
  {
    id: "cea_equatorial", nome: "CEA Equatorial (AP)", uf: "AP", regiao: "norte",
    tarifa_residencial: 0.915, tarifa_comercial: 0.775, tarifa_rural: 0.638, tarifa_industrial: 0.550,
    custo_disponib_mono_kwh: 30, custo_disponib_bi_kwh: 50, custo_disponib_tri_kwh: 100,
    site: "https://www.equatorialenergia.com.br", vigencia: "Mai/2025"
  },
];

// ─── Funções de Consulta ─────────────────────────────────────────────────────

/** Retorna todas as concessionárias de uma UF */
export function getConcessionariasPorUF(uf: string): Concessionaria[] {
  return CONCESSIONARIAS.filter(c => c.uf === uf.toUpperCase());
}

/** Retorna a concessionária principal de uma UF (a de maior cobertura) */
export function getConcessionariaPrincipal(uf: string): Concessionaria | null {
  const lista = getConcessionariasPorUF(uf);
  return lista[0] ?? null;
}

/** Retorna a tarifa residencial para uma UF (principal concessionária) */
export function getTarifaResidencial(uf: string): number {
  const c = getConcessionariaPrincipal(uf);
  return c?.tarifa_residencial ?? 0.88; // fallback média nacional
}

/** Retorna a tarifa por tipo de instalação e UF */
export function getTarifaPorTipo(
  uf: string,
  tipo: "residencial" | "comercial" | "rural" | "industrial",
  concessionariaId?: string
): number {
  const lista = getConcessionariasPorUF(uf);
  const c = concessionariaId
    ? (lista.find(x => x.id === concessionariaId) ?? lista[0])
    : lista[0];
  if (!c) return 0.88;
  switch (tipo) {
    case "comercial":   return c.tarifa_comercial;
    case "rural":       return c.tarifa_rural;
    case "industrial":  return c.tarifa_industrial;
    default:            return c.tarifa_residencial;
  }
}

// ─── Distâncias estimadas dos CDs dos Distribuidores ─────────────────────────
// Usadas pela calculadora de frete
// Fonte: Google Maps — distâncias rodoviárias aproximadas (km)

const DISTANCIAS_CD_POR_UF: Record<string, Record<string, number>> = {
  // distribuidora_id → { UF_destino: distancia_km }
  aldo_solar: {
    SC: 0, PR: 250, RS: 350, SP: 660, RJ: 1060, MG: 1150, ES: 1320,
    MS: 1200, MT: 1700, GO: 2100, DF: 2200, BA: 2800, SE: 3100,
    AL: 3300, PE: 3400, PB: 3600, RN: 3800, CE: 3900, PI: 4100,
    MA: 4400, PA: 5000, TO: 4200, AM: 6500, AC: 7000, RO: 5800, RR: 7000, AP: 6500,
  },
  sou_energy: {
    SP: 0, RJ: 400, MG: 500, ES: 680, PR: 400, SC: 700, RS: 1100,
    MS: 900, MT: 1400, GO: 850, DF: 1000, BA: 1600, SE: 1900,
    AL: 2100, PE: 2200, PB: 2400, RN: 2600, CE: 2700, PI: 2900,
    MA: 3200, PA: 3800, TO: 3000, AM: 5300, AC: 5800, RO: 4600, RR: 5800, AP: 5300,
  },
  wdc_networks: {
    SP: 30, RJ: 430, MG: 530, ES: 710, PR: 370, SC: 670, RS: 1070,
    MS: 930, MT: 1430, GO: 880, DF: 1030, BA: 1630, SE: 1930,
    AL: 2130, PE: 2230, PB: 2430, RN: 2630, CE: 2730, PI: 2930,
    MA: 3230, PA: 3830, TO: 3030, AM: 5330, AC: 5830, RO: 4630, RR: 5830, AP: 5330,
  },
  phb_solar: {
    AM: 0, PA: 1400, RR: 700, AP: 1500, AC: 1800, RO: 1900, TO: 3200,
    MA: 3500, MT: 3400, MS: 4200, GO: 4600, DF: 4800, BA: 5400, SP: 5500,
    MG: 5300, RJ: 5700, RS: 6200, SC: 6000, PR: 5800, ES: 5600, SE: 5200,
    AL: 5000, PE: 4900, PB: 4700, RN: 4600, CE: 4500, PI: 4200,
  },
  renovigi: {
    ES: 0, RJ: 520, MG: 480, SP: 850, PR: 1100, SC: 1400, RS: 1800,
    BA: 1000, SE: 1300, AL: 1500, PE: 1600, PB: 1800, RN: 2000, CE: 2100,
    PI: 2300, MA: 2600, PA: 3200, TO: 2400, GO: 1400, DF: 1600,
    MS: 1800, MT: 2300, AM: 5500, AC: 6000, RO: 4800, RR: 6200, AP: 5700,
  },
  intelbras_solar: {
    SC: 0, PR: 280, RS: 380, SP: 700, RJ: 1100, MG: 1200,
    MS: 1250, MT: 1750, GO: 2150, DF: 2250, BA: 2850, ES: 1350,
    SE: 3150, AL: 3350, PE: 3450, PB: 3650, RN: 3850, CE: 3950,
    PI: 4150, MA: 4450, PA: 5050, TO: 4250, AM: 6550, AC: 7050, RO: 5850, RR: 7050, AP: 6550,
  },
  golden_dist: {
    SP: 20, RJ: 420, MG: 520, ES: 700, PR: 390, SC: 690, RS: 1090,
    MS: 920, MT: 1420, GO: 870, DF: 1020, BA: 1620, SE: 1920,
    AL: 2120, PE: 2220, PB: 2420, RN: 2620, CE: 2720, PI: 2920,
    MA: 3220, PA: 3820, TO: 3020, AM: 5320, AC: 5820, RO: 4620, RR: 5820, AP: 5320,
  },
  fortlev_solar: {
    ES: 0, RJ: 520, MG: 480, SP: 850, PR: 1100, SC: 1400, RS: 1800,
    BA: 1000, GO: 1400, DF: 1600, MS: 1800, MT: 2300, AM: 5500,
    SE: 1300, AL: 1500, PE: 1600, PB: 1800, RN: 2000, CE: 2100,
    PI: 2300, MA: 2600, PA: 3200, TO: 2400, AC: 6000, RO: 4800, RR: 6200, AP: 5700,
  },
};

/** Retorna a distância estimada (km) entre o CD do distribuidor e a UF de destino */
export function getDistanciaCD(distribuidoraId: string, uf_destino: string): number {
  const mapa = DISTANCIAS_CD_POR_UF[distribuidoraId];
  if (!mapa) return 1000; // fallback neutro se distribuidora não mapeada
  return mapa[uf_destino.toUpperCase()] ?? 1000;
}

/** Lista de UFs do Brasil */
export const LISTA_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];
