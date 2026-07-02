-- Migration: Adicionar controle de congelamento de comissão na tabela profiles
-- Para permitir que corretores individuais fiquem travados em tarifas específicas

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS comissao_congelada BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.comissao_congelada IS 'Indica se a comissão individual deste parceiro está congelada e não deve ser alterada pela comissão geral definida no cockpit.';
