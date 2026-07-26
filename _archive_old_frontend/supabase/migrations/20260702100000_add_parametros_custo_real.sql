-- Migration: Novos campos de custo operacional real e ajuste de economia do cliente
-- Separa tributação da empresa dos impostos de compra, adiciona CAC, OpEx, Overhead,
-- Garantia, Custo de Disponibilidade, COSIP e Fio B para cálculo de margem líquida real.

ALTER TABLE public.parametros_comerciais

  -- P1.A: Desagregar o antigo campo genérico de impostos em dois precisos
  ADD COLUMN IF NOT EXISTS custo_impostos_compra_pct    NUMERIC DEFAULT 0.03,
  ADD COLUMN IF NOT EXISTS tributacao_empresa_pct       NUMERIC DEFAULT 0.10,

  -- P1.B: Novos custos operacionais da ESOL Energy por projeto
  ADD COLUMN IF NOT EXISTS custo_marketing_pct          NUMERIC DEFAULT 0.03,
  ADD COLUMN IF NOT EXISTS custo_engenharia_fixo_brl    NUMERIC DEFAULT 900,
  ADD COLUMN IF NOT EXISTS custo_overhead_pct           NUMERIC DEFAULT 0.05,
  ADD COLUMN IF NOT EXISTS custo_garantia_pct           NUMERIC DEFAULT 0.008,

  -- P2.A: Parâmetros de desconto para economia projetada honesta ao cliente
  ADD COLUMN IF NOT EXISTS custo_disponibilidade_mono_brl  NUMERIC DEFAULT 28.50,
  ADD COLUMN IF NOT EXISTS custo_disponibilidade_tri_brl   NUMERIC DEFAULT 95.00,
  ADD COLUMN IF NOT EXISTS cosip_estimada_brl              NUMERIC DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS percentual_fio_b                NUMERIC DEFAULT 0.60;

COMMENT ON COLUMN public.parametros_comerciais.custo_impostos_compra_pct   IS 'ICMS-ST e PIS/COFINS sobre compra de equipamentos (ex: 0.03 = 3%)';
COMMENT ON COLUMN public.parametros_comerciais.tributacao_empresa_pct      IS 'Alíquota efetiva do regime tributário da ESOL (Simples/Presumido sobre faturamento)';
COMMENT ON COLUMN public.parametros_comerciais.custo_marketing_pct         IS 'CAC / Marketing alocado como % do preço de venda (ex: 0.03 = 3%)';
COMMENT ON COLUMN public.parametros_comerciais.custo_engenharia_fixo_brl   IS 'Custo fixo de engenharia por projeto: ART, projeto elétrico, protocolo concessionária (R$)';
COMMENT ON COLUMN public.parametros_comerciais.custo_overhead_pct          IS 'SG&A rateado como % do preço de venda (ex: 0.05 = 5%)';
COMMENT ON COLUMN public.parametros_comerciais.custo_garantia_pct          IS 'Provisão para garantia/pós-venda como % do projeto (ex: 0.008 = 0.8%)';
COMMENT ON COLUMN public.parametros_comerciais.custo_disponibilidade_mono_brl IS 'Custo de disponibilidade mensal (ligação monofásica/bifásica): 30 kWh × tarifa (R$)';
COMMENT ON COLUMN public.parametros_comerciais.custo_disponibilidade_tri_brl  IS 'Custo de disponibilidade mensal (ligação trifásica): 100 kWh × tarifa (R$)';
COMMENT ON COLUMN public.parametros_comerciais.cosip_estimada_brl          IS 'COSIP (Iluminação Pública) municipal estimada por mês - não é abatida pelo solar (R$)';
COMMENT ON COLUMN public.parametros_comerciais.percentual_fio_b            IS 'Percentual do Fio B cobrado sobre energia compensada (Lei 14.300/2022): 2026=0.60, 2027=0.75';
