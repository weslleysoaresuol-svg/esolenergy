-- ============================================================
-- ADICIONA VÍNCULO DE KITS NAS PROPOSTAS
-- Permite armazenar e exibir a foto, inversores e módulos reais do kit na proposta do cliente
-- ============================================================

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS kit_id uuid REFERENCES public.kits_solares(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kit_nome text,
  ADD COLUMN IF NOT EXISTS kit_inversor text,
  ADD COLUMN IF NOT EXISTS kit_fabricante_modulos text,
  ADD COLUMN IF NOT EXISTS kit_imagem_url text,
  ADD COLUMN IF NOT EXISTS kit_tecnologia_modulo text,
  ADD COLUMN IF NOT EXISTS kit_garantia_modulos_anos integer,
  ADD COLUMN IF NOT EXISTS kit_garantia_inversor_anos integer;

-- Habilitar leitura pública para a política anônima dessas novas colunas
-- (as políticas gerais de SELECT já expõem todas as colunas da tabela por padrão,
--  então não é necessário recriar as políticas existentes).
