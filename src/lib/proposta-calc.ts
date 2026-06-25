// Motor de cálculo de propostas solares baseado em referências do mercado BR
// (Sunbrasil, Solfácil, Portal Solar, Aldo Solar, EDP — médias 2025)

export type Regiao = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";
export type TipoInstalacao = "residencial" | "comercial" | "industrial" | "rural";

export interface Parametros {
  hsp_norte: number;
  hsp_nordeste: number;
  hsp_centro_oeste: number;
  hsp_sudeste: number;
  hsp_sul: number;
  preco_wp_residencial_pequeno: number;
  preco_wp_residencial_grande: number;
  preco_wp_comercial_pequeno: number;
  preco_wp_comercial_grande: number;
  preco_wp_industrial: number;
  tarifa_kwh_default: number;
  perdas_sistema: number;
  inflacao_energetica: number;
  vida_util_anos: number;
  potencia_modulo_w: number;
  area_por_modulo_m2: number;
  custo_equipamentos_pct: number;
  custo_instalacao_pct: number;
  custo_frete_pct: number;
  custo_impostos_pct: number;
  custo_comissao_pct: number;
  margem_alvo_pct: number;
  validade_proposta_dias: number;
}

// Mapeamento estado → região
const ESTADO_REGIAO: Record<string, Regiao> = {
  AC: "norte", AP: "norte", AM: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste", PE: "nordeste",
  PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro_oeste", GO: "centro_oeste", MT: "centro_oeste", MS: "centro_oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};

export function regiaoFromEstado(uf?: string | null): Regiao {
  if (!uf) return "sudeste";
  return ESTADO_REGIAO[uf.toUpperCase()] ?? "sudeste";
}

export function hspForRegiao(p: Parametros, r: Regiao): number {
  switch (r) {
    case "norte": return p.hsp_norte;
    case "nordeste": return p.hsp_nordeste;
    case "centro_oeste": return p.hsp_centro_oeste;
    case "sudeste": return p.hsp_sudeste;
    case "sul": return p.hsp_sul;
  }
}

export function precoPorWp(p: Parametros, tipo: TipoInstalacao, kwp: number): number {
  if (tipo === "industrial") return p.preco_wp_industrial;
  if (tipo === "comercial" || tipo === "rural") {
    return kwp >= 30 ? p.preco_wp_comercial_grande : p.preco_wp_comercial_pequeno;
  }
  return kwp >= 5 ? p.preco_wp_residencial_grande : p.preco_wp_residencial_pequeno;
}

export interface CalculoInput {
  consumo_kwh: number;
  tarifa_kwh: number;
  estado?: string | null;
  tipo: TipoInstalacao;
}

export interface CalculoResultado {
  regiao: Regiao;
  hsp: number;
  kwp_sistema: number;
  qtd_modulos: number;
  potencia_modulo_w: number;
  qtd_inversores: number;
  potencia_inversor_kw: number;
  area_necessaria_m2: number;
  geracao_mensal_kwh: number;
  economia_mensal: number;
  economia_anual: number;
  economia_25_anos: number;
  payback_meses: number;
  preco_total: number;
  preco_por_wp: number;
  co2_evitado_ton: number;
  arvores_equivalentes: number;
  // Análise de custos (admin)
  custo_equipamentos: number;
  custo_instalacao: number;
  custo_frete: number;
  custo_impostos: number;
  custo_comissao: number;
  custos_totais: number;
  margem_real: number;
  margem_pct: number;
}

export function calcularProposta(input: CalculoInput, p: Parametros): CalculoResultado {
  const regiao = regiaoFromEstado(input.estado);
  const hsp = hspForRegiao(p, regiao);
  const eficiencia = 1 - p.perdas_sistema;

  // kWp ideal = consumo diário / (HSP * eficiência)
  const consumoDiario = input.consumo_kwh / 30;
  const kwpIdeal = consumoDiario / (hsp * eficiencia);

  // Arredonda para cima ao múltiplo do módulo
  const modulosFloat = (kwpIdeal * 1000) / p.potencia_modulo_w;
  const qtd_modulos = Math.max(2, Math.ceil(modulosFloat));
  const kwp_sistema = +(qtd_modulos * p.potencia_modulo_w / 1000).toFixed(2);

  // Inversor: 1 por até 8 kWp, +1 a cada 8 kWp acima
  const qtd_inversores = Math.max(1, Math.ceil(kwp_sistema / 8));
  const potencia_inversor_kw = +(kwp_sistema / qtd_inversores).toFixed(2);

  const area_necessaria_m2 = +(qtd_modulos * p.area_por_modulo_m2).toFixed(1);
  const geracao_mensal_kwh = +(kwp_sistema * hsp * 30 * eficiencia).toFixed(0);
  const economia_mensal = +(Math.min(geracao_mensal_kwh, input.consumo_kwh) * input.tarifa_kwh).toFixed(2);
  const economia_anual = +(economia_mensal * 12).toFixed(2);

  // Economia 25 anos com inflação composta
  let acumulado = 0;
  for (let ano = 0; ano < p.vida_util_anos; ano++) {
    acumulado += economia_anual * Math.pow(1 + p.inflacao_energetica, ano);
  }
  const economia_25_anos = +acumulado.toFixed(2);

  const preco_por_wp = precoPorWp(p, input.tipo, kwp_sistema);
  const preco_total = +(kwp_sistema * 1000 * preco_por_wp).toFixed(2);
  const payback_meses = economia_mensal > 0 ? +(preco_total / economia_mensal).toFixed(1) : 0;

  // CO2: ~84 kg CO2/MWh evitado (matriz BR média)
  const co2_evitado_ton = +(geracao_mensal_kwh * 12 * p.vida_util_anos * 0.084 / 1000).toFixed(2);
  const arvores_equivalentes = Math.round(co2_evitado_ton * 7);

  // Custos (análise admin)
  const custo_equipamentos = +(preco_total * p.custo_equipamentos_pct).toFixed(2);
  const custo_instalacao = +(preco_total * p.custo_instalacao_pct).toFixed(2);
  const custo_frete = +(preco_total * p.custo_frete_pct).toFixed(2);
  const custo_impostos = +(preco_total * p.custo_impostos_pct).toFixed(2);
  const custo_comissao = +(preco_total * p.custo_comissao_pct).toFixed(2);
  const custos_totais = custo_equipamentos + custo_instalacao + custo_frete + custo_impostos + custo_comissao;
  const margem_real = +(preco_total - custos_totais).toFixed(2);
  const margem_pct = +(margem_real / preco_total).toFixed(4);

  return {
    regiao, hsp, kwp_sistema, qtd_modulos, potencia_modulo_w: p.potencia_modulo_w,
    qtd_inversores, potencia_inversor_kw, area_necessaria_m2,
    geracao_mensal_kwh, economia_mensal, economia_anual, economia_25_anos, payback_meses,
    preco_total, preco_por_wp, co2_evitado_ton, arvores_equivalentes,
    custo_equipamentos, custo_instalacao, custo_frete, custo_impostos, custo_comissao,
    custos_totais, margem_real, margem_pct,
  };
}

export const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const NUM = (n: number, d = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
