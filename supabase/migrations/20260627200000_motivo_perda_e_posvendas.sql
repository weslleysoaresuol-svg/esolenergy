-- Adiciona campo motivo_perda na tabela clientes
ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS motivo_perda TEXT DEFAULT NULL;

-- Comentário dos valores esperados:
-- 'preco' | 'concorrente' | 'prazo' | 'financiamento_reprovado' | 'desistiu' | 'nao_atendeu' | 'outro'

-- Adiciona campos de pós-venda
ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS nps_score INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS nps_enviado_em TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS indicacoes_geradas INTEGER DEFAULT 0;

-- Índice para facilitar queries de leads parados
CREATE INDEX IF NOT EXISTS idx_clientes_updated_at ON public.clientes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_status_corretor ON public.clientes(status, corretor_id);

-- Adiciona campo perdido_em para medir tempo de ciclo de venda
ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS perdido_em TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS fechado_em TIMESTAMPTZ DEFAULT NULL;
