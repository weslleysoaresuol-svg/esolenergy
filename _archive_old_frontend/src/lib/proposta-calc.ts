// Motor de Precificação Reversa — ESOL Energy
// Versão 3.0 — Backward Pricing Engine
//
// CONCEITO:
//   Admin define Lucro Líquido Alvo (%) no Cockpit.
//   O motor coleta todos os custos REAIS das calculadoras integradas
//   e resolve algebricamente o PREÇO MÍNIMO DE VENDA que garante
//   exatamente o lucro alvo — com precisão absoluta.
//
// REGRA DE COMISSÃO:
//   - Admin/Sócio: comissão = R$ 0 (lucro 100% para a empresa)
//   - Parceiro externo: comissão = % definido no perfil do parceiro
//
// FÓRMULA DO MOTOR REVERSO:
//   C_fixos = kit + instalação + frete + impostos_compra + engenharia + marketing
//   p_var   = tributação + overhead + garantia + [comissão se parceiro]
//   P       = C_fixos / (1 - p_var - lucro_alvo_pct)

import { getDistanciaCD } from "./concessionarias";
import { obterCustoDisponibilidadeKwh } from "./conversor-fatura";

// ─── Tipos e Enumerações ──────────────────────────────────────────────────────

export type Regiao = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";
export type TipoInstalacao = "residencial" | "comercial" | "industrial" | "rural";
export type TipoTelhado = "ceramico" | "metalico" | "laje" | "solo" | "especial";

// ─── Interface de Parâmetros (Configuráveis no Painel) ────────────────────────

export interface Parametros {
  id?: string;

  // ── Motor & Margens ─────────────────────────────────────────────
  /** Meta de Lucro Líquido definida pelo admin no Cockpit (ex: 0.15 = 15%) */
  lucro_alvo_pct: number;

  /** Alíquota do regime tributário da empresa (Simples Nac. faixa 2 = 0.06) */
  tributacao_empresa_pct: number;

  /** Comissão padrão para novos parceiros (ex: 0.08 = 8%) */
  comissao_padrao_pct: number;

  /** Overhead / SG&A como % do preço de venda (ex: 0.04 = 4%) */
  custo_overhead_pct: number;

  /** Provisão de Garantia e Pós-venda como % do preço de venda (ex: 0.007 = 0.7%) */
  custo_garantia_pct: number;

  /** Custo FIXO de Marketing/CAC por projeto em R$ (padrão: R$ 1.000) */
  custo_marketing_fixo_brl: number;

  /** Custo fixo de Engenharia por projeto: ART + projeto + protocolo (R$, padrão: R$ 950) */
  custo_engenharia_fixo_brl: number;

  /** Impostos de Compra de equipamentos: ICMS-ST + PIS/COFINS (ex: 0.03 = 3%) */
  custo_impostos_compra_pct: number;

  // ── Calculadora de Instalação (R$/kWp por tipo de telhado) ──────
  inst_ceramico_kwp: number;     // R$ 250
  inst_metalico_kwp: number;     // R$ 200
  inst_laje_kwp: number;         // R$ 300
  inst_solo_kwp: number;         // R$ 220
  inst_especial_kwp: number;     // R$ 380
  inst_adicional_grande_kwp: number; // R$ 80 adicional para kWp > 20

  // ── Calculadora de Frete ────────────────────────────────────────
  /** Custo de frete por kWp a cada 100km (R$) */
  custo_frete_por_100km_kwp: number;  // R$ 2.50
  /** Valor mínimo de frete por projeto (R$) */
  custo_frete_minimo_brl: number;     // R$ 350

  // ── Parâmetros Técnicos ─────────────────────────────────────────
  /** HSP fallback por macrorregião — usados quando UF não mapeada */
  hsp_norte: number;
  hsp_nordeste: number;
  hsp_centro_oeste: number;
  hsp_sudeste: number;
  hsp_sul: number;

  perdas_sistema: number;          // 0.18
  inflacao_energetica: number;     // 0.08
  vida_util_anos: number;          // 25
  potencia_modulo_w: number;       // 555
  area_por_modulo_m2: number;      // 2.73

  // ── Parâmetros de Economia Honesta (para propostas ao cliente) ──
  percentual_fio_b: number;           // 0.60 (Lei 14.300/2022, vigência 2026)
  cosip_estimada_brl: number;         // R$ 22/mês
  custo_disponibilidade_mono_brl?: number;  // calculado dinamicamente se não definido
  custo_disponibilidade_tri_brl?: number;

  // ── Operacional ─────────────────────────────────────────────────
  validade_proposta_dias: number;           // 30
  capacidade_instaladores_kwp_mes: number;  // 50

  /** Tarifa de referência nacional — usada como fallback quando UF/concessionária não informada */
  tarifa_kwh_default: number;  // 0.88

  // ── Legado — mantidos para retrocompatibilidade ─────────────────
  /** @deprecated Usar custo_impostos_compra_pct */
  custo_impostos_pct?: number;
  /** @deprecated Calculado pelo motor reverso */
  margem_alvo_pct?: number;
  /** @deprecated Substituído por inst_* por tipo de telhado */
  custo_instalacao_pct?: number;
  /** @deprecated Substituído pela calculadora de frete */
  custo_frete_pct?: number;
  /** @deprecated Substituído por lucro_alvo_pct */
  custo_marketing_pct?: number;
  /** @deprecated Substituído por custo_marketing_fixo_brl */
  custo_equipamentos_pct?: number;
  preco_wp_residencial_pequeno?: number;
  preco_wp_residencial_grande?: number;
  preco_wp_comercial_pequeno?: number;
  preco_wp_comercial_grande?: number;
  preco_wp_industrial?: number;
}

/** Valores padrão de mercado 2025 — pré-configurados ao criar novo tenant */
export const PARAMETROS_DEFAULT: Omit<Parametros, "id"> = {
  // Motor & Margens
  lucro_alvo_pct: 0.15,
  tributacao_empresa_pct: 0.06,
  comissao_padrao_pct: 0.08,
  custo_overhead_pct: 0.04,
  custo_garantia_pct: 0.007,
  custo_marketing_fixo_brl: 1000,
  custo_engenharia_fixo_brl: 950,
  custo_impostos_compra_pct: 0.03,

  // Calculadora de Instalação
  inst_ceramico_kwp: 250,
  inst_metalico_kwp: 200,
  inst_laje_kwp: 300,
  inst_solo_kwp: 220,
  inst_especial_kwp: 380,
  inst_adicional_grande_kwp: 80,

  // Calculadora de Frete
  custo_frete_por_100km_kwp: 2.50,
  custo_frete_minimo_brl: 350,

  // Técnicos
  hsp_norte: 4.7,
  hsp_nordeste: 5.6,
  hsp_centro_oeste: 5.2,
  hsp_sudeste: 4.9,
  hsp_sul: 4.5,
  perdas_sistema: 0.18,
  inflacao_energetica: 0.08,
  vida_util_anos: 25,
  potencia_modulo_w: 555,
  area_por_modulo_m2: 2.73,

  // Economia Honesta
  percentual_fio_b: 0.60,
  cosip_estimada_brl: 22,

  // Operacional
  validade_proposta_dias: 30,
  capacidade_instaladores_kwp_mes: 50,
  tarifa_kwh_default: 0.88,
};

// ─── Mapeamento Estado → Região ───────────────────────────────────────────────

const ESTADO_REGIAO: Record<string, Regiao> = {
  AC: "norte", AP: "norte", AM: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste", PE: "nordeste",
  PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro_oeste", GO: "centro_oeste", MT: "centro_oeste", MS: "centro_oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};

const HSP_POR_ESTADO: Record<string, number> = {
  AC: 4.7, AP: 4.6, AM: 4.5, PA: 4.6, RO: 4.8, RR: 4.7, TO: 5.0,
  AL: 5.5, BA: 5.6, CE: 5.8, MA: 5.4, PB: 5.7, PE: 5.6, PI: 5.9, RN: 5.8, SE: 5.4,
  DF: 5.2, GO: 5.2, MT: 5.4, MS: 5.1,
  ES: 5.0, MG: 5.1, RJ: 4.9, SP: 4.8,
  PR: 4.4, RS: 4.6, SC: 4.5,
};

export function regiaoFromEstado(uf?: string | null): Regiao {
  if (!uf) return "sudeste";
  return ESTADO_REGIAO[uf.toUpperCase()] ?? "sudeste";
}

export function hspForEstado(p: Parametros, uf?: string | null): number {
  if (uf) {
    const hspUf = HSP_POR_ESTADO[uf.toUpperCase()];
    if (hspUf) return hspUf;
  }
  const r = regiaoFromEstado(uf);
  switch (r) {
    case "norte": return p.hsp_norte;
    case "nordeste": return p.hsp_nordeste;
    case "centro_oeste": return p.hsp_centro_oeste;
    case "sudeste": return p.hsp_sudeste;
    case "sul": return p.hsp_sul;
  }
}

// ─── Calculadora de Instalação ────────────────────────────────────────────────

/** Retorna o custo de mão de obra de instalação em R$ para o sistema inteiro */
export function calcularCustoInstalacao(kwp: number, tipoTelhado: TipoTelhado, p: Parametros): number {
  let custoBase: number;
  const d = PARAMETROS_DEFAULT;
  switch (tipoTelhado) {
    case "ceramico":  custoBase = p.inst_ceramico_kwp ?? d.inst_ceramico_kwp; break;
    case "metalico":  custoBase = p.inst_metalico_kwp ?? d.inst_metalico_kwp; break;
    case "laje":      custoBase = p.inst_laje_kwp ?? d.inst_laje_kwp; break;
    case "solo":      custoBase = p.inst_solo_kwp ?? d.inst_solo_kwp; break;
    case "especial":  custoBase = p.inst_especial_kwp ?? d.inst_especial_kwp; break;
    default:          custoBase = p.inst_ceramico_kwp ?? d.inst_ceramico_kwp;
  }
  const adicionalGrande = kwp > 20 ? (kwp - 20) * (p.inst_adicional_grande_kwp ?? d.inst_adicional_grande_kwp) : 0;
  return +((kwp * custoBase) + adicionalGrande).toFixed(2);
}

// ─── Calculadora de Frete ─────────────────────────────────────────────────────

/** Retorna o multiplicador de frete com base na dificuldade logística regional e redespacho */
export function getMultiplicadorRegiao(uf: string): number {
  if (!uf) return 1.0;
  const ufUpper = uf.trim().toUpperCase();
  
  // Região Norte (AC, AM, AP, PA, RO, RR, TO) — Muito alto, redespacho fluvial/balsa e longas distâncias
  if (["PA", "AM", "AC", "RO", "RR", "AP", "TO"].includes(ufUpper)) return 2.4;
  
  // Região Nordeste (AL, BA, CE, MA, PB, PE, PI, RN, SE) — Alto, longas distâncias
  if (["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"].includes(ufUpper)) return 1.8;
  
  // Região Centro-Oeste (DF, GO, MT, MS) — Médio
  if (["MT", "MS", "GO", "DF"].includes(ufUpper)) return 1.4;
  
  // Região Sudeste (RJ, MG, ES) — Leve acréscimo
  if (["RJ", "MG", "ES"].includes(ufUpper)) return 1.1;
  
  // Região Sul + SP (Origem principal da maioria dos CDs)
  return 1.0;
}

/** Retorna o custo estimado de frete em R$ */
export function calcularCustoFrete(
  kwp: number,
  distribuidoraId: string | null | undefined,
  uf_destino: string | null | undefined,
  p: Parametros
): number {
  const d = PARAMETROS_DEFAULT;
  const freteMinimo = p.custo_frete_minimo_brl ?? d.custo_frete_minimo_brl;
  if (!distribuidoraId || !uf_destino) return freteMinimo;
  
  const distancia = getDistanciaCD(distribuidoraId, uf_destino);
  const mult = getMultiplicadorRegiao(uf_destino);
  
  // Calcula o custo base e o mínimo ajustado regionalmente
  const custoBase = kwp * (distancia / 100) * (p.custo_frete_por_100km_kwp ?? d.custo_frete_por_100km_kwp) * mult;
  const minimoRegional = freteMinimo * mult;
  
  return +Math.max(custoBase, minimoRegional).toFixed(2);
}

// ─── MOTOR REVERSO — Precificação Garantindo Lucro Alvo ──────────────────────

export interface BreakdownCustos {
  // Custos Diretos Fixos
  c_kit: number;
  c_instalacao: number;
  c_frete: number;
  c_impostos_compra: number;
  c_engenharia: number;
  c_marketing: number;          // FIXO R$ 1.000 — não percentual
  c_comissao: number;           // 0 se admin
  // Custos Operacionais (% sobre P)
  c_tributacao: number;
  c_overhead: number;
  c_garantia: number;
  // Totais
  c_total: number;
  lucro_liquido: number;
  lucro_liquido_pct: number;
  // Flags
  eh_admin: boolean;
  comissao_pct_aplicada: number; // 0 se admin
}

/**
 * MOTOR REVERSO — Calcula o preço mínimo de venda que garante
 * exatamente o lucro_alvo_pct definido no parâmetro p.lucro_alvo_pct.
 *
 * Fórmula:
 *   C_fixos = c_kit + c_inst + c_frete + c_imp_compra + c_eng + c_mkt + (c_kit × p_imp_compra)
 *   p_var   = tributacao + overhead + garantia + [comissao se parceiro]
 *   P_min   = C_fixos / (1 - p_var - lucro_alvo)
 */
export function calcularPrecoMinimo(
  c_kit: number,
  kwp: number,
  tipoTelhado: TipoTelhado,
  distribuidoraId: string | null | undefined,
  uf: string | null | undefined,
  ehAdmin: boolean,
  comissaoParceiroPct: number,
  p: Parametros
): { preco_minimo: number; breakdown: BreakdownCustos } {
  const d = PARAMETROS_DEFAULT;
  const lucro_alvo = p.lucro_alvo_pct ?? d.lucro_alvo_pct;
  const comissao_pct = ehAdmin ? 0 : comissaoParceiroPct;

  // Custos fixos conhecidos
  const c_instalacao    = calcularCustoInstalacao(kwp, tipoTelhado, p);
  const c_frete         = calcularCustoFrete(kwp, distribuidoraId, uf, p);
  const c_imp_compra    = +(c_kit * (p.custo_impostos_compra_pct ?? d.custo_impostos_compra_pct)).toFixed(2);
  const c_engenharia    = p.custo_engenharia_fixo_brl ?? d.custo_engenharia_fixo_brl;
  const c_marketing     = p.custo_marketing_fixo_brl ?? d.custo_marketing_fixo_brl;

  const C_fixos = c_kit + c_instalacao + c_frete + c_imp_compra + c_engenharia + c_marketing;

  // Percentuais variáveis sobre o preço final P
  const p_tributacao = p.tributacao_empresa_pct ?? 0.06;
  const p_overhead   = p.custo_overhead_pct ?? 0.04;
  const p_garantia   = p.custo_garantia_pct ?? 0.007;
  const p_var = p_tributacao + p_overhead + p_garantia + comissao_pct;

  const divisor = 1 - p_var - lucro_alvo;

  // Proteção matemática: se divisor <= 0, os custos variáveis + lucro >= 100%
  // Isso indicaria parâmetros impossíveis — retorna aviso seguro
  if (divisor <= 0.05) {
    const preco_emergencia = C_fixos / 0.05;
    const breakdown: BreakdownCustos = {
      c_kit, c_instalacao, c_frete, c_impostos_compra: c_imp_compra,
      c_engenharia, c_marketing, c_comissao: 0,
      c_tributacao: 0, c_overhead: 0, c_garantia: 0,
      c_total: C_fixos, lucro_liquido: 0, lucro_liquido_pct: 0,
      eh_admin: ehAdmin, comissao_pct_aplicada: comissao_pct,
    };
    return { preco_minimo: +preco_emergencia.toFixed(2), breakdown };
  }

  const preco_minimo = +(C_fixos / divisor).toFixed(2);

  // Recalcula valores absolutos com o preço determinado
  const c_comissao    = ehAdmin ? 0 : +(preco_minimo * comissao_pct).toFixed(2);
  const c_tributacao  = +(preco_minimo * p_tributacao).toFixed(2);
  const c_overhead    = +(preco_minimo * p_overhead).toFixed(2);
  const c_garantia    = +(preco_minimo * p_garantia).toFixed(2);

  const c_total = C_fixos + c_comissao + c_tributacao + c_overhead + c_garantia;
  const lucro_liquido = +(preco_minimo - c_total).toFixed(2);
  const lucro_liquido_pct = +(lucro_liquido / preco_minimo).toFixed(4);

  const breakdown: BreakdownCustos = {
    c_kit, c_instalacao, c_frete, c_impostos_compra: c_imp_compra,
    c_engenharia, c_marketing, c_comissao,
    c_tributacao, c_overhead, c_garantia,
    c_total, lucro_liquido, lucro_liquido_pct,
    eh_admin: ehAdmin, comissao_pct_aplicada: comissao_pct,
  };

  return { preco_minimo, breakdown };
}

// ─── Interfaces de Input/Output do Motor Principal ────────────────────────────

export interface CalculoInput {
  consumo_kwh: number;
  tarifa_kwh: number;
  estado?: string | null;
  tipo: TipoInstalacao;
  tipo_telhado?: TipoTelhado;       // para calculadora de instalação
  distribuidora_id?: string | null; // para calculadora de frete
  ligacao?: "mono" | "bi" | "tri";
  concessionaria_id?: string | null;

  // Flags de precificação
  eh_admin?: boolean;               // true = sem comissão (proposta da empresa)
  comissao_percent_override?: number; // % de comissão do parceiro

  // Overrides manuais (quando consultor ajusta manualmente)
  preco_override?: number;          // Preço de venda informado manualmente
  kwp_override?: number;
  qtd_modulos_override?: number;
  custo_equipamentos_override?: number; // Custo real do kit informado manualmente
}

export interface CalculoResultado {
  // Dimensionamento técnico
  regiao: Regiao;
  hsp: number;
  kwp_sistema: number;
  qtd_modulos: number;
  potencia_modulo_w: number;
  qtd_inversores: number;
  potencia_inversor_kw: number;
  area_necessaria_m2: number;
  geracao_mensal_kwh: number;

  // Precificação
  preco_total: number;
  preco_por_wp: number;

  // Breakdown completo de custos (transparência total)
  breakdown: BreakdownCustos;

  // Economia bruta (para análise interna)
  economia_mensal: number;
  economia_anual: number;
  economia_25_anos: number;
  payback_meses: number;

  // Economia ajustada (honesta, para apresentar ao cliente)
  custo_disponibilidade_mensal: number;
  cosip_mensal: number;
  ajuste_fio_b_mensal: number;
  economia_ajustada_mensal: number;
  economia_ajustada_anual: number;
  economia_ajustada_25_anos: number;
  payback_ajustado_meses: number;
  reducao_percentual_real: number;

  // Métricas de investimento
  tir_anual_pct: number;
  vpl_brl: number;

  // Ambiental
  co2_evitado_ton: number;
  arvores_equivalentes: number;

  // Legado (retrocompatibilidade com banco de dados e PropostaView)
  custo_equipamentos: number;
  custo_instalacao: number;
  custo_frete: number;
  custo_impostos_compra: number;
  custo_comissao: number;
  margem_bruta: number;
  margem_bruta_pct: number;
  custo_tributacao_empresa: number;
  custo_marketing: number;
  custo_engenharia_fixo: number;
  custo_overhead: number;
  custo_garantia: number;
  custos_operacionais_totais: number;
  lucro_liquido_real: number;
  lucro_liquido_pct: number;
  custos_totais: number;
  margem_real: number;
  margem_pct: number;
}

// ─── Motor Principal de Cálculo ───────────────────────────────────────────────

export function calcularProposta(input: CalculoInput, p: Parametros): CalculoResultado {
  const regiao = regiaoFromEstado(input.estado);
  const hsp = hspForEstado(p, input.estado);
  const eficiencia = 1 - p.perdas_sistema;

  // Dimensionamento técnico
  const consumoDiario = input.consumo_kwh / 30;
  const kwpIdeal = consumoDiario / (hsp * eficiencia);
  const modulosFloat = (kwpIdeal * 1000) / p.potencia_modulo_w;
  const qtd_modulos = input.qtd_modulos_override ?? Math.max(2, Math.ceil(modulosFloat));
  const kwp_sistema = input.kwp_override ?? +(qtd_modulos * p.potencia_modulo_w / 1000).toFixed(2);

  // Dimensionamento de inversores (overload ideal 25%)
  const potencia_total_inv = +(kwp_sistema / 1.25).toFixed(2);
  let qtd_inversores = 1;
  if (potencia_total_inv > 100) qtd_inversores = Math.ceil(potencia_total_inv / 75);
  const potencia_inversor_kw = +(potencia_total_inv / qtd_inversores).toFixed(2);
  const area_necessaria_m2 = +(qtd_modulos * p.area_por_modulo_m2).toFixed(1);
  const geracao_mensal_kwh = +(kwp_sistema * hsp * 30 * eficiencia).toFixed(0);

  // Tarifa — usa concessionária informada, depois fallback
  const tarifa = input.tarifa_kwh > 0 ? input.tarifa_kwh : p.tarifa_kwh_default;

  // ── PRECIFICAÇÃO REVERSA ──────────────────────────────────────────────────
  const tipoTelhado: TipoTelhado = input.tipo_telhado ?? "ceramico";
  const ehAdmin = input.eh_admin ?? false;
  const comissao_pct = input.comissao_percent_override !== undefined && input.comissao_percent_override !== null
    ? input.comissao_percent_override / 100
    : (p.comissao_padrao_pct ?? 0.08);

  let preco_total: number;
  let breakdown: BreakdownCustos;

  if (input.preco_override !== undefined && input.preco_override !== null && input.preco_override > 0) {
    // Modo manual: preço informado → recalcula breakdown com o preço dado
    preco_total = input.preco_override;
    const c_kit = input.custo_equipamentos_override ?? +(preco_total * 0.48).toFixed(2);
    const calc = calcularPrecoMinimo(c_kit, kwp_sistema, tipoTelhado, input.distribuidora_id, input.estado, ehAdmin, comissao_pct, p);
    // Reconstrói breakdown com preco_override
    const c_instalacao   = calcularCustoInstalacao(kwp_sistema, tipoTelhado, p);
    const c_frete        = calcularCustoFrete(kwp_sistema, input.distribuidora_id, input.estado, p);
    const c_imp_compra   = +(c_kit * (p.custo_impostos_compra_pct ?? 0.03)).toFixed(2);
    const c_engenharia   = p.custo_engenharia_fixo_brl ?? 950;
    const c_marketing    = p.custo_marketing_fixo_brl ?? 1000;
    const c_comissao     = ehAdmin ? 0 : +(preco_total * comissao_pct).toFixed(2);
    const c_tributacao   = +(preco_total * (p.tributacao_empresa_pct ?? 0.06)).toFixed(2);
    const c_overhead     = +(preco_total * (p.custo_overhead_pct ?? 0.04)).toFixed(2);
    const c_garantia     = +(preco_total * (p.custo_garantia_pct ?? 0.007)).toFixed(2);
    const c_total        = c_kit + c_instalacao + c_frete + c_imp_compra + c_engenharia + c_marketing + c_comissao + c_tributacao + c_overhead + c_garantia;
    const lucro_liquido  = +(preco_total - c_total).toFixed(2);
    breakdown = {
      c_kit, c_instalacao, c_frete, c_impostos_compra: c_imp_compra,
      c_engenharia, c_marketing, c_comissao,
      c_tributacao, c_overhead, c_garantia,
      c_total, lucro_liquido, lucro_liquido_pct: +(lucro_liquido / preco_total).toFixed(4),
      eh_admin: ehAdmin, comissao_pct_aplicada: comissao_pct,
    };
  } else {
    // Modo automático: motor reverso calcula o preço mínimo
    const c_kit = input.custo_equipamentos_override ?? 0;
    if (c_kit > 0) {
      // Kit real informado → usa motor reverso
      const resultado = calcularPrecoMinimo(c_kit, kwp_sistema, tipoTelhado, input.distribuidora_id, input.estado, ehAdmin, comissao_pct, p);
      preco_total = resultado.preco_minimo;
      breakdown = resultado.breakdown;
    } else {
      // Sem kit real → estimativa por kWp (modo legado para compatibilidade)
      const c_kit_estimado = +(kwp_sistema * 1000 * 1.80).toFixed(2); // R$ 1.80/Wp custo médio kit
      const resultado = calcularPrecoMinimo(c_kit_estimado, kwp_sistema, tipoTelhado, input.distribuidora_id, input.estado, ehAdmin, comissao_pct, p);
      preco_total = resultado.preco_minimo;
      breakdown = resultado.breakdown;
    }
  }

  const preco_por_wp = +(preco_total / (kwp_sistema * 1000)).toFixed(2);

  // ── ECONOMIA BRUTA ────────────────────────────────────────────────────────
  const economia_mensal = +(geracao_mensal_kwh * tarifa).toFixed(2);
  const economia_anual  = +(economia_mensal * 12).toFixed(2);
  let acum = 0;
  for (let ano = 0; ano < p.vida_util_anos; ano++) {
    acum += economia_anual * Math.pow(1 + p.inflacao_energetica, ano);
  }
  const economia_25_anos = +acum.toFixed(2);
  const payback_meses = economia_mensal > 0 ? +(preco_total / economia_mensal).toFixed(1) : 0;

  // ── ECONOMIA AJUSTADA (HONESTA) ───────────────────────────────────────────
  const ehTrifasico = input.ligacao === "tri";
  const ehBifasico  = input.ligacao === "bi";
  const conexaoText = ehTrifasico ? "trifasico" : ehBifasico ? "bifasico" : "monofasico";
  const taxa_minima_kwh = obterCustoDisponibilidadeKwh(conexaoText, (input as any).concessionaria_id);

  const custo_disponibilidade_mensal = ehTrifasico
    ? (p.custo_disponibilidade_tri_brl ?? +(taxa_minima_kwh * tarifa).toFixed(2))
    : (p.custo_disponibilidade_mono_brl ?? +(taxa_minima_kwh * tarifa).toFixed(2));

  const cosip_mensal = p.cosip_estimada_brl ?? 22;
  const percentual_fio_b = p.percentual_fio_b ?? 0.60;
  const energia_injetada_est = geracao_mensal_kwh * 0.70;
  const custo_fio_b_por_kwh = tarifa * 0.20;
  const ajuste_fio_b_mensal = +(energia_injetada_est * custo_fio_b_por_kwh * percentual_fio_b).toFixed(2);

  const maximo_compensavel = Math.max(0, input.consumo_kwh - taxa_minima_kwh);
  const economia_ajustada_mensal = +Math.max(
    0,
    (Math.min(geracao_mensal_kwh, maximo_compensavel) * tarifa) - ajuste_fio_b_mensal
  ).toFixed(2);
  const economia_ajustada_anual = +(economia_ajustada_mensal * 12).toFixed(2);

  // Loop 25 anos com O&M e troca de inversor no ano 12
  let acumAj = 0;
  const fluxosTIR: number[] = [-preco_total];
  for (let ano = 1; ano <= p.vida_util_anos; ano++) {
    const economiaAno = economia_ajustada_anual * Math.pow(1 + p.inflacao_energetica, ano - 1);
    const custoOM      = ano >= 2 ? +(preco_total * 0.005).toFixed(2) : 0;
    const custoInv     = ano === 12 ? +(preco_total * 0.15).toFixed(2) : 0;
    const fluxoLiq     = +(economiaAno - custoOM - custoInv).toFixed(2);
    acumAj += fluxoLiq;
    fluxosTIR.push(fluxoLiq);
  }
  const economia_ajustada_25_anos = +acumAj.toFixed(2);

  const tir_anual_pct = calcularTIR(fluxosTIR);
  const vpl_brl = calcularVPL(fluxosTIR, 0.10);

  const payback_ajustado_meses = economia_ajustada_mensal > 0
    ? +(preco_total / economia_ajustada_mensal).toFixed(1) : 0;

  const fatura_estimada = input.consumo_kwh * tarifa;
  const reducao_percentual_real = fatura_estimada > 0
    ? +Math.min(100, (economia_ajustada_mensal / fatura_estimada) * 100).toFixed(1) : 0;

  // Ambiental
  const co2_evitado_ton = +(geracao_mensal_kwh * 12 * p.vida_util_anos * 0.084 / 1000).toFixed(2);
  const arvores_equivalentes = Math.round(co2_evitado_ton * 7);

  // ── Retrocompatibilidade (campos legados usados pelo banco e PropostaView) ─
  const margem_bruta = +(preco_total - breakdown.c_kit - breakdown.c_instalacao - breakdown.c_frete - breakdown.c_impostos_compra - breakdown.c_comissao).toFixed(2);
  const margem_bruta_pct = +(margem_bruta / preco_total).toFixed(4);
  const custos_operacionais_totais = breakdown.c_tributacao + breakdown.c_marketing + breakdown.c_engenharia + breakdown.c_overhead + breakdown.c_garantia;

  return {
    regiao, hsp, kwp_sistema, qtd_modulos, potencia_modulo_w: p.potencia_modulo_w,
    qtd_inversores, potencia_inversor_kw, area_necessaria_m2, geracao_mensal_kwh,
    preco_total, preco_por_wp,
    breakdown,
    economia_mensal, economia_anual, economia_25_anos, payback_meses,
    custo_disponibilidade_mensal, cosip_mensal, ajuste_fio_b_mensal,
    economia_ajustada_mensal, economia_ajustada_anual, economia_ajustada_25_anos,
    payback_ajustado_meses, reducao_percentual_real,
    tir_anual_pct, vpl_brl,
    co2_evitado_ton, arvores_equivalentes,
    // Campos legados
    custo_equipamentos: breakdown.c_kit,
    custo_instalacao: breakdown.c_instalacao,
    custo_frete: breakdown.c_frete,
    custo_impostos_compra: breakdown.c_impostos_compra,
    custo_comissao: breakdown.c_comissao,
    margem_bruta, margem_bruta_pct,
    custo_tributacao_empresa: breakdown.c_tributacao,
    custo_marketing: breakdown.c_marketing,
    custo_engenharia_fixo: breakdown.c_engenharia,
    custo_overhead: breakdown.c_overhead,
    custo_garantia: breakdown.c_garantia,
    custos_operacionais_totais,
    lucro_liquido_real: breakdown.lucro_liquido,
    lucro_liquido_pct: breakdown.lucro_liquido_pct,
    custos_totais: breakdown.c_total,
    margem_real: margem_bruta,
    margem_pct: margem_bruta_pct,
  };
}

// ─── Funções Financeiras ──────────────────────────────────────────────────────

export function calcularVPL(fluxos: number[], taxa: number): number {
  let vpl = 0;
  for (let t = 0; t < fluxos.length; t++) {
    vpl += fluxos[t] / Math.pow(1 + taxa, t);
  }
  return +vpl.toFixed(2);
}

export function calcularTIR(fluxos: number[]): number {
  const somaFuturos = fluxos.slice(1).reduce((a, b) => a + b, 0);
  if (somaFuturos <= 0 || fluxos[0] >= 0) return 0;
  let min = -0.99, max = 3.0, tir = 0;
  for (let i = 0; i < 60; i++) {
    tir = (min + max) / 2;
    let vpl = 0;
    for (let t = 0; t < fluxos.length; t++) vpl += fluxos[t] / Math.pow(1 + tir, t);
    if (Math.abs(vpl) < 0.01) break;
    if (vpl > 0) min = tir; else max = tir;
  }
  return +(tir * 100).toFixed(2);
}

/** Formata valor como moeda BRL */
export const BRL = (n: number) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

/** Formata número com casas decimais */
export const NUM = (n: number, d = 0) =>
  (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Label amigável para tipo de telhado */
export const TELHADO_LABEL: Record<TipoTelhado, string> = {
  ceramico: "Cerâmico (colonial / romana)",
  metalico: "Metálico / Fibrocimento",
  laje:     "Laje / Concreto",
  solo:     "Solo (ground mounting)",
  especial: "Especial (inclinação > 45°)",
};

// Mantém compatibilidade com imports existentes
export function precoPorWp(p: Parametros, _tipo: TipoInstalacao, _kwp: number): number {
  // Legado — o motor reverso não usa mais preço por Wp
  // Retorna um valor neutro para não quebrar código existente
  return p.preco_wp_residencial_pequeno ?? 3.8;
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
