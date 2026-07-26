-- ADICIONA COLUNAS PARA A ESTEIRA COMERCIAL SOLAR (PEDIDOS & FINANCIAMENTOS)
ALTER TABLE public.pedidos 
    ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
    ADD COLUMN IF NOT EXISTS transacao_dados JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS kit_sugerido_id UUID REFERENCES public.kits_solares(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS kit_sugerido_aprovado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS contrato_cliente_url TEXT,
    ADD COLUMN IF NOT EXISTS contrato_cliente_status VARCHAR(50) DEFAULT 'pendente';

ALTER TABLE public.financiamentos
    ADD COLUMN IF NOT EXISTS contrato_banco_url TEXT,
    ADD COLUMN IF NOT EXISTS comprovante_financiamento_url TEXT;

-- ADICIONA NOVOS STATUS OPERACIONAIS NO ENUM DE PEDIDOS DO POSTGRESQL
ALTER TYPE public.pedido_status ADD VALUE IF NOT EXISTS 'analise_tecnica';
ALTER TYPE public.pedido_status ADD VALUE IF NOT EXISTS 'assinatura_contrato';
