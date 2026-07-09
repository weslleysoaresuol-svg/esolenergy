-- MIGRATION: Adição da categoria na tabela de produtos/kits

-- Adiciona a coluna categoria com valor padrão 'kit'
ALTER TABLE public.kits_produtos 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) NOT NULL DEFAULT 'kit';

-- Adiciona constraint check para garantir categorias válidas
ALTER TABLE public.kits_produtos 
DROP CONSTRAINT IF EXISTS check_categoria_valida;

ALTER TABLE public.kits_produtos 
ADD CONSTRAINT check_categoria_valida 
CHECK (categoria IN ('kit', 'modulo', 'inversor', 'estrutura', 'bateria', 'acessorio'));

-- Classifica retroativamente os registros cadastrados com base no nome
UPDATE public.kits_produtos
SET categoria = 'modulo'
WHERE (LOWER(nome) LIKE '%painel%' OR LOWER(nome) LIKE '%módulo%' OR LOWER(nome) LIKE '%modulo%' OR LOWER(nome) LIKE '%placa%')
  AND NOT (LOWER(nome) LIKE '%kit%' OR LOWER(nome) LIKE '%gerador%');

UPDATE public.kits_produtos
SET categoria = 'inversor'
WHERE (LOWER(nome) LIKE '%inversor%' OR LOWER(nome) LIKE '%microinversor%')
  AND NOT (LOWER(nome) LIKE '%kit%' OR LOWER(nome) LIKE '%gerador%');
