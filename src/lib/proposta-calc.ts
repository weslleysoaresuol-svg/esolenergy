// Motor de cálculo de propostas solares baseado em referências do mercado BR
// (Sunbrasil, Solfácil, Portal Solar, Aldo Solar, EDP — médias 2025/2026)
// Versão 2.0 — Inclui: Margem Líquida Real, Custo de Disponibilidade, COSIP, Fio B

export type Regiao = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";
export type TipoInstalacao = "residencial" | "comercial" | "industrial" | "rural";

export interface Parametros {
  // HSP por região (kWh/m²/dia)
  hsp_norte: number;
  hsp_nordeste: number;
  hsp_centro_oeste: number;
  hsp_sudeste: number;
  hsp_sul: number;

  // Preços de venda (R$/Wp)
  preco_wp_residencial_pequeno: number;
  preco_wp_residencial_grande: number;
  preco_wp_comercial_pequeno: number;
  preco_wp_comercial_grande: number;
  preco_wp_industrial: number;

  // Parâmetros técnicos gerais
  tarifa_kwh_default: number;
  perdas_sistema: number;
  inflacao_energetica: number;
  vida_util_anos: number;
  potencia_modulo_w: number;
  area_por_modulo_m2: number;

  // Estrutura de custos (% do preço de venda)
  custo_equipamentos_pct: number;
  custo_instalacao_pct: number;
  custo_frete_pct: number;

  /** @deprecated Mantido para retrocompatibilidade. Usar custo_impostos_compra_pct */
  custo_impostos_pct?: number;

  /** ICMS-ST + PIS/COFINS sobre a compra de equipamentos (ex: 0.03) */
  custo_impostos_compra_pct?: number;

  /** Alíquota efetiva do regime tributário da ESOL (Simples/Presumido sobre faturamento, ex: 0.10) */
  tributacao_empresa_pct?: number;

  custo_comissao_pct: number;
  margem_alvo_pct: number;

  // Custos operacionais reais da ESOL (NOVOS)
  /** CAC/Marketing como % do preço de venda (ex: 0.03) */
  custo_marketing_pct?: number;
  /** OpEx fixo de engenharia por projeto: ART + projeto + protocolo (R$) */
  custo_engenharia_fixo_brl?: number;
  /** SG&A rateado como % do preço de venda (ex: 0.05) */
  custo_overhead_pct?: number;
  /** Provisão de garantia/pós-venda como % do projeto (ex: 0.008) */
  custo_garantia_pct?: number;

  // Parâmetros de economia ajustada (honestidade comercial)
  /** Taxa mínima mensal de disponibilidade — monofásico/bifásico (30 kWh × tarifa, R$) */
  custo_disponibilidade_mono_brl?: number;
  /** Taxa mínima mensal de disponibilidade — trifásico (100 kWh × tarifa, R$) */
  custo_disponibilidade_tri_brl?: number;
  /** COSIP municipal estimada (não abatida pelo solar, R$/mês) */
  cosip_estimada_brl?: number;
  /** % do Fio B cobrado sobre energia compensada (Lei 14.300/2022): 2026=0.60 */
  percentual_fio_b?: number;

  // Operacional
  validade_proposta_dias: number;
  capacidade_instaladores_kwp_mes: number;
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

// HSP específico por UF (Atlas INPE/LABREN, médias anuais 2024)
// Oferece granularidade maior que as 5 macrorregiões
const HSP_POR_ESTADO: Record<string, number> = {
  // Norte
  AC: 4.7, AP: 4.6, AM: 4.5, PA: 4.6, RO: 4.8, RR: 4.7, TO: 5.0,
  // Nordeste
  AL: 5.5, BA: 5.6, CE: 5.8, MA: 5.4, PB: 5.7, PE: 5.6,
  PI: 5.9, RN: 5.8, SE: 5.4,
  // Centro-Oeste
  DF: 5.2, GO: 5.2, MT: 5.4, MS: 5.1,
  // Sudeste
  ES: 5.0, MG: 5.1, RJ: 4.9, SP: 4.8,
  // Sul
  PR: 4.4, RS: 4.6, SC: 4.5,
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

/** Retorna o HSP mais preciso disponível: por UF, depois por região, depois fallback */
export function hspForEstado(p: Parametros, uf?: string | null): number {
  if (uf) {
    const hspUf = HSP_POR_ESTADO[uf.toUpperCase()];
    if (hspUf) return hspUf;
  }
  const regiao = regiaoFromEstado(uf);
  return hspForRegiao(p, regiao);
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
  /** Tipo de ligação elétrica do cliente (para custo de disponibilidade correto) */
  ligacao?: "mono" | "tri";
  preco_override?: number;
  kwp_override?: number;
  qtd_modulos_override?: number;
  comissao_percent_override?: number;
  custo_equipamentos_override?: number;
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

  // Economia simples (para exibição interna/engenharia)
  economia_mensal: number;
  economia_anual: number;
  economia_25_anos: number;
  payback_meses: number;

  // Economia ajustada (para exibição ao cliente — honesta, com descontos)
  custo_disponibilidade_mensal: number;
  cosip_mensal: number;
  ajuste_fio_b_mensal: number;
  economia_ajustada_mensal: number;
  economia_ajustada_anual: number;
  economia_ajustada_25_anos: number;
  payback_ajustado_meses: number;
  reducao_percentual_real: number;

  // Métricas de atratividade financeira avançadas (Fase 2)
  tir_anual_pct: number;
  vpl_brl: number;

  preco_total: number;
  preco_por_wp: number;
  co2_evitado_ton: number;
  arvores_equivalentes: number;

  // Análise de custos bruta (admin)
  custo_equipamentos: number;
  custo_instalacao: number;
  custo_frete: number;
  custo_impostos_compra: number;
  custo_comissao: number;
  margem_bruta: number;
  margem_bruta_pct: number;

  // Análise de custos operacionais reais (admin — lucro líquido)
  custo_tributacao_empresa: number;
  custo_marketing: number;
  custo_engenharia_fixo: number;
  custo_overhead: number;
  custo_garantia: number;
  custos_operacionais_totais: number;
  lucro_liquido_real: number;
  lucro_liquido_pct: number;

  /** @deprecated use margem_bruta */
  custos_totais: number;
  /** @deprecated use margem_bruta */
  margem_real: number;
  /** @deprecated use margem_bruta_pct */
  margem_pct: number;
}

export function calcularProposta(input: CalculoInput, p: Parametros): CalculoResultado {
  const regiao = regiaoFromEstado(input.estado);
  // Usa HSP por UF se disponível (mais preciso), senão recorre à macrorregião
  const hsp = hspForEstado(p, input.estado);
  const eficiencia = 1 - p.perdas_sistema;

  // kWp ideal = consumo diário / (HSP × eficiência)
  const consumoDiario = input.consumo_kwh / 30;
  const kwpIdeal = consumoDiario / (hsp * eficiencia);

  // Arredonda para cima ao múltiplo do módulo
  const modulosFloat = (kwpIdeal * 1000) / p.potencia_modulo_w;
  const qtd_modulos = input.qtd_modulos_override ?? Math.max(2, Math.ceil(modulosFloat));
  const kwp_sistema = input.kwp_override ?? +(qtd_modulos * p.potencia_modulo_w / 1000).toFixed(2);
 
  // CORREÇÃO: Dimensionamento de Inversores por Overload ideal de 25% (relação 1.25 CC/CA)
  const potencia_total_inversores_kw = +(kwp_sistema / 1.25).toFixed(2);
  let qtd_inversores = 1;
  if (potencia_total_inversores_kw > 100) {
    // Para grandes potências, usa inversores de 75 kW comerciais
    qtd_inversores = Math.ceil(potencia_total_inversores_kw / 75);
  }
  const potencia_inversor_kw = +(potencia_total_inversores_kw / qtd_inversores).toFixed(2);

  const area_necessaria_m2 = +(qtd_modulos * p.area_por_modulo_m2).toFixed(1);
  const geracao_mensal_kwh = +(kwp_sistema * hsp * 30 * eficiencia).toFixed(0);
  
  // CORREÇÃO ANOMALIA 1: A economia bruta reflete o valor total da geração produzida pelo sistema (Aneel créditos)
  const economia_mensal = +(geracao_mensal_kwh * input.tarifa_kwh).toFixed(2);
  const economia_anual = +(economia_mensal * 12).toFixed(2);

  // Economia 25 anos simples (bruta) com inflação composta
  let acumulado = 0;
  for (let ano = 0; ano < p.vida_util_anos; ano++) {
    acumulado += economia_anual * Math.pow(1 + p.inflacao_energetica, ano);
  }
  const economia_25_anos = +acumulado.toFixed(2);

  // =====================================================================
  // PREÇO E VALORES DO PROJETO (Movido para cima para permitir provisionamento de O&M)
  // =====================================================================
  const comissao_pct = input.comissao_percent_override !== undefined && input.comissao_percent_override !== null
    ? input.comissao_percent_override / 100
    : p.custo_comissao_pct;
  const impostos_compra_pct = p.custo_impostos_compra_pct ?? p.custo_impostos_pct ?? 0.03;

  const preco_por_wp = input.preco_override 
    ? (kwp_sistema > 0 ? +(input.preco_override / (kwp_sistema * 1000)).toFixed(2) : 0)
    : precoPorWp(p, input.tipo, kwp_sistema);

  let preco_total = input.preco_override;
  if (preco_total === undefined || preco_total === null) {
    if (input.custo_equipamentos_override !== undefined && input.custo_equipamentos_override !== null) {
      const divisor = 1 - (p.custo_instalacao_pct + p.custo_frete_pct + impostos_compra_pct + comissao_pct + p.margem_alvo_pct);
      
      // Proteção de segurança matemática contra divisor negativo/nulo
      preco_total = +(input.custo_equipamentos_override / (divisor > 0.05 ? divisor : 0.05)).toFixed(2);
    } else {
      preco_total = +(kwp_sistema * 1000 * preco_por_wp).toFixed(2);
    }
  }

  // =====================================================================
  // ECONOMIA AJUSTADA — Cálculo Realista com Provisões de Longo Prazo
  // =====================================================================
  const ehTrifasico = input.ligacao === "tri";
  
  // Custo de disponibilidade baseado na tarifa do cliente ou parâmetro real
  const taxa_minima_kwh = ehTrifasico ? 100 : 30;
  const custo_disponibilidade_mensal = ehTrifasico
    ? (p.custo_disponibilidade_tri_brl || +(100 * input.tarifa_kwh).toFixed(2))
    : (p.custo_disponibilidade_mono_brl || +(30 * input.tarifa_kwh).toFixed(2));
  const cosip_mensal = p.cosip_estimada_brl ?? 25.00;

  // Ajuste do Fio B sobre energia compensada injetada (Lei 14.300/2022)
  const percentual_fio_b = p.percentual_fio_b ?? 0.60;
  const energia_injetada_estimada = geracao_mensal_kwh * 0.70; // 70% injetada, 30% autoconsumo
  const custo_fio_b_por_kwh = input.tarifa_kwh * 0.20;
  const ajuste_fio_b_mensal = +(energia_injetada_estimada * custo_fio_b_por_kwh * percentual_fio_b).toFixed(2);

  // A economia ajustada reflete a geração descontando Fio B, limitada ao consumo abatível (Consumo - Taxa Mínima)
  const maximo_compensavel = Math.max(0, input.consumo_kwh - taxa_minima_kwh);
  const economia_ajustada_mensal = +Math.max(
    0,
    (Math.min(geracao_mensal_kwh, maximo_compensavel) * input.tarifa_kwh) - ajuste_fio_b_mensal
  ).toFixed(2);
  const economia_ajustada_anual = +(economia_ajustada_mensal * 12).toFixed(2);

  // CORREÇÃO: Loop de 25 anos com provisão anual de O&M e troca do inversor no 12º ano
  let acumuladoAjustado = 0;
  const fluxosCaixaTIR: number[] = [];
  
  // Ano 0: Investimento inicial
  fluxosCaixaTIR.push(-preco_total);

  for (let ano = 1; ano <= p.vida_util_anos; ano++) {
    const economiaAno = economia_ajustada_anual * Math.pow(1 + p.inflacao_energetica, ano - 1);
    
    // Provisão O&M (0.5% do preço do projeto ao ano a partir do ano 2 para limpeza de placas)
    const custoOM = ano >= 2 ? +(preco_total * 0.005).toFixed(2) : 0;
    
    // Provisão Substituição de Inversor (15% do preço do projeto no 12º ano)
    const custoInversor = ano === 12 ? +(preco_total * 0.15).toFixed(2) : 0;
    
    // Fluxo líquido da economia real do ano
    const fluxoLiquidoAno = +(economiaAno - custoOM - custoInversor).toFixed(2);
    
    acumuladoAjustado += fluxoLiquidoAno;
    fluxosCaixaTIR.push(fluxoLiquidoAno);
  }
  const economia_ajustada_25_anos = +acumuladoAjustado.toFixed(2);

  // CORREÇÃO: Métricas financeiras corporativas TIR e VPL (TMA de 10% a.a.)
  const tir_anual_pct = calcularTIR(fluxosCaixaTIR);
  const vpl_brl = calcularVPL(fluxosCaixaTIR, 0.10); // 10% a.a. Taxa Mínima de Atratividade (TMA)

  const payback_meses = economia_mensal > 0 ? +(preco_total / economia_mensal).toFixed(1) : 0;
  const payback_ajustado_meses = economia_ajustada_mensal > 0
    ? +(preco_total / economia_ajustada_mensal).toFixed(1)
    : 0;

  // Redução percentual real da conta (antes do solar)
  const fatura_estimada = input.consumo_kwh * input.tarifa_kwh;
  const reducao_percentual_real = fatura_estimada > 0
    ? +Math.min(100, (economia_ajustada_mensal / fatura_estimada) * 100).toFixed(1)
    : 0;

  // CO2: ~84 kg CO2/MWh evitado (matriz BR média)
  const co2_evitado_ton = +(geracao_mensal_kwh * 12 * p.vida_util_anos * 0.084 / 1000).toFixed(2);
  const arvores_equivalentes = Math.round(co2_evitado_ton * 7);

  // =====================================================================
  // CUSTOS — Análise admin (Margem Bruta)
  // =====================================================================
  const custo_equipamentos = input.custo_equipamentos_override ?? +(preco_total * p.custo_equipamentos_pct).toFixed(2);
  const custo_instalacao = +(preco_total * p.custo_instalacao_pct).toFixed(2);
  const custo_frete = +(preco_total * p.custo_frete_pct).toFixed(2);

  // Impostos de compra: usa novo campo, cai para o legado se não existir
  const custo_impostos_compra = +(preco_total * impostos_compra_pct).toFixed(2);
  const custo_comissao = +(preco_total * comissao_pct).toFixed(2);

  const custos_brutos = custo_equipamentos + custo_instalacao + custo_frete + custo_impostos_compra + custo_comissao;
  const margem_bruta = +(preco_total - custos_brutos).toFixed(2);
  const margem_bruta_pct = +(margem_bruta / preco_total).toFixed(4);

  // =====================================================================
  // CUSTOS OPERACIONAIS REAIS — Lucro Líquido Real
  // =====================================================================
  const tributacao_pct = p.tributacao_empresa_pct ?? 0.10;
  const marketing_pct = p.custo_marketing_pct ?? 0.03;
  const overhead_pct = p.custo_overhead_pct ?? 0.05;
  const garantia_pct = p.custo_garantia_pct ?? 0.008;
  const engenharia_fixo = p.custo_engenharia_fixo_brl ?? 900;

  // Tributação incide sobre o serviço (Faturamento - Custo de Equipamentos)
  const custo_tributacao_empresa = +((preco_total - custo_equipamentos) * tributacao_pct).toFixed(2);
  const custo_marketing = +(preco_total * marketing_pct).toFixed(2);
  const custo_engenharia_fixo_val = +engenharia_fixo.toFixed(2);
  const custo_overhead = +(preco_total * overhead_pct).toFixed(2);
  const custo_garantia = +(preco_total * garantia_pct).toFixed(2);

  const custos_operacionais_totais = custo_tributacao_empresa + custo_marketing + custo_engenharia_fixo_val + custo_overhead + custo_garantia;
  const lucro_liquido_real = +(margem_bruta - custos_operacionais_totais).toFixed(2);
  const lucro_liquido_pct = +(lucro_liquido_real / preco_total).toFixed(4);

  return {
    regiao, hsp, kwp_sistema, qtd_modulos, potencia_modulo_w: p.potencia_modulo_w,
    qtd_inversores, potencia_inversor_kw, area_necessaria_m2,
    geracao_mensal_kwh, economia_mensal, economia_anual, economia_25_anos, payback_meses,
    // Economia ajustada
    custo_disponibilidade_mensal, cosip_mensal, ajuste_fio_b_mensal,
    economia_ajustada_mensal, economia_ajustada_anual, economia_ajustada_25_anos,
    payback_ajustado_meses, reducao_percentual_real,
    
    // Métricas financeiras avançadas (Fase 2)
    tir_anual_pct,
    vpl_brl,

    preco_total, preco_por_wp, co2_evitado_ton, arvores_equivalentes,
    // Custos brutos
    custo_equipamentos, custo_instalacao, custo_frete, custo_impostos_compra, custo_comissao,
    margem_bruta, margem_bruta_pct,
    // Lucro líquido
    custo_tributacao_empresa, custo_marketing, custo_engenharia_fixo: custo_engenharia_fixo_val,
    custo_overhead, custo_garantia, custos_operacionais_totais, lucro_liquido_real, lucro_liquido_pct,
    // Legados (retrocompatibilidade)
    custos_totais: custos_brutos,
    margem_real: margem_bruta,
    margem_pct: margem_bruta_pct,
  };
}

// CORREÇÃO: Métodos numéricos para análise de atratividade de capital
export function calcularVPL(fluxos: number[], taxaAtratividade: number): number {
  let vpl = 0;
  for (let t = 0; t < fluxos.length; t++) {
    vpl += fluxos[t] / Math.pow(1 + taxaAtratividade, t);
  }
  return +vpl.toFixed(2);
}

export function calcularTIR(fluxos: number[]): number {
  const somaFluxosFuturos = fluxos.slice(1).reduce((a, b) => a + b, 0);
  if (somaFluxosFuturos <= 0 || fluxos[0] >= 0) return 0;

  let min = -0.99; // -99%
  let max = 3.0;   // 300%
  let tir = 0.0;
  
  // Bisseção rápida para convergir com precisão decimal em 60 iterações
  for (let i = 0; i < 60; i++) {
    tir = (min + max) / 2;
    let vpl = 0;
    for (let t = 0; t < fluxos.length; t++) {
      vpl += fluxos[t] / Math.pow(1 + tir, t);
    }
    
    if (Math.abs(vpl) < 0.01) {
      break;
    }
    
    if (vpl > 0) {
      min = tir; // taxa maior necessária para diminuir o VPL
    } else {
      max = tir; // taxa menor necessária para aumentar o VPL
    }
  }
  
  return +(tir * 100).toFixed(2);
}

export const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const NUM = (n: number, d = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
