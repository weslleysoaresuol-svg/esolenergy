-- Migration: Adicionar espelho de custos operacionais e margem de lucro líquido a propostas e cotações
-- Permite gravar de forma imutável o estado financeiro da operação no ato da geração da proposta ou cotação.

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS fornecedor text,
  ADD COLUMN IF NOT EXISTS custo_equipamentos numeric,
  ADD COLUMN IF NOT EXISTS custo_instalacao numeric,
  ADD COLUMN IF NOT EXISTS custo_frete numeric,
  ADD COLUMN IF NOT EXISTS custo_impostos_compra numeric,
  ADD COLUMN IF NOT EXISTS custo_comissao numeric,
  ADD COLUMN IF NOT EXISTS custo_tributacao_empresa numeric,
  ADD COLUMN IF NOT EXISTS custo_marketing numeric,
  ADD COLUMN IF NOT EXISTS custo_engenharia_fixo numeric,
  ADD COLUMN IF NOT EXISTS custo_overhead numeric,
  ADD COLUMN IF NOT EXISTS custo_garantia numeric,
  ADD COLUMN IF NOT EXISTS custos_operacionais_totais numeric,
  ADD COLUMN IF NOT EXISTS lucro_liquido_real numeric,
  ADD COLUMN IF NOT EXISTS lucro_liquido_pct numeric,
  ADD COLUMN IF NOT EXISTS margem_bruta numeric;

COMMENT ON COLUMN public.propostas.fornecedor IS 'Fornecedor/Distribuidor do kit solar associado';
COMMENT ON COLUMN public.propostas.custo_equipamentos IS 'Custo de aquisição de equipamentos (módulos, inversores, estruturas) no ato da proposta';
COMMENT ON COLUMN public.propostas.custo_instalacao IS 'Custo estimado de instalação/mão de obra';
COMMENT ON COLUMN public.propostas.custo_frete IS 'Custo estimado de frete logístico';
COMMENT ON COLUMN public.propostas.custo_impostos_compra IS 'Custo estimado de impostos sobre compra (ICMS-ST, PIS, COFINS)';
COMMENT ON COLUMN public.propostas.custo_comissao IS 'Custo de comissão do parceiro/corretor do canal';
COMMENT ON COLUMN public.propostas.custo_tributacao_empresa IS 'Alíquota tributária efetiva incidente sobre a venda da ESOL';
COMMENT ON COLUMN public.propostas.custo_marketing IS 'Custo de marketing/CAC alocado ao projeto';
COMMENT ON COLUMN public.propostas.custo_engenharia_fixo IS 'OpEx fixo de engenharia (projeto, ART, homologação)';
COMMENT ON COLUMN public.propostas.custo_overhead IS 'SG&A administrativo rateado ao projeto';
COMMENT ON COLUMN public.propostas.custo_garantia IS 'Provisão de garantia/pós-venda acumulada';
COMMENT ON COLUMN public.propostas.custos_operacionais_totais IS 'Soma total dos custos operacionais reais corporativos';
COMMENT ON COLUMN public.propostas.lucro_liquido_real IS 'Lucro líquido real final da operação';
COMMENT ON COLUMN public.propostas.lucro_liquido_pct IS 'Margem de lucro líquido real (%)';
COMMENT ON COLUMN public.propostas.margem_bruta IS 'Margem bruta da operação (Preço de Venda - Custos Diretos)';


ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS fornecedor text,
  ADD COLUMN IF NOT EXISTS custo_equipamentos numeric,
  ADD COLUMN IF NOT EXISTS custo_instalacao numeric,
  ADD COLUMN IF NOT EXISTS custo_frete numeric,
  ADD COLUMN IF NOT EXISTS custo_impostos_compra numeric,
  ADD COLUMN IF NOT EXISTS custo_comissao numeric,
  ADD COLUMN IF NOT EXISTS custo_tributacao_empresa numeric,
  ADD COLUMN IF NOT EXISTS custo_marketing numeric,
  ADD COLUMN IF NOT EXISTS custo_engenharia_fixo numeric,
  ADD COLUMN IF NOT EXISTS custo_overhead numeric,
  ADD COLUMN IF NOT EXISTS custo_garantia numeric,
  ADD COLUMN IF NOT EXISTS custos_operacionais_totais numeric,
  ADD COLUMN IF NOT EXISTS lucro_liquido_real numeric,
  ADD COLUMN IF NOT EXISTS lucro_liquido_pct numeric,
  ADD COLUMN IF NOT EXISTS margem_bruta numeric;

COMMENT ON COLUMN public.cotacoes.fornecedor IS 'Fornecedor/Distribuidor do kit solar associado';
COMMENT ON COLUMN public.cotacoes.custo_equipamentos IS 'Custo de aquisição de equipamentos no ato da cotação';
COMMENT ON COLUMN public.cotacoes.custo_instalacao IS 'Custo estimado de instalação/mão de obra';
COMMENT ON COLUMN public.cotacoes.custo_frete IS 'Custo estimado de frete logístico';
COMMENT ON COLUMN public.cotacoes.custo_impostos_compra IS 'Custo estimado de impostos sobre compra (ICMS-ST, PIS, COFINS)';
COMMENT ON COLUMN public.cotacoes.custo_comissao IS 'Custo de comissão do parceiro/corretor do canal';
COMMENT ON COLUMN public.cotacoes.custo_tributacao_empresa IS 'Alíquota tributária efetiva incidente sobre a venda da ESOL';
COMMENT ON COLUMN public.cotacoes.custo_marketing IS 'Custo de marketing/CAC alocado ao projeto';
COMMENT ON COLUMN public.cotacoes.custo_engenharia_fixo IS 'OpEx fixo de engenharia (projeto, ART, homologação)';
COMMENT ON COLUMN public.cotacoes.custo_overhead IS 'SG&A administrativo rateado ao projeto';
COMMENT ON COLUMN public.cotacoes.custo_garantia IS 'Provisão de garantia/pós-venda acumulada';
COMMENT ON COLUMN public.cotacoes.custos_operacionais_totais IS 'Soma total dos custos operacionais reais corporativos';
COMMENT ON COLUMN public.cotacoes.lucro_liquido_real IS 'Lucro líquido real final da operação';
COMMENT ON COLUMN public.cotacoes.lucro_liquido_pct IS 'Margem de lucro líquido real (%)';
COMMENT ON COLUMN public.cotacoes.margem_bruta IS 'Margem bruta da operação (Preço de Venda - Custos Diretos)';
