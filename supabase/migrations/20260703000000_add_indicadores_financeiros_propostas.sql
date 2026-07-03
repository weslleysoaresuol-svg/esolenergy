-- Adiciona colunas financeiras e regulatórias na tabela de propostas
ALTER TABLE public.propostas
ADD COLUMN IF NOT EXISTS economia_ajustada_mensal numeric,
ADD COLUMN IF NOT EXISTS economia_ajustada_anual numeric,
ADD COLUMN IF NOT EXISTS economia_ajustada_25_anos numeric,
ADD COLUMN IF NOT EXISTS payback_ajustado_meses numeric,
ADD COLUMN IF NOT EXISTS tir_anual_pct numeric,
ADD COLUMN IF NOT EXISTS vpl_brl numeric,
ADD COLUMN IF NOT EXISTS custo_disponibilidade_mensal numeric,
ADD COLUMN IF NOT EXISTS ajuste_fio_b_mensal numeric;

-- Adiciona colunas financeiras e regulatórias na tabela de cotações
ALTER TABLE public.cotacoes
ADD COLUMN IF NOT EXISTS economia_ajustada_mensal numeric,
ADD COLUMN IF NOT EXISTS economia_ajustada_anual numeric,
ADD COLUMN IF NOT EXISTS economia_ajustada_25_anos numeric,
ADD COLUMN IF NOT EXISTS payback_ajustado_meses numeric,
ADD COLUMN IF NOT EXISTS tir_anual_pct numeric,
ADD COLUMN IF NOT EXISTS vpl_brl numeric,
ADD COLUMN IF NOT EXISTS custo_disponibilidade_mensal numeric,
ADD COLUMN IF NOT EXISTS ajuste_fio_b_mensal numeric;
