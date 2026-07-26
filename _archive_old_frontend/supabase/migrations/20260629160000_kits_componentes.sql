-- Migration: adiciona coluna componentes na tabela de kits
ALTER TABLE public.kits_produtos
  ADD COLUMN IF NOT EXISTS componentes TEXT[];

COMMENT ON COLUMN public.kits_produtos.componentes IS 'Lista de itens e componentes inclusos no kit (ex: cabos, conectores, estruturas)';
