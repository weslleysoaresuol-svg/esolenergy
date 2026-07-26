import { CONCESSIONARIAS, type Concessionaria } from "./concessionarias";

export interface ConversorOptions {
  concessionariaId?: string;
  tipoInstalacao: "residencial" | "comercial" | "industrial" | "rural";
  tipoConexao: "monofasico" | "bifasico" | "trifasico";
  tarifaReferenciaDefault?: number; // fallback caso não ache a concessionária (ex: 0.95)
  cosipEstimada?: number; // iluminação pública (padrão R$ 22)
}

/**
 * Retorna a tarifa específica da concessionária com base no tipo de instalação
 */
export function obterTarifaAplicavel(options: ConversorOptions): number {
  const { concessionariaId, tipoInstalacao, tarifaReferenciaDefault = 0.95 } = options;

  if (!concessionariaId) {
    return tarifaReferenciaDefault;
  }

  const conc = CONCESSIONARIAS.find((c) => c.id === concessionariaId);
  if (!conc) {
    return tarifaReferenciaDefault;
  }

  switch (tipoInstalacao) {
    case "residencial":
      return conc.tarifa_residencial || tarifaReferenciaDefault;
    case "comercial":
      return conc.tarifa_comercial || tarifaReferenciaDefault;
    case "rural":
      return conc.tarifa_rural || tarifaReferenciaDefault;
    case "industrial":
      return conc.tarifa_industrial || tarifaReferenciaDefault;
    default:
      return tarifaReferenciaDefault;
  }
}

/**
 * Retorna o custo de disponibilidade em kWh para a conexão
 */
export function obterCustoDisponibilidadeKwh(tipoConexao: "monofasico" | "bifasico" | "trifasico", concessionariaId?: string): number {
  if (concessionariaId) {
    const conc = CONCESSIONARIAS.find((c) => c.id === concessionariaId);
    if (conc) {
      if (tipoConexao === "monofasico") return conc.custo_disponib_mono_kwh || 30;
      if (tipoConexao === "bifasico") return conc.custo_disponib_bi_kwh || 50;
      if (tipoConexao === "trifasico") return conc.custo_disponib_tri_kwh || 100;
    }
  }

  // Fallbacks padrão ANEEL
  if (tipoConexao === "monofasico") return 30;
  if (tipoConexao === "trifasico") return 100;
  return 50; // bifasico como padrão
}

/**
 * Converte o Consumo Mensal (kWh) em Valor da Fatura Estimado (R$)
 */
export function converterConsumoParaFatura(consumoKwh: number, options: ConversorOptions): number {
  const tarifa = obterTarifaAplicavel(options);
  const custoDisponibilidadeKwh = obterCustoDisponibilidadeKwh(options.tipoConexao, options.concessionariaId);
  const cosip = options.cosipEstimada ?? 22;

  // O faturamento mínimo é o custo de disponibilidade (taxa mínima)
  const consumoFaturavel = Math.max(consumoKwh, custoDisponibilidadeKwh);
  const valorEnergia = consumoFaturavel * tarifa;

  return Math.round(valorEnergia + cosip);
}

/**
 * Converte o Valor da Fatura (R$) em Consumo Mensal Estimado (kWh)
 */
export function converterFaturaParaConsumo(valorFatura: number, options: ConversorOptions): number {
  const tarifa = obterTarifaAplicavel(options);
  const custoDisponibilidadeKwh = obterCustoDisponibilidadeKwh(options.tipoConexao, options.concessionariaId);
  const cosip = options.cosipEstimada ?? 22;

  // Subtrai a taxa de iluminação pública estimativa
  const valorEnergia = Math.max(0, valorFatura - cosip);
  const consumoEstimado = valorEnergia / tarifa;

  // Se o valor cobrado foi menor/igual à taxa mínima de disponibilidade
  if (consumoEstimado <= custoDisponibilidadeKwh) {
    return custoDisponibilidadeKwh;
  }

  return Math.round(consumoEstimado);
}
