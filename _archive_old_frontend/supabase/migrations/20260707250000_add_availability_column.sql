-- MIGRATION: Adiciona coluna de disponibilidade na tabela kits_produtos

ALTER TABLE public.kits_produtos 
ADD COLUMN IF NOT EXISTS disponibilidade VARCHAR(50) NOT NULL DEFAULT 'disponivel';

-- Constraint CHECK para valores permitidos
ALTER TABLE public.kits_produtos 
DROP CONSTRAINT IF EXISTS check_disponibilidade_valida;

ALTER TABLE public.kits_produtos 
ADD CONSTRAINT check_disponibilidade_valida 
CHECK (disponibilidade IN ('disponivel', 'indisponivel', 'sob_consulta'));
