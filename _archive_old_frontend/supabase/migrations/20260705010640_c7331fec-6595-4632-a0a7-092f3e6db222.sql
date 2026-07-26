-- Motor Reverso v3 — garantindo colunas legadas ausentes
ALTER TABLE public.parametros_comerciais
  ADD COLUMN IF NOT EXISTS tributacao_empresa_pct         NUMERIC DEFAULT 0.06,
  ADD COLUMN IF NOT EXISTS custo_impostos_compra_pct      NUMERIC DEFAULT 0.045,
  ADD COLUMN IF NOT EXISTS custo_overhead_pct             NUMERIC DEFAULT 0.04,
  ADD COLUMN IF NOT EXISTS custo_garantia_pct             NUMERIC DEFAULT 0.007,
  ADD COLUMN IF NOT EXISTS custo_engenharia_fixo_brl      NUMERIC DEFAULT 950,
  ADD COLUMN IF NOT EXISTS cosip_estimada_brl             NUMERIC DEFAULT 22,
  ADD COLUMN IF NOT EXISTS custo_disponibilidade_mono_brl NUMERIC DEFAULT 26.40,
  ADD COLUMN IF NOT EXISTS custo_disponibilidade_tri_brl  NUMERIC DEFAULT 88.00,
  ADD COLUMN IF NOT EXISTS percentual_fio_b               NUMERIC DEFAULT 0.45,
  ADD COLUMN IF NOT EXISTS custo_marketing_pct            NUMERIC DEFAULT 0.05;

ALTER TABLE public.parametros_comerciais
  ADD COLUMN IF NOT EXISTS lucro_alvo_pct           NUMERIC DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS comissao_padrao_pct      NUMERIC DEFAULT 0.08,
  ADD COLUMN IF NOT EXISTS custo_marketing_fixo_brl NUMERIC DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS inst_ceramico_kwp        NUMERIC DEFAULT 250,
  ADD COLUMN IF NOT EXISTS inst_metalico_kwp        NUMERIC DEFAULT 200,
  ADD COLUMN IF NOT EXISTS inst_laje_kwp            NUMERIC DEFAULT 300,
  ADD COLUMN IF NOT EXISTS inst_solo_kwp            NUMERIC DEFAULT 220,
  ADD COLUMN IF NOT EXISTS inst_especial_kwp        NUMERIC DEFAULT 380,
  ADD COLUMN IF NOT EXISTS inst_adicional_grande_kwp NUMERIC DEFAULT 80,
  ADD COLUMN IF NOT EXISTS custo_frete_por_100km_kwp NUMERIC DEFAULT 2.50,
  ADD COLUMN IF NOT EXISTS custo_frete_minimo_brl    NUMERIC DEFAULT 350;

COMMENT ON COLUMN public.parametros_comerciais.lucro_alvo_pct IS 'Meta de Lucro Líquido do Motor Reverso (ex: 0.15 = 15%).';
COMMENT ON COLUMN public.parametros_comerciais.comissao_padrao_pct IS 'Comissão padrão para parceiros/consultores.';
COMMENT ON COLUMN public.parametros_comerciais.custo_marketing_fixo_brl IS 'CAC/Marketing fixo por projeto em R$.';
COMMENT ON COLUMN public.parametros_comerciais.inst_ceramico_kwp IS 'Instalação em telhado cerâmico por kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.inst_metalico_kwp IS 'Instalação em telhado metálico por kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.inst_laje_kwp IS 'Instalação em laje por kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.inst_solo_kwp IS 'Instalação em solo por kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.inst_especial_kwp IS 'Instalação especial (>45°) por kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.inst_adicional_grande_kwp IS 'Adicional por kWp acima de 20 kWp (R$).';
COMMENT ON COLUMN public.parametros_comerciais.custo_frete_por_100km_kwp IS 'Frete por kWp a cada 100km ao CD (R$).';
COMMENT ON COLUMN public.parametros_comerciais.custo_frete_minimo_brl IS 'Frete mínimo por projeto (R$).';

UPDATE public.parametros_comerciais SET
  tributacao_empresa_pct         = 0.06,
  custo_overhead_pct             = 0.04,
  custo_garantia_pct             = 0.007,
  custo_engenharia_fixo_brl      = 950,
  cosip_estimada_brl             = 22,
  custo_disponibilidade_mono_brl = 26.40,
  custo_disponibilidade_tri_brl  = 88.00;

UPDATE public.parametros_comerciais SET
  lucro_alvo_pct            = COALESCE(lucro_alvo_pct, 0.15),
  comissao_padrao_pct       = COALESCE(comissao_padrao_pct, 0.08),
  custo_marketing_fixo_brl  = COALESCE(custo_marketing_fixo_brl, 1000),
  inst_ceramico_kwp         = COALESCE(inst_ceramico_kwp, 250),
  inst_metalico_kwp         = COALESCE(inst_metalico_kwp, 200),
  inst_laje_kwp             = COALESCE(inst_laje_kwp, 300),
  inst_solo_kwp             = COALESCE(inst_solo_kwp, 220),
  inst_especial_kwp         = COALESCE(inst_especial_kwp, 380),
  inst_adicional_grande_kwp = COALESCE(inst_adicional_grande_kwp, 80),
  custo_frete_por_100km_kwp = COALESCE(custo_frete_por_100km_kwp, 2.50),
  custo_frete_minimo_brl    = COALESCE(custo_frete_minimo_brl, 350);

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS tipo_telhado       TEXT DEFAULT 'ceramico',
  ADD COLUMN IF NOT EXISTS eh_admin_proposta  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS distribuidora_id   TEXT;

COMMENT ON COLUMN public.propostas.tipo_telhado IS 'Tipo de telhado: ceramico, metalico, laje, solo, especial.';
COMMENT ON COLUMN public.propostas.eh_admin_proposta IS 'True = proposta gerada diretamente pela empresa (sem comissão).';
COMMENT ON COLUMN public.propostas.distribuidora_id IS 'ID do distribuidor — usado para calcular frete real.';

CREATE OR REPLACE VIEW public.parametros_publicos AS
SELECT
  id,
  lucro_alvo_pct, comissao_padrao_pct, custo_marketing_fixo_brl,
  inst_ceramico_kwp, inst_metalico_kwp, inst_laje_kwp, inst_solo_kwp, inst_especial_kwp, inst_adicional_grande_kwp,
  custo_frete_por_100km_kwp, custo_frete_minimo_brl,
  tributacao_empresa_pct, custo_impostos_compra_pct, custo_overhead_pct, custo_garantia_pct, custo_engenharia_fixo_brl,
  hsp_norte, hsp_nordeste, hsp_centro_oeste, hsp_sudeste, hsp_sul,
  perdas_sistema, inflacao_energetica, vida_util_anos,
  potencia_modulo_w, area_por_modulo_m2, tarifa_kwh_default,
  percentual_fio_b, cosip_estimada_brl,
  custo_disponibilidade_mono_brl, custo_disponibilidade_tri_brl,
  validade_proposta_dias, capacidade_instaladores_kwp_mes,
  margem_alvo_pct, custo_comissao_pct, custo_marketing_pct
FROM public.parametros_comerciais
LIMIT 1;

GRANT SELECT ON public.parametros_publicos TO authenticated;
GRANT SELECT ON public.parametros_publicos TO anon;