-- ============================================================
-- Motor Reverso v3 — ESOL Energy
-- 
-- CONCEITO:
--   O admin define o Lucro Líquido Alvo (%).
--   O motor calcula o PREÇO MÍNIMO DE VENDA automaticamente
--   que garante exatamente este lucro após todos os custos reais.
--
-- REGRA DE COMISSÃO:
--   Admin/Sócio: comissão = R$ 0 (lucro integral para a empresa)
--   Parceiro: comissão = % definido no perfil
--
-- FÓRMULA:
--   P = C_fixos / (1 - p_var - lucro_alvo)
-- ============================================================

-- ── 1. MOTOR & MARGENS (parametros_comerciais) ────────────────────────────────

ALTER TABLE public.parametros_comerciais

  -- Meta do Motor Reverso (campo principal — substituiu margem_alvo_pct)
  ADD COLUMN IF NOT EXISTS lucro_alvo_pct          NUMERIC DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS comissao_padrao_pct      NUMERIC DEFAULT 0.08,

  -- Custo de Marketing agora é FIXO por projeto (R$), não percentual
  ADD COLUMN IF NOT EXISTS custo_marketing_fixo_brl NUMERIC DEFAULT 1000,

  -- Calculadora de Instalação — custo por kWp por tipo de telhado
  ADD COLUMN IF NOT EXISTS inst_ceramico_kwp        NUMERIC DEFAULT 250,
  ADD COLUMN IF NOT EXISTS inst_metalico_kwp        NUMERIC DEFAULT 200,
  ADD COLUMN IF NOT EXISTS inst_laje_kwp            NUMERIC DEFAULT 300,
  ADD COLUMN IF NOT EXISTS inst_solo_kwp            NUMERIC DEFAULT 220,
  ADD COLUMN IF NOT EXISTS inst_especial_kwp        NUMERIC DEFAULT 380,
  ADD COLUMN IF NOT EXISTS inst_adicional_grande_kwp NUMERIC DEFAULT 80,

  -- Calculadora de Frete — baseada em distância ao CD
  ADD COLUMN IF NOT EXISTS custo_frete_por_100km_kwp NUMERIC DEFAULT 2.50,
  ADD COLUMN IF NOT EXISTS custo_frete_minimo_brl    NUMERIC DEFAULT 350;

-- Comentários dos novos campos
COMMENT ON COLUMN public.parametros_comerciais.lucro_alvo_pct IS
  'Meta de Lucro Líquido definida pelo admin no Cockpit (ex: 0.15 = 15%). Campo principal do Motor Reverso.';
COMMENT ON COLUMN public.parametros_comerciais.comissao_padrao_pct IS
  'Comissão padrão para parceiros/consultores (ex: 0.08 = 8%). Zero para propostas diretas da empresa.';
COMMENT ON COLUMN public.parametros_comerciais.custo_marketing_fixo_brl IS
  'CAC/Marketing: custo fixo por projeto em R$ (padrão: R$ 1.000). Não é percentual.';
COMMENT ON COLUMN public.parametros_comerciais.inst_ceramico_kwp IS
  'Custo de instalação em telhado cerâmico (colonial/romana) por kWp (R$, ref: R$ 250).';
COMMENT ON COLUMN public.parametros_comerciais.inst_metalico_kwp IS
  'Custo de instalação em telhado metálico/fibrocimento por kWp (R$, ref: R$ 200).';
COMMENT ON COLUMN public.parametros_comerciais.inst_laje_kwp IS
  'Custo de instalação em laje/concreto por kWp (R$, ref: R$ 300).';
COMMENT ON COLUMN public.parametros_comerciais.inst_solo_kwp IS
  'Custo de instalação em solo (ground mounting) por kWp (R$, ref: R$ 220).';
COMMENT ON COLUMN public.parametros_comerciais.inst_especial_kwp IS
  'Custo de instalação especial (inclinação > 45°) por kWp (R$, ref: R$ 380).';
COMMENT ON COLUMN public.parametros_comerciais.inst_adicional_grande_kwp IS
  'Custo adicional por kWp para sistemas acima de 20 kWp (R$, ref: R$ 80/kWp excedente).';
COMMENT ON COLUMN public.parametros_comerciais.custo_frete_por_100km_kwp IS
  'Custo de frete por kWp a cada 100km de distância ao CD do distribuidor (R$, ref: R$ 2.50).';
COMMENT ON COLUMN public.parametros_comerciais.custo_frete_minimo_brl IS
  'Frete mínimo por projeto independente da distância (R$, ref: R$ 350).';

-- ── 2. Atualizar defaults nos campos legados para valores corretos de mercado ──

-- Corrigir tributação: de 10% para 6% (Simples Nacional faixa 2, mais comum nas integradoras)
UPDATE public.parametros_comerciais
SET
  tributacao_empresa_pct        = 0.06,
  custo_overhead_pct            = 0.04,
  custo_garantia_pct            = 0.007,
  custo_engenharia_fixo_brl     = 950,
  cosip_estimada_brl            = 22,
  custo_disponibilidade_mono_brl = 26.40,
  custo_disponibilidade_tri_brl  = 88.00;

-- Inicializar todos os novos campos nos registros existentes
UPDATE public.parametros_comerciais
SET
  lucro_alvo_pct            = COALESCE(lucro_alvo_pct, 0.15),
  comissao_padrao_pct       = COALESCE(comissao_padrao_pct, 0.08),
  custo_marketing_fixo_brl  = COALESCE(custo_marketing_fixo_brl, 1000),
  inst_ceramico_kwp         = COALESCE(inst_ceramico_kwp, 250),
  inst_metalico_kwp         = COALESCE(inst_metalico_kwp, 200),
  inst_laje_kwp             = COALESCE(inst_laje_kwp, 300),
  inst_solo_kwp             = COALESCE(inst_solo_kwp, 220),
  inst_especial_kwp         = COALESCE(inst_especial_kwp, 380),
  inst_adicional_grande_kwp  = COALESCE(inst_adicional_grande_kwp, 80),
  custo_frete_por_100km_kwp  = COALESCE(custo_frete_por_100km_kwp, 2.50),
  custo_frete_minimo_brl     = COALESCE(custo_frete_minimo_brl, 350);

-- ── 3. PROPOSTAS — novos campos do motor reverso ──────────────────────────────

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS tipo_telhado       TEXT DEFAULT 'ceramico',
  ADD COLUMN IF NOT EXISTS eh_admin_proposta  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS distribuidora_id   TEXT;

COMMENT ON COLUMN public.propostas.tipo_telhado IS
  'Tipo de telhado da instalação: ceramico, metalico, laje, solo, especial.';
COMMENT ON COLUMN public.propostas.eh_admin_proposta IS
  'True = proposta gerada diretamente pela empresa (sem comissão de parceiro).';
COMMENT ON COLUMN public.propostas.distribuidora_id IS
  'ID do distribuidor de kits escolhido — usado para calcular frete real baseado na distância ao CD.';

-- ── 4. VIEW PÚBLICA ATUALIZADA para o motor reverso ──────────────────────────

CREATE OR REPLACE VIEW public.parametros_publicos AS
SELECT
  id,

  -- Motor Reverso (NOVOS)
  lucro_alvo_pct,
  comissao_padrao_pct,
  custo_marketing_fixo_brl,

  -- Calculadora de Instalação (NOVOS)
  inst_ceramico_kwp,
  inst_metalico_kwp,
  inst_laje_kwp,
  inst_solo_kwp,
  inst_especial_kwp,
  inst_adicional_grande_kwp,

  -- Calculadora de Frete (NOVOS)
  custo_frete_por_100km_kwp,
  custo_frete_minimo_brl,

  -- Custos Operacionais
  tributacao_empresa_pct,
  custo_impostos_compra_pct,
  custo_overhead_pct,
  custo_garantia_pct,
  custo_engenharia_fixo_brl,

  -- Parâmetros Técnicos
  hsp_norte, hsp_nordeste, hsp_centro_oeste, hsp_sudeste, hsp_sul,
  perdas_sistema, inflacao_energetica, vida_util_anos,
  potencia_modulo_w, area_por_modulo_m2,
  tarifa_kwh_default,

  -- Economia Honesta
  percentual_fio_b, cosip_estimada_brl,
  custo_disponibilidade_mono_brl, custo_disponibilidade_tri_brl,

  -- Operacional
  validade_proposta_dias, capacidade_instaladores_kwp_mes,

  -- Legado (retrocompatibilidade)
  margem_alvo_pct,
  custo_comissao_pct,
  custo_marketing_pct

FROM public.parametros_comerciais
LIMIT 1;

GRANT SELECT ON public.parametros_publicos TO authenticated;
GRANT SELECT ON public.parametros_publicos TO anon;
